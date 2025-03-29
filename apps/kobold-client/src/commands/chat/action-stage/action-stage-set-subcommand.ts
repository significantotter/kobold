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
import { Kobold } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionStageOptions } from './action-stage-command-options.js';
import _ from 'lodash';
import { LocalizedString } from 'typesafe-i18n';

export class ActionStageSetSubCommand implements Command {
	public name = L.en.commands.actionStage.set.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.actionStage.set.name(),
		description: L.en.commands.actionStage.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a roll on the character matching the autocomplete string

			const matchedActionRolls: ApplicationCommandOptionChoiceData[] = [];
			for (const action of activeCharacter.sheetRecord.actions || []) {
				for (const roll of action.rolls) {
					const rollMatchText = `${action.name.toLocaleLowerCase()} -- ${roll.name.toLocaleLowerCase()}`;
					if (rollMatchText.includes(match.toLocaleLowerCase())) {
						matchedActionRolls.push({
							name: rollMatchText,
							value: rollMatchText,
						});
					}
				}
			}

			//return the matched rolls
			return matchedActionRolls;
		}
		if (option.name === ActionStageOptions.ACTION_STAGE_EDIT_OPTION.name) {
			const allChoices = Object.entries(
				L.en.commandOptions.actionStageStageUpdateOption.choices
			).map(([name, value]: [string, any]) => ({
				name: value.name(),
				value: value.value(),
			}));

			const actionRollTarget = intr.options.getString(
				ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name
			);
			if (!actionRollTarget) return allChoices;
			const [actionName, action] = actionRollTarget.split(' -- ').map(term => term.trim());

			const match =
				intr.options.getString(ActionStageOptions.ACTION_STAGE_EDIT_OPTION.name) ?? '';

			const koboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
				activeCharacter: true,
			});

			//find a roll on the character matching the autocomplete string
			const matchedAction = activeCharacter.sheetRecord.actions.find(
				action => action.name.toLocaleLowerCase() === actionName.toLocaleLowerCase()
			);
			if (!matchedAction) {
				return allChoices;
			}
			const rollIndex = matchedAction.rolls.findIndex(
				roll => roll.name.toLocaleLowerCase() === action.toLocaleLowerCase()
			);
			if (rollIndex === -1) {
				return allChoices;
			}
			const roll = matchedAction.rolls[rollIndex];

			let validUpdateOptions: (keyof typeof L.en.commandOptions.actionStageStageUpdateOption.choices)[] =
				[];
			if (roll.type === 'attack' || roll.type === 'skill-challenge') {
				validUpdateOptions = ['name', 'attackTargetDC', 'attackRoll', 'allowRollModifiers'];
			} else if (roll.type === 'damage') {
				validUpdateOptions = [
					'name',
					'basicDamageRoll',
					'allowRollModifiers',
					'damageType',
					'healInsteadOfDamage',
				];
			} else if (roll.type === 'advanced-damage') {
				validUpdateOptions = [
					'name',
					'damageType',
					'advancedDamageSuccessRoll',
					'advancedDamageFailureRoll',
					'advancedDamageCritSuccessRoll',
					'advancedDamageCritFailureRoll',
					'allowRollModifiers',
					'healInsteadOfDamage',
				];
			} else if (roll.type === 'save') {
				validUpdateOptions = ['name', 'saveRollType', 'saveTargetDC', 'allowRollModifiers'];
			} else if (roll.type === 'text') {
				validUpdateOptions = [
					'name',
					'defaultText',
					'successText',
					'failureText',
					'criticalSuccessText',
					'criticalFailureText',
					'allowRollModifiers',
					'textExtraTags',
				];
			} else {
				return allChoices;
			}
			return Object.entries(
				_.pick(L.en.commandOptions.actionStageStageUpdateOption.choices, validUpdateOptions)
			)
				.map(([, value]) => ({
					name: value.name(),
					value: value.value(),
				}))
				.filter(choice =>
					choice.name.toLocaleLowerCase().includes(match.toLocaleLowerCase())
				);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionRollTarget = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name,
			true
		);
		const fieldToUpdate = intr.options.getString(
			ActionStageOptions.ACTION_STAGE_EDIT_OPTION.name,
			true
		);
		const moveTo = intr.options.getString(ActionStageOptions.ACTION_STAGE_MOVE_OPTION.name);
		const newValue = intr.options.getString(
			ActionStageOptions.ACTION_STAGE_EDIT_VALUE.name,
			true
		);
		const [actionName, action] = actionRollTarget.split(' -- ').map(term => term.trim());

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		//find a roll on the character matching the autocomplete string
		const matchedAction = activeCharacter.sheetRecord.actions.find(
			action => action.name.toLocaleLowerCase() === actionName.toLocaleLowerCase()
		);
		if (!matchedAction) {
			await InteractionUtils.send(intr, LL.commands.actionStage.interactions.notFound());
			return;
		}
		const rollIndex = matchedAction.rolls.findIndex(
			roll => roll.name.toLocaleLowerCase() === action.toLocaleLowerCase()
		);
		if (rollIndex === -1) {
			await InteractionUtils.send(intr, LL.commands.actionStage.interactions.rollNotFound());
			return;
		}
		const roll = matchedAction.rolls[rollIndex];

		let invalid = false;
		// validate the strings into different types based on which field is being updated
		if (roll.type === 'attack' || roll.type === 'skill-challenge') {
			if (!['name', 'targetDC', 'roll', 'allowRollModifiers'].includes(fieldToUpdate)) {
				invalid = true;
			}
		} else if (roll.type === 'damage') {
			if (
				![
					'name',
					'roll',
					'allowRollModifiers',
					'damageType',
					'healInsteadOfDamage',
				].includes(fieldToUpdate)
			) {
				invalid = true;
			}
		} else if (roll.type === 'advanced-damage') {
			if (
				![
					'name',
					'damageType',
					'successRoll',
					'failureRoll',
					'criticalSuccessRoll',
					'criticalFailureRoll',
					'allowRollModifiers',
					'healInsteadOfDamage',
				].includes(fieldToUpdate)
			) {
				invalid = true;
			}
		} else if (roll.type === 'save') {
			if (
				!['name', 'saveRollType', 'saveTargetDC', 'allowRollModifiers'].includes(
					fieldToUpdate
				)
			) {
				invalid = true;
			}
		} else if (roll.type === 'text') {
			if (
				![
					'name',
					'defaultText',
					'successText',
					'failureText',
					'criticalSuccessText',
					'criticalFailureText',
					'allowRollModifiers',
					'extraTags',
				].includes(fieldToUpdate)
			) {
				invalid = true;
			}
		} else {
			invalid = true;
		}

		if (invalid) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.set.interactions.invalidField({
					stageType: roll.type,
				})
			);
			return;
		}

		// just in case we need to update the name of the action, save it here
		const currentActionName = roll.name;

		// validate the strings into different types based on which field is being updated
		let finalValue;

		// string values
		if (
			[
				'name',
				'targetDC',
				'damageType',
				'roll',
				'successRoll',
				'failureRoll',
				'criticalSuccessRoll',
				'criticalFailureRoll',
				'defaultText',
				'successText',
				'failureText',
				'criticalSuccessText',
				'criticalFailureText',
				'saveRollType',
				'saveTargetDC',
			].includes(fieldToUpdate)
		) {
			finalValue = newValue.trim();
			if (['none', 'null', 'nil', 'undefined', ''].includes(finalValue.toLocaleLowerCase())) {
				finalValue = undefined;
			}
		}

		// boolean values
		else if (['allowRollModifiers'].includes(fieldToUpdate)) {
			finalValue = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newValue.toLocaleLowerCase().trim()
			);
		} else if (['textExtraTags'].includes(fieldToUpdate)) {
			finalValue = newValue.split(',').map(tag => tag.trim());
		} else {
			// invalid field
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.set.interactions.unknownField()
			);
			return;
		}
		// TODO improve the typing in this file to avoid this explicit any
		(roll as any)[fieldToUpdate] = finalValue;

		if (moveTo === 'top') {
			const roll = matchedAction.rolls.splice(rollIndex, 1)[0];
			matchedAction.rolls = [roll, ...matchedAction.rolls];
		} else if (moveTo === 'bottom') {
			const roll = matchedAction.rolls.splice(rollIndex, 1)[0];
			matchedAction.rolls = [...matchedAction.rolls, roll];
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{ actions: activeCharacter.sheetRecord.actions }
		);

		//send a confirmation message
		await InteractionUtils.send(
			intr,
			LL.commands.actionStage.set.interactions.success({
				actionStageOption: fieldToUpdate,
				newValue: newValue,
				actionStageName: currentActionName,
				actionName: matchedAction.name,
			})
		);
	}
}
