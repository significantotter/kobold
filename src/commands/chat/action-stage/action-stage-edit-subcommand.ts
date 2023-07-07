import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageEditSubCommand implements Command {
	public names = [Language.LL.commands.actionStage.edit.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.actionStage.edit.name(),
		description: Language.LL.commands.actionStage.edit.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a roll on the character matching the autocomplete string

			const matchedActionRolls: ApplicationCommandOptionChoiceData[] = [];
			for (const action of activeCharacter.actions || []) {
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
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const actionRollTarget = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_TARGET_OPTION.name,
			true
		);
		const fieldToEdit = intr.options.getString(
			ActionStageOptions.ACTION_STAGE_EDIT_OPTION.name,
			true
		);
		const moveTo = intr.options.getString(ActionStageOptions.ACTION_STAGE_MOVE_OPTION.name);
		const newValue = intr.options.getString(
			ActionStageOptions.ACTION_STAGE_EDIT_VALUE.name,
			true
		);
		const [actionName, action] = actionRollTarget.split(' -- ').map(term => term.trim());

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		//find a roll on the character matching the autocomplete string
		const matchedAction = activeCharacter.actions?.find(
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
		// validate the strings into different types based on which field is being edited
		if (roll.type === 'attack') {
			if (!['name', 'targetDC', 'roll', 'allowRollModifier'].includes(fieldToEdit)) {
				invalid = true;
			}
		} else if (roll.type === 'damage') {
			if (!['name', 'roll', 'allowRollModifier', 'damageType'].includes(fieldToEdit)) {
				invalid = true;
			}
		} else if (roll.type === 'advanced-damage') {
			if (
				![
					'name',
					'successRoll',
					'failureRoll',
					'criticalSuccessRoll',
					'criticalFailureRoll',
					'allowRollModifier',
				].includes(fieldToEdit)
			) {
				invalid = true;
			}
		} else if (roll.type === 'save') {
			if (
				!['name', 'saveRollType', 'saveTargetDC', 'allowRollModifier'].includes(fieldToEdit)
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
					'allowRollModifier',
					'extraTags',
				].includes(fieldToEdit)
			) {
				invalid = true;
			}
		}
		if (invalid) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.edit.interactions.invalidField({
					stageType: roll.type,
				})
			);
			return;
		}

		// just in case we need to edit the name of the action, save it here
		const currentActionName = roll.name;

		// validate the strings into different types based on which field is being edited
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
			].includes(fieldToEdit)
		) {
			finalValue = newValue.trim();
			if (['none', 'null', 'nil', 'undefined', ''].includes(finalValue.toLocaleLowerCase())) {
				finalValue = undefined;
			}
		}

		// boolean values
		else if (['allowRollModifier'].includes(fieldToEdit)) {
			finalValue = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newValue.toLocaleLowerCase().trim()
			);
		} else if (['textExtraTags'].includes(fieldToEdit)) {
			finalValue = newValue.split(',').map(tag => tag.trim());
		} else {
			// invalid field
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.edit.interactions.unknownField()
			);
			return;
		}

		if (moveTo === 'top') {
			const roll = matchedAction.rolls.splice(rollIndex, 1)[0];
			matchedAction.rolls = [roll, ...matchedAction.rolls];
		} else if (moveTo === 'bottom') {
			const roll = matchedAction.rolls.splice(rollIndex, 1)[0];
			matchedAction.rolls = [...matchedAction.rolls, roll];
		} else {
			matchedAction.rolls[rollIndex][fieldToEdit] = finalValue;
		}

		await Character.query().updateAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		//send a confirmation message
		await InteractionUtils.send(
			intr,
			LL.commands.actionStage.edit.interactions.success({
				actionStageOption: fieldToEdit,
				newValue: newValue,
				actionStageName: currentActionName,
				actionName: matchedAction.name,
			})
		);
	}
}
