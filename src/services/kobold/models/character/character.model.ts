import { GuildDefaultCharacter } from './../index.js';
import type CharacterTypes from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json';
import _ from 'lodash';

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
	 * Gets a list of the applicable modifiers for any set of tags
	 * @param tags the tags to check against a character's modifiers
	 * @returns modifier[]
	 */
	public getModifiersFromTags(tags) {
		const sanitizedTags = tags.map(tag => tag.toLocaleLowerCase().trim());
		let bonuses = {};
		let penalties = {};
		const untyped = [];
		// for each modifier, check if it targets any tags for this roll
		for (const modifier of this.modifiers) {
			// if this modifier isn't active, move to the next one
			if (!modifier.isActive) continue;

			// ensure that tags are trimmed and in proper casing
			const sanitizedModifierTargetTags = modifier.targetTags.map(tag =>
				tag.toLocaleLowerCase().trim()
			);
			// check if any tags match between the modifier and the provided tags
			if (_.intersection(sanitizedModifierTargetTags, tags).length) {
				if (!modifier.type) {
					untyped.push(modifier);
				}
				// apply the modifier
				else if (modifier.value > 0) {
					// apply a bonus
					if (bonuses[modifier.type]) {
						if (Math.max(bonuses[modifier.type].value, modifier.value))
							bonuses[modifier.type] = modifier;
					} else {
						bonuses[modifier.type] = modifier;
					}
				} else if (modifier.value < 0) {
					// apply a penalty
					if (penalties[modifier.type]) {
						if (Math.min(penalties[modifier.type].value, modifier.value))
							penalties[modifier.type] = modifier;
					} else {
						penalties[modifier.type] = modifier;
					}
				}
			}
		}
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
