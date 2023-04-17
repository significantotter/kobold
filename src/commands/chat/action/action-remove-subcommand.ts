import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	AutocompleteInteraction,
	AutocompleteFocusedOption,
	ApplicationCommandOptionChoiceData,
	CacheType,
	ComponentType,
	ButtonStyle,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { ActionOptions } from './action-command-options.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import _ from 'lodash';

export class ActionRemoveSubCommand implements Command {
	public names = [Language.LL.commands.action.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.remove.name(),
		description: Language.LL.commands.action.remove.description(),
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

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = CharacterUtils.findPossibleActionFromString(
				activeCharacter,
				match
			).map(action => ({
				name: action.name,
				value: action.name,
			}));
			//return the matched actions
			return matchedActions;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const actionChoice = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		const targetAction = activeCharacter.getActionByName(actionChoice);
		if (targetAction) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: LL.commands.action.remove.interactions.removeConfirmation.text({
					actionName: targetAction.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: LL.commands.action.remove.interactions.removeConfirmation.removeButton(),
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: LL.commands.action.remove.interactions.removeConfirmation.cancelButton(),
								customId: 'cancel',
								style: ButtonStyle.Primary,
							},
						],
					},
				],
				ephemeral: true,
				fetchReply: true,
			});
			let timedOut = false;
			let result = await CollectorUtils.collectByButton(
				prompt,
				async buttonInteraction => {
					if (buttonInteraction.user.id !== intr.user.id) {
						return;
					}
					switch (buttonInteraction.customId) {
						case 'remove':
							return { intr: buttonInteraction, value: 'remove' };
						default:
							return { intr: buttonInteraction, value: 'cancel' };
					}
				},
				{
					time: 50000,
					reset: true,
					target: intr.user,
					stopFilter: message => message.content.toLowerCase() === 'stop',
					onExpire: async () => {
						timedOut = true;
						await InteractionUtils.editReply(intr, {
							content:
								LL.commands.action.remove.interactions.removeConfirmation.expired(),
							components: [],
						});
					},
				}
			);
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
			// remove the action
			if (result.value === 'remove') {
				const actionsWithoutRemoved = _.filter(
					activeCharacter.actions,
					action => action.name.toLocaleLowerCase() !== actionChoice.toLocaleLowerCase()
				);
				await Character.query()
					.patch({ actions: actionsWithoutRemoved })
					.where({ userId: intr.user.id });

				await InteractionUtils.send(
					intr,
					LL.commands.action.remove.interactions.success({
						actionName: targetAction.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, LL.commands.action.remove.interactions.cancel());
				return;
			}
		} else {
			// no matching action found
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}
	}
}
