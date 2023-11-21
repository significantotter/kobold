import { Dice, DiceResult } from 'dice-typescript';
import { APIEmbedField } from 'discord.js';
import _ from 'lodash';
import { attributeShorthands, staticAttributes } from '../constants/attributes.js';
import L from '../i18n/i18n-node.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Attribute, Modifier } from '../services/kobold/index.js';
import type { Creature } from './creature.js';
import { WritableDeep } from 'type-fest';

export interface ComputedDiceResult extends DiceResult {
	total: number;
	renderedExpression: string;
}

export class DiceRollError extends Error {
	constructor(
		message: string,
		public diceExpression?: string
	) {
		super(message);
		this.name = 'DiceRollError';
	}
}

export interface DiceRollResult extends APIEmbedField {
	results: WritableDeep<DiceResult>;
	targetDC?: number;
	success?: 'critical success' | 'success' | 'failure' | 'critical failure';
	type: 'dice';
	damageType?: string;
}
export interface MultiRollResult {
	results: Omit<DiceRollResult, 'type'>[];
	name: string;
	appliedDamage?: number;
	type: 'multiDice';
}
export interface TextResult {
	name: string;
	value: string;
	type: 'text';
}

export interface ErrorResult {
	type: 'error';
	value: string;
}

export type ResultField = DiceRollResult | MultiRollResult | TextResult | ErrorResult;

const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;

const damageTypeMatch = / [A-Za-z \-_,\/]+$/;
export class DiceUtils {
	public static removeNonDice(wgDamageField: string): string {
		return wgDamageField.replace(damageTypeMatch, '');
	}
	public static getNonDice(wgDamageField: string): string | null {
		const match = wgDamageField.match(damageTypeMatch);
		if (!match) return null;
		else return match[0];
	}

	public static addNumberToDiceExpression(diceExpression: string, number: number): string {
		if (isNaN(number)) return diceExpression;
		// Use a regex to split out +/- a number at the end of the dice expression
		const regex = / *(\+|-) *(\d+)$/;
		const match = diceExpression.match(regex);
		if (match) {
			// If we have a match, convert the parsed value to a number, add it with our number, then replace it in the original string
			const parsedNumber = Number(match[0].replaceAll(' ', ''));
			const newNumber = parsedNumber + number;
			return diceExpression.replace(
				regex,
				`${newNumber < 0 ? '-' : '+'}${Math.abs(newNumber)}`
			);
		} else {
			// If we don't have a match, just add the number to the end of the string
			return `${diceExpression}${number < 0 ? '-' : '+'}${Math.abs(number)}`;
		}
	}

	public static buildDiceExpression(
		baseDice?: string | null,
		bonus?: string | null,
		modifierExpression?: string | null
	) {
		if (!baseDice && !bonus && !modifierExpression) return '';

		//if we have a bonus, and the bonus does not start with + or -
		if (bonus?.length && !['-', '+'].includes(bonus.charAt(0))) {
			//add a sign to the bonus
			bonus = '+' + bonus;
		}

		//if we have a bonus, but no base dice, base the dice on a d20
		if (bonus && !bonus.includes('d20') && !baseDice) {
			baseDice = 'd20';
		}

		let wrappedModifierExpression = '';
		if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;

		return `${baseDice ?? ''}${bonus ?? ''}${wrappedModifierExpression ?? ''}`;
	}

