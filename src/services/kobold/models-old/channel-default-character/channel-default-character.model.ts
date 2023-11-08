import {
	zChannelDefaultCharacter,
	type ChannelDefaultCharacter,
} from '../../schemas/zod-tables/channel-default-character.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface ChannelDefaultCharacterModel extends ChannelDefaultCharacter {}
export class ChannelDefaultCharacterModel extends BaseModel {
	static idColumn = ['id'];
	public $insertIgnore = ['channelId', 'userId'];

	static get tableName(): string {
		return 'channelDefaultCharacter';
	}
	static createValidator() {
		return new ZodValidator();
	}

	public $z = zChannelDefaultCharacter;

	static setupRelationMappings({ CharacterModel }: { CharacterModel: any }) {
		this.relationMappings = {
			ChannelDefaultCharacter: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: CharacterModel,
				join: {
					from: 'channelDefaultCharacter.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
