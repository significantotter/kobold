import type { GuildDefaultCharacter } from '../../schemas/guild-default-character.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { zGuildDefaultCharacter } from '../../schemas/guild-default-character.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface GuildDefaultCharacterModel extends GuildDefaultCharacter {}
export class GuildDefaultCharacterModel extends BaseModel {
	public $idColumn = ['guildId', 'userId'];

	static get tableName(): string {
		return 'guildDefaultCharacter';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zGuildDefaultCharacter;

	static setupRelationMappings({ CharacterModel }: { CharacterModel: any }) {
		this.relationMappings = {
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
