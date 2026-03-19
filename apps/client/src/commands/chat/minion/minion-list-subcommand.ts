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

		// Get all minions for the active character
		const minions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});

		if (!minions.length) {
			await InteractionUtils.send(
				intr,
				`Yip! ${activeCharacter.name} doesn't have any minions yet! Use \`/minion create\` to create one.`
			);
			return;
		}

		const minionFields = minions.map((minion: MinionWithRelations) => {
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

		const minionListEmbed = new KoboldEmbed()
			.setTitle(`${activeCharacter.name}'s Minions`)
			.addFields(minionFields);

		await minionListEmbed.sendBatches(intr);
	}
}
