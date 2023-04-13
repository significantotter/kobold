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
import { ActionOptions } from './action-command-options.js';
import _ from 'lodash';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';

export class ActionAddAttackSubCommand implements Command {
	public names = [Language.LL.commands.action.addAttack.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.addAttack.name(),
		description: Language.LL.commands.action.addAttack.description(),
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
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);
			return await AutocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		} else if (option.name === ActionOptions.ACTION_ROLL_TARGET_DC_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_ROLL_TARGET_DC_OPTION.name);
			return await AutocompleteUtils.getAllMatchingRollsForActiveCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetAction = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);
		const rollType = 'attack';
		const rollName = intr.options.getString(ActionOptions.ACTION_ROLL_NAME_OPTION.name);
		const diceRoll = intr.options.getString(ActionOptions.ACTION_DICE_ROLL_OPTION.name);

		const rollTargetDC = intr.options.getString(
			ActionOptions.ACTION_ROLL_TARGET_DC_OPTION.name
		);
		let allowRollModifiers = intr.options.getBoolean(
			ActionOptions.ACTION_ROLL_ALLOW_MODIFIERS.name
		);
		if (allowRollModifiers === null) allowRollModifiers = true;

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
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
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.rollAlreadyExists());
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			roll: diceRoll,
			targetDC: rollTargetDC,
			allowRollModifiers,
		});

		// save the character

		await Character.query().updateAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		// send the response message
		await InteractionUtils.send(
			intr,
			LL.commands.action.addAttack.interactions.success({
				actionName: action.name,
				rollName: rollName,
			})
		);
	}
}
