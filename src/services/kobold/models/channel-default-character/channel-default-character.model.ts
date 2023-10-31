import {
	zChannelDefaultCharacter,
	type ChannelDefaultCharacter,
} from '../../schemas/channel-default-character.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { ZodValidator } from '../../lib/zod-validator.js';
import { CharacterModel } from '../character/character.model.js';

export interface ChannelDefaultCharacterModel extends ChannelDefaultCharacter {}
export class ChannelDefaultCharacterModel extends BaseModel {
	static get idColumn() {
		return ['channelId', 'userId'];
	}

	static get tableName(): string {
		return 'channelDefaultCharacter';
	}
	static createValidator() {
		return new ZodValidator();
	}

	public $z = zChannelDefaultCharacter;

	static get RelationMappings() {
		return {
			...super.relationMappings,
			ChannelDefaultCharacter: {
				relation: BaseModel.HasOneRelation,
				modelClass: CharacterModel,
				join: {
					from: 'channelDefaultCharacter.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
