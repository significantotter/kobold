import { APIEmbedField } from 'discord.js';
import _ from 'lodash';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Language } from '../models/enum-helpers/language.js';
import { Character } from '../services/kobold/models/index.js';
import { Creature } from './creature.js';
import {
	DiceUtils,
	DiceRollResult,
	MultiRollResult,
	TextResult,
	ResultField,
} from './dice-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';

export class RollBuilder {
	private creature: Creature | null;
	private rollDescription: string;
	private rollNote: string;
	public rollResults: ResultField[];
	private footer: string;
	private title: string;
	private LL: TranslationFunctions;

	constructor({
		actorName,
		character,
		creature,
		rollDescription,
		rollNote,
		title,
		LL,
	}: {
		actorName?: string;
		character?: Character | null;
		creature?: Creature;
		rollDescription?: string;
		rollNote?: string;
		title?: string;
		LL?: TranslationFunctions;
	}) {
		this.rollResults = [];
		this.rollNote = rollNote;
		this.rollDescription = rollDescription;
		this.LL = LL || Language.LL;
		this.footer = '';
		this.creature = creature || null;
		if (character && !this.creature) {
			this.creature = Creature.fromCharacter(character);
		}

		const actorText = actorName || this.creature?.sheet?.info?.name || '';
		this.title = title || _.capitalize(`${actorText} ${this.rollDescription}`.trim());
	}

