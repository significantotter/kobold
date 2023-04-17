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
	 * Fetches a character's roll macro by the roll macro's name
	 * @param name the name of the roll macro
	 * @returns the roll macro
	 */
	public getRollMacroByName(name: string): Character['rollMacros'][0] | null {
		return this.rollMacros.find(
			rollMacro =>
				rollMacro.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
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
	 * Fetches a character's action by the action name
	 * @param name the name of the action
	 * @returns the action
	 */
	public getActionByName(name: string): Character['actions'][0] | null {
		return this.actions.find(
			action => action.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim()
		);
	}

	/**
	 * Gets a list of the applicable modifiers for any set of tags
	 * @param tags the tags to check against a character's modifiers
	 * @returns modifier[]
	 */
	public getModifiersFromTags(
		tags: string[],
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[]
	): Character['modifiers'] {
		const { untyped, bonuses, penalties } = parseBonusesForTagsFromModifiers(
			this.modifiers,
			[
				...(this.attributes as {
					name: string;
					value: number;
					tags?: string[];
				}[]),
				...(extraAttributes || []),
			],
			tags,
			this
		);
		return untyped.concat(_.values(bonuses), _.values(penalties));
	}

	/**
	 * Uses a character's roll macros to expand a roll
	 */
	public expandRollWithMacros(rollExpression: string): string {
		const characterRollMacros = this.rollMacros || [];
		const maxDepth = 10;
		let resultRollExpression = rollExpression.toLocaleLowerCase();
		for (let i = 0; i < maxDepth; i++) {
			let rollExpressionBeforeExpanding = resultRollExpression;
			// replace every instance of each macro in the rollExpression with the macro's value
			for (const macro of characterRollMacros) {
				resultRollExpression = resultRollExpression.replaceAll(
					`[${macro.name.toLocaleLowerCase()}]`,
					macro.macro
				);
			}
			// if we haven't changed the roll expression, then we're done checking macros
			if (rollExpressionBeforeExpanding === resultRollExpression) break;
		}
		return resultRollExpression;
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
