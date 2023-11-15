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

import { compileExpression } from 'filtrex';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetAdjustmentTypeEnum } from '../../../services/kobold/index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from './modifier-command-options.js';

export class ModifierUpdateSubCommand implements Command {
	public names = [L.en.commands.modifier.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.update.name(),
		description: L.en.commands.modifier.update.description(),
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
		if (fieldToChange === 'name') {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.update.interactions.emptyNameError()
				);
				return;
				//a name can't already be a modifier
			} else if (
				FinderHelpers.getModifierByName(activeCharacter.sheetRecord, newFieldValue)
			) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.update.interactions.nameExistsError()
				);
				return;
			} else {
				targetModifier.name = newFieldValue;
			}
		} else if (fieldToChange === 'value') {
			if (targetModifier.modifierType === 'sheet') {
				throw new KoboldError(
					'Yip! Sheet modifiers don\'t have a "value". You probably meant to update the "sheet-values" field.'
				);
			}
			try {
				// we must be able to evaluate the modifier as a roll for this character
				DiceUtils.parseAndEvaluateDiceExpression({
					rollExpression: newFieldValue,
					creature: Creature.fromSheetRecord(activeCharacter.sheetRecord),
					LL: L.en,
				});
				targetModifier.value = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createRollModifier.interactions.doesntEvaluateError()
				);
				return;
			}
		} else if (fieldToChange === 'target-tags') {
			if (targetModifier.modifierType === 'sheet') {
				throw new KoboldError('Yip! Sheet modifiers don\'t have "target tags".');
			}
			fieldToChange = 'targetTags';
			// parse the target tags
			try {
				compileExpression(newFieldValue);
			} catch (err) {
				// the tags are in an invalid format
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createRollModifier.interactions.invalidTags()
				);
				return;
			}
			targetModifier.targetTags = newFieldValue;
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
			if (!newFieldValue) targetModifier.description = null;
			else targetModifier.description = newFieldValue;
		} else if (fieldToChange === 'sheet-values') {
			if (targetModifier.modifierType === 'roll') {
				throw new KoboldError(
					'Yip! Roll modifiers don\'t have "sheet values". Maybe you meant to update "value"?'
				);
			}
			targetModifier.sheetAdjustments = SheetUtils.stringToSheetAdjustments(newFieldValue);
			// attempt to use the adjustments to make sure they're valid
			SheetUtils.adjustSheetWithSheetAdjustments(
				activeCharacter.sheetRecord.sheet,
				targetModifier.sheetAdjustments
			);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.update.interactions.invalidOptionError()
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
			LL.commands.modifier.update.interactions.successEmbed.title({
				characterName: activeCharacter.name,
				modifierName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
