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
import { Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from './../modifier/modifier-command-options.js';
import _ from 'lodash';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionOptions } from './condition-command-options.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { StringUtils } from '@kobold/base-utils';

export class ConditionSetSubCommand implements Command {
	public name = L.en.commands.condition.set.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.set.name(),
		description: L.en.commands.condition.set.description(),
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
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === ConditionOptions.CONDITION_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ConditionOptions.CONDITION_NAME_OPTION.name) ?? '';
			const targetCharacterName =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			try {
				return autocompleteUtils.getConditionsOnTarget(intr, targetCharacterName, match);
			} catch (err) {
				// failed to match a target, so return []
				return [];
			}
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options
			.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name, true)
			.trim();
		const conditionName = intr.options
			.getString(ConditionOptions.CONDITION_NAME_OPTION.name, true)
			.trim();
		let fieldToChange = intr.options
			.getString(ModifierOptions.MODIFIER_SET_OPTION.name, true)
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = intr.options
			.getString(ModifierOptions.MODIFIER_SET_VALUE_OPTION.name, true)
			.trim();

		//check if we have an active character
		const { gameUtils } = new KoboldUtils(kobold);
		const { targetSheetRecord, targetName } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);

		const targetCondition = FinderHelpers.getConditionByName(targetSheetRecord, conditionName);
		if (!targetCondition) {
			// no matching condition found
			await InteractionUtils.send(intr, LL.commands.condition.interactions.notFound());
			return;
		}

		// validate the updates
		if (fieldToChange === L.en.commandOptions.modifierSetOption.choices.name.value()) {
			if (FinderHelpers.getModifierByName(targetSheetRecord, newFieldValue)) {
				throw new KoboldError(LL.commands.modifier.set.interactions.nameExistsError());
			} else {
				targetCondition.name = InputParseUtils.parseAsString(newFieldValue, {
					inputName: fieldToChange,
					minLength: 3,
					maxLength: 20,
				});
			}
		} else if (
			fieldToChange === L.en.commandOptions.modifierSetOption.choices.rollAdjustment.value()
		) {
			try {
				// we must be able to evaluate the condition as a roll for this character
				InputParseUtils.isValidDiceExpression(
					newFieldValue,
					new Creature(targetSheetRecord, undefined, intr)
				);
				targetCondition.rollAdjustment = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.condition.interactions.doesntEvaluateError()
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
				throw new KoboldError(LL.commands.condition.interactions.invalidTags());
			}
			targetCondition.rollTargetTags = newFieldValue;
		} else if (fieldToChange === 'type') {
			const newType = newFieldValue.trim().toLowerCase();
			if (!newType) targetCondition.type = SheetAdjustmentTypeEnum.untyped;
			else if (newType in SheetAdjustmentTypeEnum) {
				targetCondition.type = newType as SheetAdjustmentTypeEnum;
			} else {
				throw new KoboldError(
					`Yip! The type must be one of ${StringUtils.stringsToCommaPhrase(
						Object.values(SheetAdjustmentTypeEnum)
					)}.`
				);
			}
		} else if (fieldToChange === 'description') {
			targetCondition.description = InputParseUtils.parseAsNullableString(newFieldValue, {
				inputName: fieldToChange,
				maxLength: 300,
			});
			if (!newFieldValue) targetCondition.description = null;
			else targetCondition.description = newFieldValue;
		} else if (fieldToChange === 'initiative-note') {
			if (!newFieldValue) targetCondition.note = null;
			else
				targetCondition.note = InputParseUtils.parseAsNullableString(newFieldValue, {
					inputName: fieldToChange,
					maxLength: 40,
				});
		} else if (fieldToChange === 'severity') {
			if (newFieldValue == null) targetCondition.severity = null;
			else targetCondition.severity = InputParseUtils.parseAsNumber(newFieldValue);
		} else if (fieldToChange === 'sheet-values') {
			targetCondition.sheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				newFieldValue,
				targetCondition.type
			);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.set.interactions.invalidOptionError()
			);
			return;
		}
		// just in case the update is for the name
		const nameBeforeUpdate = targetCondition.name;

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				conditions: targetSheetRecord.conditions,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.condition.set.interactions.successEmbed.title({
				characterName: targetName,
				conditionName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
