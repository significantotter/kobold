import { Character } from './../services/kobold/models/character/character.model';
import { CommandInteraction, APIEmbedField, EmbedBuilder, User } from 'discord.js';
import { Dice, DiceResult, ExpressionNode, NodeType } from 'dice-typescript';
import type { WG } from './../services/wanderers-guide/wanderers-guide.js';
import _ from 'lodash';
import { CharacterUtils } from './character-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Language } from '../models/enum-helpers/index.js';
import { attributeShorthands, staticAttributes } from '../constants/attributes.js';

export interface DiceRollResult extends APIEmbedField {
	results: DiceResult | null;
	targetDC?: number;
	success?: 'critical success' | 'success' | 'failure' | 'critical failure';
	type: 'dice';
}
export interface MultiRollResult {
	results: Omit<DiceRollResult, 'type'>[];
	name: string;
	type: 'multiDice';
}
export interface textResult {
	name: string;
	value: string;
	type: 'text';
}

export type ResultField = DiceRollResult | MultiRollResult | textResult;

const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;

export class RollBuilder {
	private character: Character | null;
	private rollDescription: string;
	private rollNote: string;
	public rollResults: ResultField[];
	private footer: string;
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
		this.footer = '';

		const actorText = character?.characterData?.name || actorName || '';
		this.title = title || _.capitalize(`${actorText} ${this.rollDescription}`.trim());
	}

	public parseAttribute(
		token: string,
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[]
	): [number | null, string[]] {
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
		const staticAttribute = staticAttributes(this.character).find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		let extraAttribute: { tags?: string[]; value: number; [k: string]: any } = {
			value: undefined,
			tags: [],
		};
		if (extraAttributes) {
			extraAttribute = extraAttributes.find(
				attributeObject =>
					attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
			);
		}
		if (customAttribute?.value !== undefined) {
			return [customAttribute.value, customAttribute.tags];
		} else if (attribute?.value !== undefined) {
			return [attribute.value, attribute.tags];
		} else if (staticAttribute?.value !== undefined) {
			return [staticAttribute.value, []];
		} else if (extraAttribute?.value !== undefined) {
			return [extraAttribute.value, extraAttribute?.tags || []];
		} else {
			return [null, []];
		}
	}

	public parseAttributes(
		rollExpression: string,
		extraAttributes: {
			name: string;
			value: number;
			tags?: string[];
		}[] = []
	): [string, string[]] {
		const splitExpression = rollExpression.split(attributeRegex);
		const newTags = [];
		let finalExpression = '';
		for (const token of splitExpression) {
			if (attributeRegex.test(token)) {
				const [resultValue, resultTags] = this.parseAttribute(token, extraAttributes);
				// skip attributes that don't exist
				if (resultValue === null) continue;
				// apply the rest
				if (resultValue < 0) finalExpression += `(${resultValue})`;
				else finalExpression += resultValue;
				newTags.push(...resultTags);
			} else {
				finalExpression += token;
			}
		}
		return [finalExpression, newTags];
	}

	/**
	 * Takes a dice expression and tags, rolls it, and returns an object containing key information
	 * @param rollExpression The roll expression to roll
	 * @param tags an array of strings that describe the roll and how modifiers
	 * 					apply to it.
	 * @param extraAttributes an object containing extra attributes to add to the roll
	 */
	public parseAndEvaluateDiceExpression({
		rollExpression,
		tags,
		extraAttributes,
		multiplier,
		modifierMultiplier,
	}: {
		rollExpression: string;
		tags?: string[];
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[];
		multiplier?: number;
		modifierMultiplier?: number;
	}) {
		const rollInformation: {
			value: string;
			results: DiceResult | null;
			multiplier?: number;
			totalTags: string[];
		} = {
			value: '',
			results: null,
			multiplier: null,
			totalTags: [],
		};
		let totalTags = tags || [];
		try {
			const modifier = 0;
			let modifiers = [];

			// check for any referenced character attributes in the roll
			let [parsedExpression, parsedTags] = this.parseAttributes(
				rollExpression,
				extraAttributes
			);

			rollInformation.totalTags = totalTags.concat(parsedTags);

			// if we have a character and tags, check for active modifiers
			if (this.character && totalTags.length) {
				modifiers = this.character.getModifiersFromTags(rollInformation.totalTags);
			}
			for (const modifier of modifiers) {
				// add to both the parsed expression and the initial roll expression
				// the roll expression shows the user the meaning behind the roll values, while
				// the parsed expression just has the math for the dice roller to use
				const modifierSymbol = modifier.value >= 0 ? '+' : '-';
				const modifierMultiplierText =
					modifierMultiplier ?? 1 !== 1 ? `x${modifierMultiplier ?? 1}` : '';
				rollExpression += ` ${modifierSymbol} "${modifier.name}" ${Math.abs(
					modifier.value
				)}${modifierMultiplierText}`;
				parsedExpression += ` ${modifierSymbol} ${Math.floor(
					Math.abs(modifier.value) * (modifierMultiplier ?? 1)
				)}`;
			}
			let roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(parsedExpression);
			if (roll.errors?.length) {
				rollInformation.value = this.LL.utils.dice.diceRollOtherErrors({
					rollErrors: roll.errors.map(err => err.message).join('\n'),
				});
			} else {
				const untypedRoll: any = roll;
				if (multiplier !== undefined && multiplier !== 1) {
					untypedRoll.total = Math.floor(untypedRoll.total * multiplier);
					untypedRoll.renderedExpression = `(${untypedRoll.renderedExpression.toString()}) * ${multiplier}`;
				}
				rollInformation.value = this.LL.utils.dice.rollResult({
					rollExpression,
					rollRenderedExpression: roll.renderedExpression.toString(),
					rollTotal: roll.total,
				});
				rollInformation.results = roll;
			}
		} catch (err) {
			console.warn(err);
			rollInformation.value = this.LL.utils.dice.diceRollError({ rollExpression });
		}
		return rollInformation;
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
			...this.parseAndEvaluateDiceExpression({
				rollExpression: rollExpression.rollExpression,
				tags: rollExpression.tags,
				extraAttributes: rollExpression.extraAttributes,
				modifierMultiplier: rollExpression.modifierMultiplier,
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
		tags,
		extraAttributes,
		targetDC,
		multiplier = 1,
		showTags = true,
		rollType,
	}: {
		rollExpression: string;
		rollTitle?: string;
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
		const rollField = this.parseAndEvaluateDiceExpression({
			rollExpression,
			tags,
			extraAttributes,
			multiplier,
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
				const rollResult = this.parseAndEvaluateDiceExpression({
					rollExpression,
					extraAttributes,
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
		const result: textResult = { name: title, type: 'text', value: finalString.join('') };

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

		let characterData = this.character?.characterData as WG.CharacterApiResponse;
		if (characterData?.infoJSON?.imageURL) {
			response.setThumbnail(characterData.infoJSON.imageURL);
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

	public static rollSkill({
		userName,
		activeCharacter,
		skillChoice,
		rollNote,
		modifierExpression,
		description,
		tags,
		LL,
	}: {
		userName: string;
		activeCharacter: Character;
		skillChoice: string;
		rollNote?: string;
		modifierExpression?: string;
		description?: string;
		tags?: string[];
		LL?: TranslationFunctions;
	}) {
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
		let targetSkillAttribute = activeCharacter.attributes.find(
			attr =>
				attr.name.trim().toLocaleLowerCase() === targetSkill.Name.trim().toLocaleLowerCase()
		);
		let skillTags = targetSkillAttribute?.tags || ['skill', skillChoice.toLocaleLowerCase()];

		const rollBuilder = new RollBuilder({
			actorName: userName,
			character: activeCharacter,
			rollNote,
			rollDescription: LL.utils.dice.rolledAction({
				actionName: targetSkill.Name,
			}),
		});
		rollBuilder.addRoll({
			rollExpression: DiceUtils.buildDiceExpression(
				'd20',
				String(targetSkill.Bonus),
				modifierExpression
			),
			tags: (tags || []).concat(skillTags),
		});
		return rollBuilder;
	}
}
