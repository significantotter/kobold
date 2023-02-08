import { GuildDefaultCharacter } from './../index.js';
import type CharacterTypes from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json';
import _ from 'lodash';
import { parseBonusesForTagsFromModifiers } from '../../lib/helpers.js';

export interface Character extends CharacterTypes.Character {}
export class Character extends BaseModel {
	static get tableName(): string {
		return 'character';
	}

	static get jsonSchema(): JSONSchema7 {
		return CharacterSchema as JSONSchema7;
	}

	static queryLooseCharacterName(characterName, userId) {
		return this.query().whereRaw(
			`user_id=:userId AND (character_data->'name')::TEXT ILIKE :characterName`,
			{
				userId,
				characterName: `%${characterName}%`,
			}
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
	 * Gets a list of the applicable modifiers for any set of tags
	 * @param tags the tags to check against a character's modifiers
	 * @returns modifier[]
	 */
	public getModifiersFromTags(tags: string[]): Character['modifiers'] {
		const { untyped, bonuses, penalties } = parseBonusesForTagsFromModifiers(
			this.modifiers,
			tags
		);
		return untyped.concat(_.values(bonuses), _.values(penalties));
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
		};
	}
}
