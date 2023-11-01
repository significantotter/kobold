import { ChatInputCommandInteraction } from 'discord.js';
import { CharacterModel, InitiativeActorModel } from '../services/kobold/index.js';
import { Creature } from './creature.js';

interface ErrorWithCode<T extends number = number> extends Error {
	code: T;
}
function isErrorWithCode<T extends number>(
	err: ErrorWithCode<T> | unknown
): err is ErrorWithCode<T> {
	return err instanceof Error && 'code' in err;
}

export class CreatureUtils {
	public static async updateSheetTracker(
		intr: ChatInputCommandInteraction,
		target: CharacterModel | InitiativeActorModel
	) {
		const creature = new Creature(target.sheet);
		const tracker = await creature.compileTracker(target.trackerMode ?? 'counters_only');
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
				await target
					.$query()
					.patch({ trackerMessageId: null, trackerChannelId: null, trackerGuildId: null })
					.execute();
			} else console.error(e);
		}
	}

	public static async saveCharacterSheet(
		intr: ChatInputCommandInteraction,
		target: CharacterModel
	) {
		const sheet = target.sheet;
		let promises: Promise<any>[] = [
			target.$query().patch({ sheet: target.sheet }).execute(),
			InitiativeActorModel.query()
				.patch({ sheet: target.sheet })
				.where('characterId', target.id)
				.execute(),
		];
		if (target.trackerMessageId) {
			promises.push(CreatureUtils.updateSheetTracker(intr, target));
		}
		await Promise.all(promises);
	}

	public static async saveInitActorSheet(
		intr: ChatInputCommandInteraction,
		target: InitiativeActorModel
	) {
		const sheet = target.sheet;
		// apply any damage effects from the action to the creature
		let promises: any[] = [
			target.$query().patch({ sheet }).execute(),
			CharacterModel.query()
				.patch({ sheet })
				.where('id', target.characterId ?? null)
				.execute(),
		];
		if (target.character?.trackerChannelId) {
			promises.push(target.character.updateTracker(intr, sheet));
		}
		if (target.characterId && !target.character) {
			const character = await CharacterModel.query().findOne({ id: target.characterId });
			if (character) promises.push(CreatureUtils.updateSheetTracker(intr, target));
		}

		await Promise.all(promises);
	}
}
