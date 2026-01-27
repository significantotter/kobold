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
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { CounterGroupDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterGroupDefinition.options;
const commandOptionsEnum = CounterGroupDefinition.commandOptionsEnum;

export class CounterGroupRemoveSubCommand extends BaseCommandClass(
	CounterGroupDefinition,
	CounterGroupDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.counterGroupName].name) {
			const koboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
				activeCharacter: true,
			});
			return activeCharacter.sheetRecord.sheet.counterGroups.map(group => ({
				name: group.name,
				value: group.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const name = intr.options
			.getString(commandOptions[commandOptionsEnum.counterGroupName].name, true)
			.trim();

		const targetCounterGroup = activeCharacter.sheetRecord.sheet.counterGroups.find(
			group => group.name.toLowerCase() === name.toLowerCase()
		);
		if (!targetCounterGroup) {
			throw new KoboldError(CounterGroupDefinition.strings.notFound({ groupName: name }));
		}

		const response = await intr.reply({
			content: CounterGroupDefinition.strings.removeConfirmation.text({
				groupName: targetCounterGroup.name,
			}),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: CounterGroupDefinition.strings.removeConfirmation.confirmButton,
							customId: 'remove',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: CounterGroupDefinition.strings.removeConfirmation.cancelButton,
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
						content: CounterGroupDefinition.strings.removeConfirmation.expired,
						components: [],
					});
				},
			}
		);
		if (result) {
			await InteractionUtils.editReply(intr, {
				content: CounterGroupDefinition.strings.shared.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
		}
		// remove the counterGroup
		if (result && result.value === 'remove') {
			if (timedOut) return;
			const updatedCounterGroups = activeCharacter.sheetRecord.sheet.counterGroups.filter(
				group => group.name.toLowerCase() !== targetCounterGroup.name.toLowerCase()
			);
			await kobold.sheetRecord.update(
				{ id: activeCharacter.sheetRecord.id },
				{
					sheet: {
						...activeCharacter.sheetRecord.sheet,
						counterGroups: updatedCounterGroups,
					},
				}
			);
			await InteractionUtils.send(
				intr,
				CounterGroupDefinition.strings.removed({
					groupName: targetCounterGroup.name,
				})
			);
		}
	}
}
