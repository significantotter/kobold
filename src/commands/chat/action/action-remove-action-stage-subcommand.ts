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

export class ActionRemoveActionStageSubCommand implements Command {
	public names = [Language.LL.commands.action.removeActionStage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.removeActionStage.name(),
		description: Language.LL.commands.action.removeActionStage.description(),
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
		console.log(option.name);
		if (option.name === ActionOptions.ACTION_ROLL_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_ROLL_TARGET_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a roll on the character matching the autocomplete string

			const matchedActionRolls: ApplicationCommandOptionChoiceData[] = [];
			for (const action of activeCharacter.actions || []) {
				for (const roll of action.rolls) {
					const rollMatchText = `${action.name.toLocaleLowerCase()} -- ${roll.name.toLocaleLowerCase()}`;
					console.log(rollMatchText, match);
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
			ActionOptions.ACTION_ROLL_TARGET_OPTION.name,
			true
		);
		const [actionName, action] = actionRollTarget.split(' -- ').map(term => term.trim());

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
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
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}
		const rollIndex = matchedAction.rolls.findIndex(
			roll => roll.name.toLocaleLowerCase() === action.toLocaleLowerCase()
		);
		if (rollIndex === -1) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.rollNotFound());
			return;
		}
		const rollName = matchedAction.rolls[rollIndex].name;
		matchedAction.rolls.splice(rollIndex, 1);

		//save the character
		await Character.query().patchAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		//send a confirmation message
		await InteractionUtils.send(
			intr,
			LL.commands.action.removeActionStage.interactions.success({
				actionStageName: rollName,
				actionName: matchedAction.name,
			})
		);
	}
}