	public static parseAttribute(
		token: string,
		creature?: Creature,
		extraAttributes?: Attribute[]
	): [number, string[]] {
		const attributes = creature?.attributes || [];

		const trimRegex = /[\[\]\\ _\-]/g;
		const trimmedToken = token.replace(trimRegex, '').trim().toLowerCase();

		const attributeName = attributeShorthands[trimmedToken] || trimmedToken;

		const attribute = attributes.find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		const staticAttribute = staticAttributes(creature?.sheet).find(
			attributeObject =>
				attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		let extraAttribute: { tags?: string[]; value: number; [k: string]: any } | undefined =
			undefined;
		if (extraAttributes) {
			const potentialExtraAttribute = extraAttributes.find(
				attributeObject =>
					attributeObject.name.replace(trimRegex, '').toLowerCase() === attributeName
			);
			if (potentialExtraAttribute) extraAttribute = potentialExtraAttribute;
		}

		if (attribute?.value !== undefined) {
			return [attribute.value, attribute.tags];
		} else if (staticAttribute?.value !== undefined) {
			return [staticAttribute.value, []];
		} else if (extraAttribute && extraAttribute?.value !== undefined) {
			return [extraAttribute.value, extraAttribute?.tags || []];
		} else {
			return [0, []];
		}
	}

	public static parseAttributes(
		rollExpression: string,
		creature?: Creature,
		extraAttributes: Attribute[] = []
	): [string, string[]] {
		const splitExpression = rollExpression.split(attributeRegex);
		const newTags = [];
		let finalExpression = '';
		for (const token of splitExpression) {
			if (attributeRegex.test(token)) {
				const [resultValue, resultTags] = DiceUtils.parseAttribute(
					token,
					creature,
					extraAttributes
				);
				// apply the rest
				if (resultValue < 0) finalExpression += `(${resultValue})`;
				else finalExpression += resultValue;
				newTags.push(...resultTags);
			} else {
				finalExpression += token;
			}
		}
		return [finalExpression, _.uniq(newTags)];
	}

	public static parseDiceExpression({
		rollExpression,
		creature,
		tags,
		skipModifiers,
		extraAttributes,
		modifierMultiplier,
	}: {
		rollExpression: string;
		creature?: Creature;
		tags?: string[];
		skipModifiers?: boolean;
		extraAttributes?: Attribute[];
		modifierMultiplier?: number;
	}) {
		let modifiers: Modifier[] = [];
		let finalTags: string[] = [];

		let expandedExpression = creature
			? creature.expandRollWithMacros(rollExpression)
			: rollExpression;

		// check for any referenced creature attributes in the roll
		let [parsedExpression, parsedTags] = DiceUtils.parseAttributes(
			expandedExpression,
			creature,
			extraAttributes
		);
		let displayExpression = parsedExpression;

		finalTags = (tags || []).concat(parsedTags);

		// if we have a creature and tags, check for active modifiers
		if (creature && finalTags.length && !skipModifiers) {
			modifiers = creature.getModifiersFromTags(finalTags, extraAttributes ?? []);
		}
		for (const modifier of modifiers) {
			if (modifier.modifierType === 'sheet') continue;
			// add to both the parsed expression and the initial roll expression
			// the roll expression shows the user the meaning behind the roll values, while
			// the parsed expression just has the math for the dice roller to use

			const expandedModifier = creature
				? creature.expandRollWithMacros(modifier.value.toString())
				: modifier.value.toString();

			const [parsedModifier] = DiceUtils.parseAttributes(
				expandedModifier,
				creature,
				extraAttributes
			);

			const modifierMultiplierText =
				modifierMultiplier ?? 1 !== 1 ? `x${modifierMultiplier ?? 1}` : '';
			displayExpression += ` + "${
				modifier.name
			}" ${modifier.value.toString()}${modifierMultiplierText}`;
			if (modifierMultiplier && modifierMultiplier !== 1) {
				parsedExpression += ` +((${parsedModifier})*(${modifierMultiplier ?? 1}))`;
			} else parsedExpression += ` +(${parsedModifier})`;
		}

		return {
			rollExpression: parsedExpression,
			displayExpression,
			tags: finalTags,
		};
	}

	/**
	 * Takes a dice expression and tags, rolls it, and returns an object containing key information
	 * @param rollExpression The roll expression to roll
	 * @param tags an array of strings that describe the roll and how modifiers
	 * 					apply to it.
	 * @param extraAttributes an object containing extra attributes to add to the roll
	 */
	public static parseAndEvaluateDiceExpression({
		rollExpression,
		damageType,
		creature,
		tags,
		extraAttributes,
		skipModifiers = false,
		multiplier,
		modifierMultiplier,
	}: {
		rollExpression: string;
		damageType?: string;
		creature?: Creature;
		tags?: string[];
		extraAttributes?: Attribute[];
		skipModifiers?: boolean;
		multiplier?: number;
		modifierMultiplier?: number;
	}): {
		value: string;
		parsedExpression: string;
		results: WritableDeep<DiceResult>;
		multiplier?: number;
		totalTags: string[];
	} {
		let displayExpression = rollExpression;
		try {
			let parseResults = DiceUtils.parseDiceExpression({
				rollExpression,
				creature,
				tags,
				skipModifiers,
				extraAttributes,
				modifierMultiplier,
			});

			displayExpression = parseResults.displayExpression;
			const parsedExpression = parseResults.rollExpression;
			const totalTags = parseResults.tags;

			let roll = new Dice(undefined, undefined, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(parsedExpression) as WritableDeep<DiceResult>;

			if (roll.errors?.length) {
				throw new DiceRollError(
					roll.errors.map(err => err.message).join('\n'),
					roll.renderedExpression.toString()
				);
			}

			if (multiplier !== undefined && multiplier !== 1) {
				roll.renderedExpression = `(${roll.renderedExpression.toString()}) * ${multiplier}`;
			}
			roll.total = Math.floor(roll.total * (multiplier ?? 1));

			const message = L.en.utils.dice.rollResult({
				rollExpression: displayExpression,
				rollRenderedExpression: roll.renderedExpression.toString(),
				rollTotal: `${roll.total} ${damageType ?? ''}`,
			});

			return {
				value: message,
				parsedExpression,
				results: roll,
				multiplier,
				totalTags,
			};
		} catch (err) {
			if (err instanceof DiceRollError) {
				throw err;
			} else {
				throw new DiceRollError(
					L.en.utils.dice.diceRollError({
						rollExpression: rollExpression,
					}),
					rollExpression
				);
			}
		}
	}
}
