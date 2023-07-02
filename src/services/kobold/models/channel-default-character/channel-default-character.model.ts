import { Character } from '../index.js';
import type ChannelDefaultCharacterTypes from './channel-default-character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import ChannelDefaultCharacterSchema from './channel-default-character.schema.json';

export interface ChannelDefaultCharacter
	extends ChannelDefaultCharacterTypes.ChannelDefaultCharacter {}
export class ChannelDefaultCharacter extends BaseModel {
	static get idColumn() {
		return ['channelId', 'userId'];
	}

	static get tableName(): string {
		return 'channelDefaultCharacter';
	}

	static get jsonSchema(): JSONSchema7 {
		return ChannelDefaultCharacterSchema as JSONSchema7;
	}

	static get RelationMappings() {
		return {
			...super.relationMappings,
			ChannelDefaultCharacter: {
				relation: BaseModel.HasOneRelation,
				modelClass: Character,
				join: {
					from: 'channelDefaultCharacter.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
