import type { GuildDefaultCharacter } from '../../schemas/guild-default-character.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { zGuildDefaultCharacter } from '../../schemas/guild-default-character.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';
import { CharacterModel } from '../character/character.model.js';

export interface GuildDefaultCharacterModel extends GuildDefaultCharacter {}
export class GuildDefaultCharacterModel extends BaseModel {
	static get idColumn() {
		return ['guildId', 'userId'];
	}

	static get tableName(): string {
		return 'guildDefaultCharacter';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zGuildDefaultCharacter;

	static get RelationMappings() {
		return {
			...super.relationMappings,
			GuildDefaultCharacter: {
				relation: BaseModel.HasOneRelation,
				modelClass: CharacterModel,
				join: {
					from: 'guildDefaultCharacter.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
