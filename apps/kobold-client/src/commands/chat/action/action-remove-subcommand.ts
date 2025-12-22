import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ComponentType,
	MessageFlags,
} from 'discord.js';
import { Kobold } from '@kobold/db';

import _ from 'lodash';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionRemoveSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetAction].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetAction].name) ?? '';

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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.targetAction].name,
			true
		);

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
				content: ActionDefinition.strings.remove.confirmation.text({
					actionName: targetAction.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: ActionDefinition.strings.remove.confirmation.removeButton,
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: ActionDefinition.strings.remove.confirmation.cancelButton,
								customId: 'cancel',
								style: ButtonStyle.Primary,
							},
						],
					},
				],
				flags: [MessageFlags.Ephemeral],
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
							content: ActionDefinition.strings.remove.confirmation.expired,
							components: [],
						});
					},
				}
			);
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: ActionDefinition.strings.shared.choiceRegistered({
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
					ActionDefinition.strings.remove.success({
						actionName: targetAction.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, ActionDefinition.strings.remove.cancel);
				return;
			}
		} else {
			// no matching action found
			await InteractionUtils.send(intr, ActionDefinition.strings.notFound);
			return;
		}
	}
}
