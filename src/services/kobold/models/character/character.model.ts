import { GuildDefaultCharacter, ChannelDefaultCharacter, InitiativeActor } from './../index.js';
import type { Character as CharacterType } from './character.schema.js';
import { BaseModel } from '../../lib/base-model.js';
import { Sheet as SheetType } from '../../lib/type-helpers.js';
import { Action as ActionType } from '../../lib/shared-schemas/action.schema.d.js';
import { Modifier as ModifierType } from '../../lib/shared-schemas/modifier.schema.d.js';
import { RollMacro as RollMacroType } from '../../lib/shared-schemas/roll-macro.schema.d.js';
import _ from 'lodash';
import { Creature } from '../../../../utils/creature.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { StringUtils } from '../../../../utils/string-utils.js';
import { zCharacter } from './character.zod.js';
import { z } from 'zod';
export type ZCharacter = z.infer<typeof zCharacter>;

interface ErrorWithCode<T extends number = number> extends Error {
	code: T;
}
function isErrorWithCode<T extends number>(
	err: ErrorWithCode<T> | unknown
): err is ErrorWithCode<T> {
	return err instanceof Error && 'code' in err;
}

export interface Character extends CharacterType {
	sheet: SheetType;
	actions: ActionType[];
	modifiers: ModifierType[];
	rollMacros: RollMacroType[];
	guildDefaultCharacter?: GuildDefaultCharacter[];
	channelDefaultCharacter?: ChannelDefaultCharacter[];
}
export class Character extends BaseModel {
	static get tableName(): string {
		return 'character';
	}

	public $z = zCharacter;

	public parse() {
		return this.$z.parse(this.toJSON());
	}

	static async queryControlledCharacterByName(
		characterName: string,
		userId: string
	): Promise<Character[]> {
		const results = await this.query().whereRaw(
			`user_id=:userId AND name::TEXT ILIKE :characterName`,
			{
				userId,
				characterName: `%${characterName}%`,
			}
		);
		const closestByName = StringUtils.generateSorterByWordDistance<Character>(
			characterName,
			character => character.name
		);
		return results.sort(closestByName);
	}

	async updateTracker(intr: ChatInputCommandInteraction, sheet: SheetType) {
		const creature = new Creature(sheet);
		const tracker = await creature.compileTracker(this.trackerMode ?? 'counters_only');
		try {
			if (
				!intr?.client?.guilds ||
				!this.trackerGuildId ||
				!this.trackerChannelId ||
				!this.trackerMessageId
			)
				return;
			const trackerGuild = await intr.client.guilds.fetch(this.trackerGuildId);
			const trackerChannel = await trackerGuild.channels.fetch(this.trackerChannelId);
			if (trackerChannel && trackerChannel.isTextBased()) {
				const trackerMessage = await trackerChannel.messages.fetch(this.trackerMessageId);
				await trackerMessage.edit(tracker);
			}
		} catch (e) {
			if (isErrorWithCode(e) && e.code === 10008) {
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
	public getRollMacroByName(name: string): Character['rollMacros'][0] | undefined {
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
	public getModifierByName(name: string): Character['modifiers'][0] | undefined {
		return this.modifiers.find(
			modifier => modifier.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Fetches a character's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public getActionByName(name: string): Character['actions'][0] | undefined {
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
