import { Character } from './../index.js';
import type GuildDefaultCharacterTypes from './guild-default-character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import GuildDefaultCharacterSchema from './guild-default-character.schema.json';

export interface GuildDefaultCharacter extends GuildDefaultCharacterTypes.GuildDefaultCharacter {}
export class GuildDefaultCharacter extends BaseModel {
	static get idColumn() {
		return ['guildId', 'userId'];
	}

	static get tableName(): string {
		return 'guildDefaultCharacter';
	}

	static get jsonSchema(): JSONSchema7 {
		return GuildDefaultCharacterSchema as JSONSchema7;
	}

	static get RelationMappings() {
		return {
			...super.relationMappings,
			GuildDefaultCharacter: {
				relation: BaseModel.HasOneRelation,
				modelClass: Character,
				join: {
					from: 'guildDefaultCharacter.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
