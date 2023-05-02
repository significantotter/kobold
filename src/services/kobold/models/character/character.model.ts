import { GuildDefaultCharacter } from './../index.js';
import type CharacterTypes from './character.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import CharacterSchema from './character.schema.json';
import Sheet from '../../lib/sheet.schema.json';
import SheetTypes from '../../lib/sheet.schema';
import _ from 'lodash';
import { parseBonusesForTagsFromModifiers } from '../../lib/helpers.js';

const characterSchemaWithSheet = {};

export interface Character extends CharacterTypes.Character {
	sheet?: SheetTypes.Sheet;
}
export class Character extends BaseModel {
	static get tableName(): string {
		return 'character';
	}

	static get jsonSchema(): JSONSchema7 {
		return {
			...CharacterSchema,
			properties: { ...CharacterSchema.properties, sheet: Sheet },
		} as JSONSchema7;
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
