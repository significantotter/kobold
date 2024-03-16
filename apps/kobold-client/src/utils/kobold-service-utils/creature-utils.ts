import type { ChatInputCommandInteraction } from 'discord.js';
import type { Kobold, SheetRecord } from 'kobold-db';
import { Creature } from '../creature.js';
import type { KoboldUtils } from './kobold-utils.js';

interface ErrorWithCode<T extends number = number> extends Error {
	code: T;
}
function isErrorWithCode<T extends number>(
	err: ErrorWithCode<T> | unknown
): err is ErrorWithCode<T> {
	return err instanceof Error && 'code' in err;
}

export class CreatureUtils {
	kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async updateSheetTracker(intr: ChatInputCommandInteraction, target: SheetRecord) {
		const creature = Creature.fromSheetRecord(target);
		const embed = await creature.compileEmbed('Tracker', target.trackerMode ?? 'counters_only');
		const tracker = { content: embed.data.description, embeds: [] };
		try {
			if (
				!intr?.client?.guilds ||
				!target.trackerGuildId ||
				!target.trackerChannelId ||
				!target.trackerMessageId
			)
				return;
			const trackerGuild = await intr.client.guilds.fetch(target.trackerGuildId);
			const trackerChannel = await trackerGuild.channels.fetch(target.trackerChannelId);
			if (trackerChannel && trackerChannel.isTextBased()) {
				const trackerMessage = await trackerChannel.messages.fetch(target.trackerMessageId);
				await trackerMessage.edit(tracker);
			}
		} catch (e) {
			if (isErrorWithCode(e) && e.code === 10008) {
				// unknown message. Clear the tracker so we don't keep trying every time
				await this.kobold.sheetRecord.update(
					{ id: target.id },
					{ trackerMessageId: null, trackerChannelId: null, trackerGuildId: null }
				);
			} else console.error(e);
		}
	}

	public async saveSheet(intr: ChatInputCommandInteraction, target: SheetRecord) {
		const sheet = target.sheet;
		await this.kobold.sheetRecord.update({ id: target.id }, { sheet });
		if (target.trackerMessageId) {
			await this.updateSheetTracker(intr, target);
		}
	}
}
