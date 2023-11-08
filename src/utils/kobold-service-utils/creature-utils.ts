import { ChatInputCommandInteraction } from 'discord.js';
import {
	Character,
	CharacterModel,
	InitiativeActor,
	InitiativeActorModel,
	InitiativeActorWithRelations,
} from '../../services/kobold/index.js';
import { Creature } from '../creature.js';
import { Kobold } from '../../services/kobold/kobold.model.js';
import { KoboldUtils } from './kobold-utils.js';

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

	public async updateSheetTracker(intr: ChatInputCommandInteraction, target: Character) {
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
				await this.kobold.character.update(
					{ id: target.id },
					{ trackerMessageId: null, trackerChannelId: null, trackerGuildId: null }
				);
			} else console.error(e);
		}
	}

	public async saveCharacterSheet(intr: ChatInputCommandInteraction, target: Character) {
		const sheet = target.sheet;
		let promises: Promise<any>[] = [
			this.kobold.character.update({ id: target.id }, { sheet: target.sheet }),
			this.kobold.initiativeActor.update({ characterId: target.id }, { sheet: target.sheet }),
		];
		if (target.trackerMessageId) {
			promises.push(this.updateSheetTracker(intr, target));
		}
		await Promise.all(promises);
	}

	public async saveInitActorSheet(
		intr: ChatInputCommandInteraction,
		target: InitiativeActorWithRelations
	) {
		const sheet = target.sheet;
		// apply any damage effects from the action to the creature
		await this.kobold.initiativeActor.update({ id: target.id }, { sheet });
		if (target.characterId) {
			const character = await this.kobold.character.update(
				{ id: target.characterId },
				{ sheet }
			);
			await this.updateSheetTracker(intr, character);
		}
	}
}
