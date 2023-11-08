import { BaseModel } from '../../lib/base-model.js';
import _ from 'lodash';
import { type Character, zCharacter } from '../../schemas/index.js';
import { ZodValidator } from '../../lib/zod-validator.js';
import type { GuildDefaultCharacterModel } from '../guild-default-character/guild-default-character.model.js';
import type { ChannelDefaultCharacterModel } from '../channel-default-character/channel-default-character.model.js';

export interface CharacterModel extends Character {
	guildDefaultCharacter?: GuildDefaultCharacterModel[];
	channelDefaultCharacter?: ChannelDefaultCharacterModel[];
}
export class CharacterModel extends BaseModel {
	static idColumn = ['id'];
	public $insertIgnore = ['id'];
	static get tableName(): string {
		return 'character';
	}
	static createValidator() {
		return new ZodValidator();
	}

	public $z = zCharacter;

	public parse() {
		return this.$z.parse(this.toJSON());
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
	 * Fetches a character's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public getActionByName(name: string): Character['actions'][0] | undefined {
		return this.actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	static setupRelationMappings({
		GuildDefaultCharacterModel,
		ChannelDefaultCharacterModel,
	}: {
		GuildDefaultCharacterModel: any;
		ChannelDefaultCharacterModel: any;
	}) {
		this.relationMappings = {
			guildDefaultCharacter: {
				relation: BaseModel.HasManyRelation,
				modelClass: GuildDefaultCharacterModel,
				join: {
					from: 'character.id',
					to: 'guildDefaultCharacter.characterId',
				},
			},
			channelDefaultCharacter: {
				relation: BaseModel.HasManyRelation,
				modelClass: ChannelDefaultCharacterModel,
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
