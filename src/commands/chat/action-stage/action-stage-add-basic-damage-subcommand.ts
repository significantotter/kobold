import { Character, CharacterModel } from '../../../services/kobold/index.js';
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

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageAddBasicDamageSubCommand implements Command {
	public names = [L.en.commands.actionStage.addBasicDamage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.actionStage.addBasicDamage.name(),
		description: L.en.commands.actionStage.addBasicDamage.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionStageOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(ActionStageOptions.ACTION_TARGET_OPTION.name) ?? '';

			return await AutocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const targetAction = intr.options.getString(
			ActionStageOptions.ACTION_TARGET_OPTION.name,
			true
		);
		const rollType = 'damage';
		const rollName = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_NAME_OPTION.name,
			true
		);
		const damageType = intr.options.getString(ActionStageOptions.ACTION_STAGE_DAMAGE_TYPE.name);
		const healInsteadOfDamage =
			intr.options.getBoolean(ActionStageOptions.ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE.name) ??
			false;
		const basicDamageDiceRoll = intr.options.getString(
			ActionStageOptions.ACTION_BASIC_DAMAGE_DICE_ROLL_OPTION.name,
			true
		);
		let allowRollModifiers = intr.options.getBoolean(
			ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS.name
		);
		if (allowRollModifiers === null) allowRollModifiers = true;

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		// find the action
		const matchedActions = CharacterUtils.findPossibleActionFromString(
			activeCharacter,
			targetAction
		);
		if (!matchedActions || !matchedActions.length) {
			await InteractionUtils.send(intr, LL.commands.actionStage.interactions.notFound());
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.interactions.rollAlreadyExists()
			);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			healInsteadOfDamage,
			roll: basicDamageDiceRoll,
			damageType: damageType,
			allowRollModifiers,
		});

		// save the character

		await CharacterModel.query().updateAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		// send the response message
		await InteractionUtils.send(
			intr,
			LL.commands.actionStage.interactions.rollAddSuccess({
				actionName: action.name,
				rollName: rollName,
				rollType: 'damage',
			})
		);
	}
}
