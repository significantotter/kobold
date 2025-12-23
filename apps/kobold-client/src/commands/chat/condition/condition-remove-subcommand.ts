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

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ConditionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ConditionDefinition.options;
const commandOptionsEnum = ConditionDefinition.commandOptionsEnum;

export class ConditionRemoveSubCommand extends BaseCommandClass(
	ConditionDefinition,
	ConditionDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';
			const targetCharacterName =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const conditionChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.name].name,
			true
		);
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const { gameUtils } = new KoboldUtils(kobold);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);
		const targetCondition = FinderHelpers.getConditionByName(
			targetSheetRecord,
			conditionChoice
		);
		if (targetCondition) {
			// ask for confirmation

			const response = await intr.reply({
				content: ConditionDefinition.strings.remove.confirmation.text({
					conditionName: targetCondition.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: ConditionDefinition.strings.remove.confirmation.removeButton,
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: ConditionDefinition.strings.remove.confirmation.cancelButton,
								customId: 'cancel',
								style: ButtonStyle.Primary,
							},
						],
					},
				],
				flags: [MessageFlags.Ephemeral],
				withResponse: true,
			});
			const prompt = response.resource!.message!;
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
							content: ConditionDefinition.strings.remove.confirmation.expired,
							components: [],
						});
					},
				}
			);
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: ConditionDefinition.strings.shared.choiceRegistered({
						choice: _.capitalize(result.value),
					}),
					components: [],
				});
			}
			// remove the condition
			if (result && result.value === 'remove') {
				const conditionsWithoutRemoved = _.filter(
					targetSheetRecord.conditions,
					condition =>
						condition.name.toLocaleLowerCase() !== conditionChoice.toLocaleLowerCase()
				);
				await kobold.sheetRecord.update(
					{ id: targetSheetRecord.id },
					{
						conditions: conditionsWithoutRemoved,
					}
				);

				await InteractionUtils.send(
					intr,
					ConditionDefinition.strings.success({
						conditionName: targetCondition.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, ConditionDefinition.strings.cancel);
				return;
			}
		} else {
			// no matching condition found
			await InteractionUtils.send(intr, ConditionDefinition.strings.notFound);
			return;
		}
	}
}
