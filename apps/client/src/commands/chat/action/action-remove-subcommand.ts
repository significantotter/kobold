import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ComponentType,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from './action-command-options.js';

export class ActionRemoveSubCommand implements Command {
	public names = [L.en.commands.action.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.remove.name(),
		description: L.en.commands.action.remove.description(),
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
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.sheetRecord,
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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionChoice = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name, true);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const targetAction = FinderHelpers.getActionByName(
			activeCharacter.sheetRecord,
			actionChoice
		);
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
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: LL.sharedInteractions.choiceRegistered({
						choice: _.capitalize(result.value),
					}),
					components: [],
				});
			}
			// remove the action
			if (result && result.value === 'remove') {
				const actionsWithoutRemoved = _.filter(
					activeCharacter.sheetRecord.actions,
					action => action.name.toLocaleLowerCase() !== actionChoice.toLocaleLowerCase()
				);

				await kobold.sheetRecord.update(
					{ id: activeCharacter.sheetRecordId },
					{ actions: actionsWithoutRemoved }
				);

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
