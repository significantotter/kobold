import { GuildDefaultCharacter } from './../index.js';
import type CharacterTypes from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json';
import _, { values } from 'lodash';
import { compileExpression } from 'filtrex';

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
		const sanitizedTags = tags.map(tag => tag.toLocaleLowerCase().trim());
		let bonuses = {};
		let penalties = {};
		const untyped = [];
		// for each modifier, check if it targets any tags for this roll
		for (const modifier of this.modifiers) {
			// if this modifier isn't active, move to the next one
			if (!modifier.isActive) continue;

			// compile the modifier's target tags
			const tagExpression = compileExpression(modifier.targetTags);

			const possibleTags = modifier.targetTags.match(/([A-Za-z][A-Za-z_0-9]*)/g);

			let tagTruthValues: { [k: string]: boolean | number } = {};

			for (const attribute of this.attributes) {
				tagTruthValues['__' + attribute.name.toLocaleLowerCase()] = attribute.value;
			}
			for (const tag of possibleTags) {
				if (
					// exclude words used by the grammar
					[
						'and',
						'or',
						'not',
						'in',
						'abs',
						'ceil',
						'floor',
						'log',
						'max',
						'min',
						'random',
						'round',
						'sqrt',
					].includes(tag)
				)
					continue;

				tagTruthValues[tag] = tags.includes(tag.toLocaleLowerCase());
			}

			let modifierValidForTags;
			try {
				modifierValidForTags = tagExpression(tagTruthValues);
			} catch (err) {
				//an invalid tag expression sneaked in! Don't catastrophically fail, though
				console.warn(err);
				modifierValidForTags = false;
			}

			// check if any tags match between the modifier and the provided tags
			if (modifierValidForTags) {
				if (!modifier.type) {
					untyped.push(modifier);
				}
				// apply the modifier
				else if (modifier.value > 0) {
					// apply a bonus
					if (bonuses[modifier.type]) {
						if (modifier.value > bonuses[modifier.type].value)
							bonuses[modifier.type] = modifier;
					} else {
						bonuses[modifier.type] = modifier;
					}
				} else if (modifier.value < 0) {
					// apply a penalty
					if (penalties[modifier.type]) {
						if (modifier.value < penalties[modifier.type].value)
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
