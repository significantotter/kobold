import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold, MinionWithRelations } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

export class MinionListSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		// Get all minions for the user
		const allMinions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});

		// Separate into active character's minions and unassigned minions
		const characterMinions = allMinions.filter(
			(m: MinionWithRelations) => m.characterId === activeCharacter.id
		);
		const unassignedMinions = allMinions.filter(
			(m: MinionWithRelations) => m.characterId === null
		);

		if (!characterMinions.length && !unassignedMinions.length) {
			await InteractionUtils.send(
				intr,
				`Yip! ${activeCharacter.name} doesn't have any minions yet, and you have no unassigned minions! Use \`/minion create\` to create one.`
			);
			return;
		}

		const formatMinionFields = (minions: MinionWithRelations[]) =>
			minions.map((minion: MinionWithRelations) => {
				const sheet = minion.sheetRecord.sheet;
				const hp = sheet.baseCounters?.hp;
				const ac = sheet.intProperties?.ac;
				const level = sheet.staticInfo?.level;

				const stats: string[] = [];
				if (level !== undefined && level !== null) {
					stats.push(`Level ${level}`);
				}
				if (hp?.max !== undefined && hp?.max !== null) {
					stats.push(`HP: ${hp.current ?? hp.max}/${hp.max}`);
				}
				if (ac !== undefined && ac !== null) {
					stats.push(`AC: ${ac}`);
				}
				// Show auto-join status
				stats.push(minion.autoJoinInitiative ? 'Auto-join: Yes' : 'Auto-join: No');

				return {
					name: minion.name,
					value: stats.length > 0 ? stats.join(' | ') : '*No stats set*',
				};
			});

		const minionListEmbed = new KoboldEmbed().setTitle(`${activeCharacter.name}'s Minions`);

		if (characterMinions.length) {
			minionListEmbed.addFields(formatMinionFields(characterMinions));
		} else {
			minionListEmbed.setDescription('*No minions assigned to this character.*');
		}

		// Add unassigned section if there are any
		if (unassignedMinions.length) {
			minionListEmbed.addFields([
				{ name: '\u200B', value: '**— Unassigned Minions —**' },
				...formatMinionFields(unassignedMinions),
			]);
		}

		await minionListEmbed.sendBatches(intr);
	}
}
