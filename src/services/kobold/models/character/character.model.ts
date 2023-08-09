import { GuildDefaultCharacter, ChannelDefaultCharacter, InitiativeActor } from './../index.js';
import type { Character as CharacterType } from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json' assert { type: 'json' };
import Sheet from '../../lib/sheet.schema.json' assert { type: 'json' };
import { Sheet as SheetType } from '../../lib/sheet.schema.js';
import _ from 'lodash';
import { Creature } from '../../../../utils/creature.js';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { ClientUtils } from '../../../../utils/client-utils.js';

export interface Character extends CharacterType {
	sheet?: SheetType;
}
export class Character extends BaseModel {
	static get tableName(): string {
		return 'character';
	}

	static get jsonSchema(): JSONSchema7 {
		return {
			...CharacterSchema,
			properties: { ...CharacterSchema.properties, sheet: Sheet },
		} as JSONSchema7;
	}

	static queryControlledCharacterByName(characterName, userId) {
		return this.query().whereRaw(`user_id=:userId AND name::TEXT ILIKE :characterName`, {
			userId,
			characterName: `%${characterName}%`,
		});
	}

	async updateTracker(intr: ChatInputCommandInteraction, sheet: SheetType) {
		const creature = new Creature(sheet);
		const tracker = await creature.compileTracker(this.trackerMode ?? 'counters_only');
		try {
			const trackerGuild = await intr.client.guilds.fetch(this.trackerGuildId);
			const trackerChannel = await trackerGuild.channels.fetch(this.trackerChannelId);
			if (trackerChannel.isTextBased()) {
				const trackerMessage = await trackerChannel.messages.fetch(this.trackerMessageId);
				await trackerMessage.edit(tracker);
			}
		} catch (e) {
			if (e.code === 10008) {
				// unknown message. Clear the tracker so we don't keep trying every time
				await this.$query()
					.patch({ trackerMessageId: null, trackerChannelId: null, trackerGuildId: null })
					.execute();
			} else console.error(e);
		}
	}

	async saveSheet(intr: ChatInputCommandInteraction, sheet: SheetType) {
		let promises: Promise<any>[] = [
			this.$query().patch({ sheet }).execute(),
			InitiativeActor.query().patch({ sheet }).where('characterId', this.id).execute(),
		];
		if (this.trackerMessageId) {
			promises.push(this.updateTracker(intr, sheet));
		}
		await Promise.all(promises);

		return;
	}

	/**
	 * Fetches a character's roll macro by the roll macro's name
	 * @param name the name of the roll macro
	 * @returns the roll macro
	 */
	public getRollMacroByName(name: string): Character['rollMacros'][0] | null {
		return this.rollMacros.find(
			rollMacro =>
				rollMacro.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a character's modifier by the modifier name
	 * @param name the name of the modifier
	 * @returns the modifier
	 */
	public getModifierByName(name: string): Character['modifiers'][0] | null {
		return this.modifiers.find(
			modifier => modifier.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a character's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public getActionByName(name: string): Character['actions'][0] | null {
		return this.actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	static get relationMappings() {
		return {
			guildDefaultCharacter: {
				relation: BaseModel.HasManyRelation,
				modelClass: GuildDefaultCharacter,
				join: {
					from: 'character.id',
					to: 'guildDefaultCharacter.characterId',
				},
			},
			channelDefaultCharacter: {
				relation: BaseModel.HasManyRelation,
				modelClass: ChannelDefaultCharacter,
				join: {
					from: 'character.id',
					to: 'channelDefaultCharacter.characterId',
				},
			},
		};
	}

	// This helps us explicitly match the type ModelWithSheet
	get hideStats(): boolean {
		return false;
	}
}
