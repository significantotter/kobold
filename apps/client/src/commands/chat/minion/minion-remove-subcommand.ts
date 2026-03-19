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
import { Kobold, MinionWithRelations } from '@kobold/db';
import { MinionDefinition, sharedStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionRemoveSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.minion].name);
			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions = await kobold.minion.readMany({
				characterId: activeCharacter.id,
			});

			return minions
				.filter((m: MinionWithRelations) =>
					m.name.toLowerCase().includes((match ?? '').toLowerCase())
				)
				.map((m: MinionWithRelations) => ({
					name: m.name,
					value: m.name,
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

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.minion].name, true)
			.trim();

		// Find the minion
		const minions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name}!`
			);
		}

		// Ask for confirmation
		const response = await intr.reply({
			content: `Are you sure you want to remove the minion "${targetMinion.name}"? This action cannot be undone.`,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: 'Remove',
							customId: 'remove',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: 'Cancel',
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
						content: 'Yip! The confirmation timed out.',
						components: [],
					});
				},
			}
		);

		if (result) {
			await InteractionUtils.editReply(intr, {
				content: sharedStrings.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
		}

		// Remove the minion
		if (result && result.value === 'remove') {
			// Delete the associated sheetRecord if it exists
			if (targetMinion.sheetRecordId) {
				await kobold.sheetRecord.delete({ id: targetMinion.sheetRecordId });
			}

			await kobold.minion.delete({ id: targetMinion.id });

			await InteractionUtils.send(
				intr,
				`Yip! I've removed the minion "${targetMinion.name}" from ${activeCharacter.name}!`
			);
			return;
		}
		// Cancel
		else {
			await InteractionUtils.send(intr, `Yip! I've canceled removing the minion.`);
			return;
		}
	}
}
