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
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterRemoveSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.counterName].name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.counterName].name) ?? '';
			return autocompleteUtils.getCounters(intr, match);
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
			.getString(commandOptions[commandOptionsEnum.counterName].name, true)
			.trim();

		const { counter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			name
		);
		if (!counter) {
			throw new KoboldError(CounterDefinition.strings.notFound({ counterName: name }));
		}

		const response = await intr.reply({
			content: CounterDefinition.strings.removeConfirmation.text({
				counterName: counter.name,
			}),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: CounterDefinition.strings.removeConfirmation.confirmButton,
							customId: 'remove',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: CounterDefinition.strings.removeConfirmation.cancelButton,
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
						content: CounterDefinition.strings.removeConfirmation.expired,
						components: [],
					});
				},
			}
		);
		if (result) {
			await InteractionUtils.editReply(intr, {
				content: CounterDefinition.strings.shared.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
		}
		// remove the counter
		if (result && result.value === 'remove') {
			if (timedOut) return;
			if (group) {
				group.counters = group.counters.filter(
					c => c.name.toLowerCase() !== counter.name.toLowerCase()
				);
			} else {
				activeCharacter.sheetRecord.sheet.countersOutsideGroups =
					activeCharacter.sheetRecord.sheet.countersOutsideGroups.filter(
						c => c.name.toLowerCase() !== counter.name.toLowerCase()
					);
			}
			await kobold.sheetRecord.update(
				{ id: activeCharacter.sheetRecord.id },
				{
					sheet: activeCharacter.sheetRecord.sheet,
				}
			);
			await InteractionUtils.send(
				intr,
				CounterDefinition.strings.removed({
					counterName: counter.name,
				})
			);
		}
	}
}
