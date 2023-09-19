import { APIEmbedField, ChatInputCommandInteraction } from 'discord.js';
import { Dice, DiceResult } from 'dice-typescript';
import _ from 'lodash';
import { RollBuilder } from './roll-builder.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { attributeShorthands, staticAttributes } from '../constants/attributes.js';
import { Creature } from './creature.js';
import { ActionRoller } from './action-roller.js';
import { getEmoji } from '../constants/emoji.js';
import { EmbedUtils, KoboldEmbed } from './kobold-embed-utils.js';
import { Action, Attribute, Modifier, UserSettings } from '../services/kobold/models/index.js';
import { KoboldError } from './KoboldError.js';
import L from '../i18n/i18n-node.js';

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
	results: DiceResult;
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

export type ResultField = DiceRollResult | MultiRollResult | TextResult;

const attributeRegex = /(\[[\w \-_\.]{2,}\])/g;

const damageTypeMatch = / [A-Za-z \-_,\/]+$/;
export class DiceUtils {
	public static parseDiceFromWgDamageField(wgDamageField: string): string {
		return wgDamageField.replace(damageTypeMatch, '');
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
		skipModifiers,
		multiplier,
		modifierMultiplier,
		LL = L.en,
	}: {
		rollExpression: string;
		damageType?: string;
		creature?: Creature;
		tags?: string[];
		extraAttributes?: Attribute[];
		skipModifiers?: boolean;
		multiplier?: number;
		modifierMultiplier?: number;
		LL?: TranslationFunctions;
	}): {
		value: string;
		parsedExpression: string;
		results: ComputedDiceResult;
		multiplier?: number;
		totalTags: string[];
	} {
		let totalTags = tags || [];
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
			}).roll(parsedExpression);
			const results: ComputedDiceResult = { ...roll, total: 0, renderedExpression: '' };

			if (roll.errors?.length) {
				throw new DiceRollError(
					roll.errors.map(err => err.message).join('\n'),
					roll.renderedExpression.toString()
				);
			}

			if (multiplier !== undefined && multiplier !== 1) {
				results.total = Math.floor(roll.total * multiplier);
				results.renderedExpression = `(${roll.renderedExpression.toString()}) * ${multiplier}`;
			}

			const message = LL.utils.dice.rollResult({
				rollExpression: displayExpression,
				rollRenderedExpression: roll.renderedExpression.toString(),
				rollTotal: `${roll.total} ${damageType ?? ''}`,
			});

			return {
				value: message,
				parsedExpression,
				results,
				multiplier,
				totalTags,
			};
		} catch (err) {
			if (err instanceof DiceRollError) {
				throw err;
			} else {
				throw new DiceRollError(
					LL.utils.dice.diceRollError({
						rollExpression: rollExpression,
					}),
					rollExpression
				);
			}
		}
	}
	public static rollSimpleCreatureRoll({
		userName,
		actorName,
		creature,
		attributeName,
		rollNote,
		modifierExpression,
		description,
		tags,
		userSettings,
		LL,
	}: {
		userName?: string;
		actorName?: string;
		creature: Creature;
		attributeName: string;
		rollNote?: string;
		modifierExpression?: string | null;
		description?: string;
		tags?: string[];
		userSettings?: UserSettings;
		LL?: TranslationFunctions;
	}): RollBuilder {
		LL = LL || L.en;

		const roll = creature.rolls[attributeName.toLowerCase()];
		if (!roll)
			throw new KoboldError(
				`Yip! I couldn\'t find a roll called "${attributeName.toLowerCase()}"`
			);

		const rollBuilder = new RollBuilder({
			actorName: actorName ?? creature.sheet.info.name ?? userName,
			creature: creature,
			rollNote,
			rollDescription:
				description ||
				LL.utils.dice.rolledAction({
					actionName: _.startCase(roll.name),
				}),
			userSettings,
		});
		rollBuilder.addRoll({
			rollTitle: _.startCase(roll.name),
			rollExpression: DiceUtils.buildDiceExpression(
				'd20',
				String(roll.bonus),
				modifierExpression
			),
			tags: (tags || []).concat(roll.tags),
		});
		return rollBuilder;
	}
	public static rollCreatureAttack({
		creature,
		targetCreature,
		attackName,
		rollNote,
		attackModifierExpression,
		damageModifierExpression,
		targetAC,
		userSettings,
		LL = L.en,
	}: {
		creature: Creature;
		targetCreature?: Creature;
		attackName: string;
		rollNote?: string;
		attackModifierExpression?: string;
		damageModifierExpression?: string;
		targetAC?: number;
		userSettings?: UserSettings;
		LL: TranslationFunctions;
	}): { actionRoller: ActionRoller; builtRoll: RollBuilder } {
		const targetAttack = creature.attackRolls[attackName.toLowerCase()];

		// build a little action from the attack!
		const action: Action = {
			name: targetAttack.name,
			description: '',
			baseLevel: 0,
			autoHeighten: false,
			type: 'attack',
			actionCost: 'oneAction',
			tags: [],
			rolls: [],
		};
		// add the attack roll
		if (targetAttack.toHit) {
			action.rolls.push({
				type: 'attack',
				name: 'To Hit',
				roll: DiceUtils.buildDiceExpression(
					'd20',
					String(targetAttack.toHit),
					attackModifierExpression
				),
				targetDC: 'AC',
				allowRollModifiers: true,
			});
		}

		// add the first damage roll with damage modifiers
		if (targetAttack.damage[0]) {
			action.rolls.push({
				type: 'damage',
				name: 'Damage',
				roll: DiceUtils.buildDiceExpression(
					String(DiceUtils.parseDiceFromWgDamageField(targetAttack.damage[0].dice)),
					null,
					damageModifierExpression
				),
				damageType: targetAttack.damage[0].type,
				allowRollModifiers: true,
			});
		}
		for (let i = 1; i < targetAttack.damage.length; i++) {
			action.rolls.push({
				type: 'damage',
				name: 'Damage',
				roll: DiceUtils.buildDiceExpression(
					String(DiceUtils.parseDiceFromWgDamageField(targetAttack.damage[i].dice))
				),
				damageType: targetAttack.damage[i].type,
				allowRollModifiers: false,
			});
		}

		const actionRoller = new ActionRoller(
			userSettings ?? null,
			action,
			creature,
			targetCreature
		);
		const builtRoll = actionRoller.buildRoll(
			rollNote ?? '',
			L.en.commands.roll.attack.interactions.rollEmbed.rollDescription({
				attackName: targetAttack.name,
			}),
			{
				targetDC: targetAC,
			}
		);
		return {
			actionRoller,
			builtRoll,
		};
	}
	public static async rollCreatureDice(
		creature: Creature,
		rollChoice: string,
		intr: ChatInputCommandInteraction,
		options: {
			overwriteCreatureName?: string;
			rollNote?: string;
			modifierExpression?: string;
			damageModifierExpression?: string;
			targetAC?: number;
			targetCreature?: Creature;
			hideStats: boolean;
			targetNameOverwrite?: string;
			sourceNameOverwrite?: string;
			userSettings?: UserSettings;
			LL?: TranslationFunctions;
		}
	): Promise<{ error: boolean; message: string | KoboldEmbed; actionRoller?: ActionRoller }> {
		const LL = options.LL ?? L.en;
		const targetRoll = creature.rolls[rollChoice] ?? creature.attackRolls[rollChoice];

		const targetAction = creature.keyedActions[rollChoice];
		let actionRoller: ActionRoller;

		if (!targetRoll) {
			return {
				error: true,
				message: LL.commands.init.roll.interactions.invalidRoll(),
			};
		}

		let embed: KoboldEmbed;

		if (['skill', 'ability', 'save', 'spell', 'check'].includes(targetRoll.type)) {
			const response = await DiceUtils.rollSimpleCreatureRoll({
				actorName: options.overwriteCreatureName,
				creature,
				attributeName: targetRoll.name,
				rollNote: options.rollNote ?? '',
				modifierExpression: options.modifierExpression,
				LL,
			});

			return { error: false, message: response.compileEmbed() };
		} else if (targetRoll.type === 'attack') {
			let attackResult = DiceUtils.rollCreatureAttack({
				creature,
				targetCreature: options.targetCreature,
				attackName: targetRoll.name,
				rollNote: options.rollNote,
				attackModifierExpression: options.modifierExpression,
				damageModifierExpression: options.damageModifierExpression,
				targetAC: options.targetAC,
				LL,
			});

			actionRoller = attackResult.actionRoller;

			embed = attackResult.builtRoll.compileEmbed({ forceFields: true });
		} else if (targetAction) {
			actionRoller = new ActionRoller(
				options.userSettings ?? null,
				targetAction,
				creature,
				options.targetCreature
			);

			const emojiText = targetAction.actionCost
				? getEmoji(intr, targetAction.actionCost) + ' '
				: '';

			const builtRoll = actionRoller.buildRoll(
				options.rollNote ?? '',
				targetAction.description,
				{
					attackModifierExpression: options.modifierExpression,
					damageModifierExpression: options.damageModifierExpression,
					title: `${emojiText}${creature.sheet.info.name} used ${targetAction.name}!`,
				}
			);

			embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});

			embed.addFields(
				await EmbedUtils.getOrSendActionDamageField({
					intr,
					hideStats: options.hideStats,
					actionRoller,
					sourceNameOverwrite: options.sourceNameOverwrite,
					targetNameOverwrite: options.targetNameOverwrite,
					LL,
				})
			);
		} else {
			throw new KoboldError(
				`Yip! I couldn't figure out how to roll the ${targetRoll.type} roll "${targetRoll.name}"`
			);
		}
		return { error: false, message: embed, actionRoller };
	}
}
