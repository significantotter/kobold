import { Character } from './../index.js';
import type { GuildDefaultCharacter as GuildDefaultCharacterType } from './guild-default-character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import GuildDefaultCharacterSchema from './guild-default-character.schema.json' assert { type: 'json' };
import Objection from 'objection';
import { removeRequired } from '../../lib/helpers.js';

export interface GuildDefaultCharacter extends GuildDefaultCharacterType {}
export class GuildDefaultCharacter extends BaseModel {
	static get idColumn() {
		return ['guildId', 'userId'];
	}

	static get tableName(): string {
		return 'guildDefaultCharacter';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return removeRequired(GuildDefaultCharacterSchema as unknown as Objection.JSONSchema);
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
