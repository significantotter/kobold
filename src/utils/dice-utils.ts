import { Character } from './../services/kobold/models/character/character.model';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { Dice } from 'dice-typescript';
import type { WG } from './../services/wanderers-guide/wanderers-guide.js';
import _ from 'lodash';

export class RollBuilder {
	private character: Character | null;
	private rollDescription: string;
	private rollNote: string;
	private rollResults: EmbedFieldData[];
	private title: string;

	constructor({
		character,
		rollDescription,
		rollNote,
	}: {
		character?: Character | null;
		rollDescription?: string;
		rollNote?: string;
	}) {
		this.rollResults = [];
		this.character = character || null;
		this.rollNote = rollNote;
		this.rollDescription = rollDescription || 'rolling some dice!';

		let characterText = this.character ? `${character.characterData.name} is ` : '';
		this.title = _.capitalize(`${characterText}${this.rollDescription}`);
	}

	/**
	 * Rolls an expression for the embed
	 * @param rollExpression The roll expression to roll
	 * @param rollTitle The optional title of the roll. If the embed
	 *                  only has a single roll, this will be overwritten
	 */
	public addRoll(rollExpression: string, rollTitle?: string) {
		const rollField = {
			name: rollTitle || '\u200B',
			value: `Yip! Something went wrong while rolling this!`,
		};
		try {
			const roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(rollExpression);
			if (roll.errors?.length) {
				rollField.value =
					`Yip! We didn't understand the dice roll.\n` + roll.errors.join('\n');
			} else {
				rollField.value = `${rollExpression}\n${roll.renderedExpression.toString()}\n total = \`${
					roll.total
				}\``;
			}
		} catch (err) {
			console.warn(err);
			rollField.value = `Yip! We didn't understand the dice roll "${rollExpression}".`;
		}
		this.rollResults.push(rollField);
	}
	/**
	 * Compiles all of the roll results and fields into a message embed
	 * @returns A message embed containing the full roll results
	 */
	public compileEmbed() {
		const response = new MessageEmbed().setTitle(this.title).setColor('GREEN');

		let characterData = this.character.characterData as WG.CharacterApiResponse;
		if (characterData.infoJSON?.imageURL) {
			response.setThumbnail(characterData.infoJSON.imageURL);
		}

		if (this.rollResults.length > 1) {
			response.addFields(this.rollResults);
		} else if (this.rollResults.length === 1) {
			response.setDescription(this.rollResults[0].value);
		}
		if (this.rollNote) {
			response.addFields([{ name: 'note', value: this.rollNote }]);
		}
		return response;
	}
}

const damageTypeMatch = / [A-Za-z]+$/;
export function parseDiceFromWgDamageField(wgDamageField: string): string {
	return wgDamageField.replace(damageTypeMatch, '');
}

export function buildDiceExpression(
	baseDice?: string,
	bonus?: string,
	modifierExpression?: string
) {
	let builtDice = '';
	//if we have a bonus, and the bonus does not start with + or -
	if (bonus?.length && !['-', '+'].includes(bonus.charAt(0))) {
		//add a sign to the bonus
		bonus = '+' + bonus;
	}

	//if we have a bonus, but no base dice, base the dice on a d20
	if (bonus && !baseDice) {
		baseDice = 'd20';
	}

	let wrappedModifierExpression = '';
	if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;

	return `${baseDice}${bonus || ''}${wrappedModifierExpression}`;
}
