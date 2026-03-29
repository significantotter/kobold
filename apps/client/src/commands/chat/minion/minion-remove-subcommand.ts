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
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.minion].name) ?? '';
			return await koboldUtils.autocompleteUtils.getActiveCharacterMinionsWithUnassigned(
				intr,
				match
			);
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

		// Find the minion (active character's minions + unassigned)
		const allMinions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});
		const minions = allMinions.filter(
			(m: MinionWithRelations) =>
				m.characterId === activeCharacter.id || m.characterId === null
		);
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name} or unassigned!`
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
			// Acknowledge the button interaction to prevent "This interaction failed"
			await InteractionUtils.deferUpdate(result.intr);
			await InteractionUtils.editReply(intr, {
				content: sharedStrings.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
		}

		// Remove the minion
		if (result && result.value === 'remove') {
			// Find and remove any initiative actors for this minion
			const initiativeActors = await kobold.initiativeActor.readManyByMinionId({
				minionId: targetMinion.id,
			});

			for (const actor of initiativeActors) {
				// Check if this actor is the only one in its group
				const actorsInGroup = await kobold.initiativeActor.readManyByGroupId({
					groupId: actor.initiativeActorGroupId,
				});

				// Delete the actor
				await kobold.initiativeActor.delete({ id: actor.id });

				// If the group is now empty, delete the group
				if (actorsInGroup.length === 1) {
					await kobold.initiativeActorGroup.delete({
						id: actor.initiativeActorGroupId,
					});
				}
			}

			// Delete the associated sheetRecord (this cascades to actions, modifiers, rollMacros)
			await kobold.sheetRecord.delete({ id: targetMinion.sheetRecordId });

			await kobold.minion.delete({ id: targetMinion.id });

			const removedFromInit =
				initiativeActors.length > 0
					? ` They were also removed from ${initiativeActors.length} initiative(s).`
					: '';
			await InteractionUtils.send(
				intr,
				`Yip! I've removed the minion "${targetMinion.name}" from ${activeCharacter.name}!${removedFromInit}`
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