	/**
	 * Rolls multiple expressions for a single field for the embed
	 * @param rollExpressions The roll expressions to roll
	 * @param rollTitle The optional title of the roll. If the embed
	 *                  only has a single roll, this will be overwritten
	 * @param tags an array of strings that describe the roll and how modifiers
	 * 					apply to it.
	 * @param extraAttributes an object containing extra attributes to add to the roll
	 */
	public addMultiRoll({
		rollTitle,
		rollExpressions,
		showTags = true,
	}: {
		rollTitle?: string;
		rollExpressions: {
			name: string;
			damageType: string;
			rollExpression: string;
			tags?: string[];
			modifierMultiplier?: number;
			extraAttributes?: {
				name: string;
				value: number;
				tags?: string[];
			}[];
		}[];
		showTags?: boolean;
	}) {
		const title = rollTitle || '\u200B';
		let values = '';
		const rollFields = rollExpressions.map(rollExpression => ({
			...DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: rollExpression.rollExpression,
				tags: rollExpression.tags,
				extraAttributes: rollExpression.extraAttributes,
				modifierMultiplier: rollExpression.modifierMultiplier,
				creature: this.creature,
				LL: this.LL,
			}),
			name: rollExpression.name,
		}));
		const rollResult: MultiRollResult = { name: title, type: 'multiDice', results: rollFields };
		this.rollResults.push(rollResult);

		return rollResult;
	}

	public determineNatOneOrNatTwenty(node) {
		// depth first search for nat 20s or nat 1s
		// each node has a children array of expression nodes
		// if the node has an 'attributes' object with a 'sides' property of 20, it's a d20
		// if the node type is "keep" or "drop" it's a combination of dice rolls, and we need to check the children to see if they're d20s
		// if the node is a d20, or is a keep of d20s, then we check the "value" to see if it's 20 or 1

		if (node.type === 'Dice' && node.attributes.sides === 20) {
			if (node.attributes.value === 20) return 'nat 20';
			else if (node.attributes.value === 1) return 'nat 1';
			else return null;
		} else if (node.type === 'Keep' || node.type === 'Drop') {
			// check the children
			for (const child of node.children) {
				if (child.type === 'Dice' && child.attributes.sides === 20) {
					if (node.attributes.value === 20) return 'nat 20';
					else if (node.attributes.value === 1) return 'nat 1';
					else return null;
				}
			}
		} else {
			// check the children
			for (const child of node.children || []) {
				const result = this.determineNatOneOrNatTwenty(child);
				if (result) return result;
			}
		}
	}

	/**
	 * Rolls an expression for the embed
	 * @param rollExpression The roll expression to roll
	 * @param rollTitle The optional title of the roll. If the embed
	 *                  only has a single roll, this will be overwritten
	 * @param tags an array of strings that describe the roll and how modifiers
	 * 					apply to it.
	 * @param extraAttributes an object containing extra attributes to add to the roll
	 */
	public addRoll({
		rollExpression,
		rollTitle,
		damageType,
		tags,
		extraAttributes,
		targetDC,
		multiplier = 1,
		showTags = true,
		rollType,
	}: {
		rollExpression: string;
		rollTitle?: string;
		damageType?: string;
		tags?: string[];
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[];
		targetDC?: number;
		multiplier?: number;
		showTags?: boolean;
		rollType?: 'attack' | 'damage' | 'save';
	}) {
		const rollField = DiceUtils.parseAndEvaluateDiceExpression({
			rollExpression,
			damageType,
			tags,
			extraAttributes,
			multiplier,
			creature: this.creature,
			LL: this.LL,
		});
		const title = rollTitle || '\u200B';
		let totalTags = tags || [];

		let rollResult: DiceRollResult = { ...rollField, name: title, type: 'dice' };

		if (targetDC) {
			const saveTitleAdditionText = {
				'critical success': ' Critical Success.',
				success: ' Success.',
				failure: ' Failure!',
				'critical failure': ' Critical Failure!',
			};
			const attackTitleAdditionText = {
				'critical success': ' Critical Hit!',
				success: ' Hit!',
				failure: ' Miss.',
				'critical failure': ' Miss.',
			};

			let natTwenty = null;
			try {
				natTwenty = this.determineNatOneOrNatTwenty(rollResult.results.reducedExpression);
			} catch (err) {
				console.log(err);
			}

			let result: 'critical success' | 'success' | 'failure' | 'critical failure' | null =
				null;
			let numericResult = -1;

			if (rollResult.results.total >= targetDC + 10) {
				numericResult = 4;
			} else if (rollResult.results.total >= targetDC) {
				numericResult = 3;
			} else if (rollResult.results.total <= targetDC - 10) {
				numericResult = 1;
			} else if (rollResult.results.total < targetDC) {
				numericResult = 2;
			}

			if (numericResult !== -1) {
				if (natTwenty === 'nat 20') {
					numericResult = Math.min(numericResult + 1, 4);
				} else if (natTwenty === 'nat 1') {
					numericResult = Math.max(numericResult - 1, 1);
				}
				if (numericResult === 1) result = 'critical failure';
				else if (numericResult === 2) result = 'failure';
				else if (numericResult === 3) result = 'success';
				else if (numericResult === 4) result = 'critical success';
			}

			let titleAdditionText = '';
			if (natTwenty) titleAdditionText += ` ${_.capitalize(natTwenty)}!`;
			if (rollType === 'attack') titleAdditionText += attackTitleAdditionText[result];
			else if (rollType === 'save') titleAdditionText += saveTitleAdditionText[result];

			rollResult.targetDC = targetDC;
			rollResult.success = result;
			rollResult.name = `${rollResult.name}.${titleAdditionText}`;
		}

		this.rollResults.push(rollResult);

		if (totalTags?.length && showTags) {
			const rollTagsText = rollTitle ? `${rollTitle} tags` : 'tags';
			this.footer = this.footer
				? `${this.footer}\n${rollTagsText}: ${totalTags.join(', ')}`
				: `${rollTagsText}: ${totalTags.join(', ')}`;
		}
		return rollResult;
	}

	addText({
		title,
		text,
		extraAttributes,
		tags,
	}: {
		title: string;
		text: string;
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[];
		tags?: string[];
	}) {
		// parse and evaluate any rolls in the text
		const finalString = [];

		const splitText = text.split('{{');
		for (let i = 0; i < splitText.length; i++) {
			if (splitText[i].indexOf('}}') !== -1) {
				const [rollExpression, postRollExpressionText] = splitText[i].split('}}');
				const rollResult = DiceUtils.parseAndEvaluateDiceExpression({
					rollExpression,
					extraAttributes,
					creature: this.creature,
					LL: this.LL,
				});
				let resultText = '';
				if (rollResult.results.renderedExpression == rollResult.results.total.toString()) {
					resultText = '`' + rollResult.results.total.toString() + '`';
				} else {
					resultText = `\`${
						rollResult.results.total
					}="${rollResult.results.renderedExpression.toString()}"\``;
				}
				finalString.push(resultText, postRollExpressionText);
			} else {
				finalString.push(splitText[i]);
			}
		}
		const result: TextResult = { name: title, type: 'text', value: finalString.join('') };

		this.rollResults.push(result);
		return result;
	}

	/**
	 * Returns an array of all of the final numeric results of the roll or multiroll fields
	 */
	public getRollTotalArray(): number[] {
		const resultArray: number[] = [];
		for (const result of this.rollResults) {
			if (result.type === 'dice') {
				resultArray.push(result.results.total);
			} else if (result.type === 'multiDice') {
				for (const subResult of result.results) {
					resultArray.push(subResult.results.total);
				}
			}
		}
		return resultArray;
	}

	/**
	 * Converts a roll result step into an embed display field
	 * @param result The result field to convert to an embed field
	 * @returns
	 */
	public convertResultToEmbedField(result: ResultField) {
		if (result.type === 'multiDice') {
			return {
				name: result.name,
				value: result.results
					.map(
						roll =>
							`${roll.name}: ${roll.value
								.replaceAll('*', '\\*')
								.replaceAll('_', '\\_')}`
					)
					.join('\n'),
			};
		} else if (result.type === 'text') {
			return {
				name: result.name,
				value: result.value,
			};
		} else if (result.type === 'dice') {
			return {
				name: result.name,
				value: result.value.replaceAll('*', '\\*').replaceAll('_', '\\_'),
			};
		}
	}

	/**
	 * Compiles all of the roll results and fields into a message embed
	 * @returns A message embed containing the full roll results
	 */
	public compileEmbed(
		options: { compact?: boolean; forceFields?: boolean; showTags?: boolean } = {
			compact: false,
			forceFields: false,
			showTags: true,
		}
	) {
		const response = new KoboldEmbed().setTitle(this.title);

		if (this.creature?.sheet?.info?.imageURL) {
			response.setThumbnail(this.creature.sheet.info.imageURL);
		}

		if (this.rollResults.length > 1 || options?.forceFields) {
			response.addFields(
				//strip extra properties from the roll results
				this.rollResults
					.map(result => this.convertResultToEmbedField(result))
					.filter(result => result.value !== '')
			);
		} else if (this.rollResults.length === 1) {
			const resultField = this.convertResultToEmbedField(this.rollResults[0]);
			response.setDescription(resultField.value);
		}
		const rollNote = this.rollNote ? this.rollNote + '\n\n' : '';
		const footer = this.footer || '';
		if ((rollNote + footer).length) {
			response.setFooter({ text: rollNote + footer });
		}

		return response;
	}
}
