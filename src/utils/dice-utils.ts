import { Logger } from './../services/logger';
import { Character } from './../services/kobold/models/character/character.model';
import { CommandInteraction, APIEmbedField, EmbedBuilder, User } from 'discord.js';
import { Dice, DiceResult } from 'dice-typescript';
import type { WG } from './../services/wanderers-guide/wanderers-guide.js';
import _ from 'lodash';
import { CharacterUtils } from './character-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Language } from '../models/enum-helpers/index.js';
import { attributeShorthands, staticAttributes } from '../constants/attributes.js';

interface DiceRollResult extends APIEmbedField {
	results: DiceResult | null;
}

const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;

export class RollBuilder {
	private character: Character | null;
	private rollDescription: string;
	private rollNote: string;
	public rollResults: DiceRollResult[];
	private title: string;
	private LL: TranslationFunctions;

	constructor({
		actorName,
		character,
		rollDescription,
		rollNote,
		title,
		LL,
	}: {
		actorName?: string;
		character?: Character | null;
		rollDescription?: string;
		rollNote?: string;
		title?: string;
		LL?: TranslationFunctions;
	}) {
		this.rollResults = [];
		this.character = character || null;
		this.rollNote = rollNote;
		this.rollDescription = rollDescription;
		this.LL = LL || Language.LL;

		const actorText = character?.characterData?.name || actorName || '';
		this.title = title || _.capitalize(`${actorText} ${this.rollDescription}`.trim());
	}

	public parseAttribute(token: string): string {
		const attributes = this.character?.attributes || [];
		const customAttributes = this.character?.customAttributes || [];

		const trimRegex = /[\[\]\\ _\-]/g;
		const trimmedToken = token.replace(trimRegex, '').trim().toLowerCase();

		const attributeName = attributeShorthands[trimmedToken] || trimmedToken;

		const attribute = attributes.find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		const customAttribute = customAttributes.find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		const staticAttribute = staticAttributes.find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);

		return `(${customAttribute?.value || attribute?.value || staticAttribute?.value || token})`;
	}

	public parseAttributes(rollExpression: string): string {
		const splitExpression = rollExpression.split(attributeRegex);
		let finalExpression = '';
		for (const token of splitExpression) {
			if (attributeRegex.test(token)) {
				finalExpression += this.parseAttribute(token);
			} else {
				finalExpression += token;
			}
		}
		return finalExpression;
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
			value: '',
			results: null,
		};
		try {
			const parsedExpression = this.parseAttributes(rollExpression);
			const roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(parsedExpression);
			if (roll.errors?.length) {
				rollField.value = this.LL.utils.dice.diceRollOtherErrors({
					rollErrors: roll.errors.map(err => err.message).join('\n'),
				});
			} else {
				rollField.value = this.LL.utils.dice.rollResult({
					rollExpression,
					rollRenderedExpression: roll.renderedExpression.toString(),
					rollTotal: roll.total,
				});
				rollField.results = roll;
			}
		} catch (err) {
			console.warn(err);
			rollField.value = this.LL.utils.dice.diceRollError({ rollExpression });
		}
		this.rollResults.push(rollField);
	}
	/**
	 * Compiles all of the roll results and fields into a message embed
	 * @returns A message embed containing the full roll results
	 */
	public compileEmbed() {
		const response = new KoboldEmbed().setTitle(this.title);

		let characterData = this.character?.characterData as WG.CharacterApiResponse;
		if (characterData?.infoJSON?.imageURL) {
			response.setThumbnail(characterData.infoJSON.imageURL);
		}

		if (this.rollResults.length > 1) {
			response.addFields(
				//strip extra properties from the roll results
				this.rollResults.map(result => ({ name: result.name, value: result.value }))
			);
		} else if (this.rollResults.length === 1) {
			response.setDescription(this.rollResults[0].value);
		}
		if (this.rollNote) {
			response.setFooter({ text: this.rollNote });
		}
		return response;
	}
}

const damageTypeMatch = / [A-Za-z \-_,\/]+$/;
export class DiceUtils {
	public static parseDiceFromWgDamageField(wgDamageField: string): string {
		return wgDamageField.replace(damageTypeMatch, '');
	}

	public static buildDiceExpression(
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

	public static rollSkill(
		intr: CommandInteraction,
		activeCharacter: Character,
		skillChoice: string,
		rollNote?: string,
		modifierExpression?: string,
		description?: string,
		LL?: TranslationFunctions
	) {
		LL = LL || Language.LL;
		const skillsPlusPerception = [
			...activeCharacter.calculatedStats.totalSkills,
			{
				Name: 'Perception',
				Bonus: activeCharacter.calculatedStats.totalPerception,
			},
		] as WG.NamedBonus[];

		//use the first skill that matches the text of what we were sent, or preferably a perfect match
		let targetSkill = CharacterUtils.getBestNameMatch(skillChoice, skillsPlusPerception);

		const rollBuilder = new RollBuilder({
			actorName: intr.user.username,
			character: activeCharacter,
			rollNote,
			rollDescription: LL.utils.dice.rolledAction({
				actionName: targetSkill.Name,
			}),
		});
		rollBuilder.addRoll(
			DiceUtils.buildDiceExpression('d20', String(targetSkill.Bonus), modifierExpression)
		);
		return rollBuilder;
	}
}
