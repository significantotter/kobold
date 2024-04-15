import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetAdjustmentTypeEnum } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from './modifier-command-options.js';
import _ from 'lodash';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

export class ModifierSetSubCommand implements Command {
	public names = [L.en.commands.modifier.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.set.name(),
		description: L.en.commands.modifier.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = FinderHelpers.matchAllModifiers(
				activeCharacter.sheetRecord,
				match
			).map(modifier => ({
				name: modifier.name,
				value: modifier.name,
			}));
			//return the matched saves
			return matchedModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const modifierName = intr.options
			.getString(ModifierOptions.MODIFIER_NAME_OPTION.name, true)
			.trim();
		let fieldToChange = intr.options
			.getString(ModifierOptions.MODIFIER_SET_OPTION.name, true)
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = intr.options
			.getString(ModifierOptions.MODIFIER_SET_VALUE_OPTION.name, true)
			.trim();

		//check if we have an active character
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const targetModifier = FinderHelpers.getModifierByName(
			activeCharacter.sheetRecord,
			modifierName
		);
		if (!targetModifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.notFound());
			return;
		}

		// validate the updates
		if (fieldToChange === L.en.commandOptions.modifierSetOption.choices.name.value()) {
			if (FinderHelpers.getModifierByName(activeCharacter.sheetRecord, newFieldValue)) {
				throw new KoboldError(LL.commands.modifier.set.interactions.nameExistsError());
			} else {
				targetModifier.name = InputParseUtils.parseAsString(newFieldValue, {
					minLength: 3,
					maxLength: 20,
				});
			}
		} else if (
			fieldToChange === L.en.commandOptions.modifierSetOption.choices.rollAdjustment.value()
		) {
			try {
				// we must be able to evaluate the modifier as a roll for this character
				InputParseUtils.isValidDiceExpression(
					newFieldValue,
					new Creature(activeCharacter.sheetRecord)
				);
				targetModifier.rollAdjustment = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createModifier.interactions.doesntEvaluateError()
				);
				return;
			}
		} else if (
			fieldToChange === L.en.commandOptions.modifierSetOption.choices.rollTargetTags.value()
		) {
			fieldToChange = 'rollTargetTags';
			// parse the target tags
			if (!InputParseUtils.isValidRollTargetTags(newFieldValue)) {
				// the tags are in an invalid format
				throw new KoboldError(
					LL.commands.modifier.createModifier.interactions.invalidTags.toString()
				);
			}
			targetModifier.rollTargetTags = newFieldValue;
		} else if (fieldToChange === 'type') {
			const newType = newFieldValue.trim().toLowerCase();
			if (!newType) targetModifier.type = SheetAdjustmentTypeEnum.untyped;
			else if (newType in SheetAdjustmentTypeEnum) {
				targetModifier.type = newType as SheetAdjustmentTypeEnum;
			} else {
				throw new KoboldError(
					`Yip! The type must be one of ${StringUtils.stringsToCommaPhrase(
						Object.values(SheetAdjustmentTypeEnum)
					)}.`
				);
			}
		} else if (fieldToChange === 'description') {
			targetModifier.description = InputParseUtils.parseAsNullableString(newFieldValue, {
				maxLength: 300,
			});
			if (!newFieldValue) targetModifier.description = null;
			else targetModifier.description = newFieldValue;
		} else if (fieldToChange === 'note') {
			if (!newFieldValue) targetModifier.note = null;
			else
				targetModifier.note = InputParseUtils.parseAsNullableString(newFieldValue, {
					maxLength: 40,
				});
		} else if (fieldToChange === 'severity') {
			targetModifier.severity = InputParseUtils.parseAsNullableNumber(newFieldValue);
		} else if (fieldToChange === 'sheet-values') {
			targetModifier.sheetAdjustments =
				InputParseUtils.parseAsSheetAdjustments(newFieldValue);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.set.interactions.invalidOptionError()
			);
			return;
		}
		// just in case the update is for the name
		const nameBeforeUpdate = targetModifier.name;

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				modifiers: activeCharacter.sheetRecord.modifiers,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.modifier.set.interactions.successEmbed.title({
				characterName: activeCharacter.name,
				modifierName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
