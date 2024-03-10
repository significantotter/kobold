import { APIEmbedField } from 'discord.js';
import _ from 'lodash';
import L from '../i18n/i18n-node.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import {
	Attribute,
	CharacterWithRelations,
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	UserSettings,
} from 'kobold-db';
import { KoboldError } from './KoboldError.js';
import { Creature } from './creature.js';
import {
	DiceRollError,
	DiceRollResult,
	DiceUtils,
	ErrorResult,
	MultiRollResult,
	ResultField,
	TextResult,
} from './dice-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';

export class RollBuilder {
	protected userSettings: UserSettings | null;
	protected creature: Creature | null;
	protected targetCreature: Creature | null;
	protected rollDescription: string | null;
	protected rollNote: string | null;
	public rollResults: ResultField[];
	protected footer: string;
	protected title: string;
	protected LL: TranslationFunctions;

	constructor({
		actorName,
		character,
		creature,
		targetCreature,
		rollDescription,
		rollNote,
		title,
		userSettings,
		LL,
	}: {
		actorName?: string;
		character?: CharacterWithRelations | null;
		creature?: Creature | null;
		targetCreature?: Creature | null;
		rollDescription?: string;
		rollNote?: string;
		title?: string;
		userSettings?: UserSettings;
		LL?: TranslationFunctions;
	}) {
		this.rollResults = [];
		this.rollNote = rollNote ?? null;
		this.rollDescription = rollDescription ?? null;
		this.LL = LL || L.en;
		this.footer = '';
		this.creature = creature || null;
		if (character && !this.creature) {
			this.creature = Creature.fromSheetRecord(character.sheetRecord);
		}
		this.targetCreature = targetCreature || null;
		this.userSettings = userSettings ?? {
			userId: '',
			inlineRollsDisplay: InlineRollsDisplayEnum.detailed,
			rollCompactMode: RollCompactModeEnum.normal,
			initStatsNotification: InitStatsNotificationEnum.every_round,
		};

		const actorText =
			actorName || character?.name || this.creature?.sheet?.staticInfo?.name || '';
		this.title = title || `${actorText} ${this.rollDescription}`.trim();
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
		skipModifiers,
		rollFromTarget = false,
	}: {
		rollTitle?: string;
		rollExpressions: {
			name: string;
			damageType?: string | null;
			rollExpression: string;
			tags?: string[];
			modifierMultiplier?: number;
			extraAttributes?: Attribute[];
		}[];
		skipModifiers?: boolean;
		rollFromTarget?: boolean;
	}) {
		const title = rollTitle || '\u200B';
		const rollFields = rollExpressions.map(rollExpression => ({
			...DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: rollExpression.rollExpression,
				damageType: rollExpression.damageType ?? undefined,
				tags: rollExpression.tags,
				extraAttributes: rollExpression.extraAttributes,
				modifierMultiplier: rollExpression.modifierMultiplier,
				skipModifiers: skipModifiers ?? false,
				creature: (rollFromTarget ? this.targetCreature : this.creature) ?? undefined,
			}),
			name: rollExpression.name,
		}));
		const rollResult: MultiRollResult = { name: title, type: 'multiDice', results: rollFields };
		this.rollResults.push(rollResult);

		return rollResult;
	}

	public determineNatOneOrNatTwenty(node: any): 'nat 1' | 'nat 20' | null {
		if (!node) return null;
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
		return null;
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
		rollFromTarget = false,
		skipModifiers = false,
	}: {
		rollExpression: string;
		rollTitle?: string;
		damageType?: string;
		tags?: string[];
		extraAttributes?: Attribute[];
		targetDC?: number;
		multiplier?: number;
		showTags?: boolean;
		rollType?: 'attack' | 'skill-challenge' | 'damage' | 'save';
		rollFromTarget?: boolean;
		skipModifiers?: boolean;
	}): DiceRollResult | ErrorResult {
		try {
			const rollField = DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression,
				damageType,
				tags,
				extraAttributes: extraAttributes ?? [],
				multiplier,
				creature: (rollFromTarget ? this.targetCreature : this.creature) ?? undefined,
				skipModifiers,
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
				const skillChallengeTitleAdditionText = {
					'critical success': ' Critical Success!',
					success: ' Success!',
					failure: ' Failure.',
					'critical failure': ' Failure.',
				};

				let natTwenty = null;
				try {
					natTwenty = this.determineNatOneOrNatTwenty(
						rollResult.results?.reducedExpression
					);
				} catch (err) {
					console.warn(err);
				}

				let result: 'critical success' | 'success' | 'failure' | 'critical failure';
				let numericResult;

				if (rollResult.results.total >= targetDC + 10) {
					numericResult = 4;
				} else if (rollResult.results.total >= targetDC) {
					numericResult = 3;
				} else if (rollResult.results.total <= targetDC - 10) {
					numericResult = 1;
				} //if (rollResult.results.total < targetDC)
				else numericResult = 2;

				if (natTwenty === 'nat 20') {
					numericResult = Math.min(numericResult + 1, 4);
				} else if (natTwenty === 'nat 1') {
					numericResult = Math.max(numericResult - 1, 1);
				}
				if (numericResult === 1) result = 'critical failure';
				else if (numericResult === 2) result = 'failure';
				else if (numericResult === 3) result = 'success';
				//if (numericResult === 4)
				else result = 'critical success';

				let titleAdditionText = '';
				if (natTwenty) titleAdditionText += ` ${_.capitalize(natTwenty)}!`;
				if (rollType === 'attack') titleAdditionText += attackTitleAdditionText[result];
				else if (rollType === 'skill-challenge')
					titleAdditionText += skillChallengeTitleAdditionText[result];
				else if (rollType === 'save') titleAdditionText += saveTitleAdditionText[result];

				rollResult.targetDC = targetDC;
				rollResult.success = result ?? undefined;
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
		} catch (err) {
			let errorRoll: ErrorResult = {
				type: 'error',
				value: `failed to roll ${rollExpression}`,
			};
			if (err instanceof DiceRollError) {
				errorRoll = {
					type: 'error',
					value: err.message,
				};
			}
			this.rollResults.push(errorRoll);
			return errorRoll;
		}
	}

	evaluateRollsInText({
		text,
		extraAttributes,
		skipModifiers = false,
		tags,
	}: {
		text: string;
		skipModifiers?: boolean;
		extraAttributes?: Attribute[];
		tags?: string[];
	}) {
		// parse and evaluate any rolls in the text
		const finalString = [];

		const splitText = text.split('{{');
		for (let i = 0; i < splitText.length; i++) {
			if (splitText[i].indexOf('}}') !== -1) {
				const [rollExpression, postRollExpressionText] = splitText[i].split('}}');
				try {
					const rollResult = DiceUtils.parseAndEvaluateDiceExpression({
						rollExpression,
						extraAttributes,
						skipModifiers,
						creature: this.creature ?? undefined,
						tags,
					});
					let resultText = '';
					if (
						this.userSettings?.inlineRollsDisplay === 'compact' ||
						rollResult.results.renderedExpression == rollResult.results.total.toString()
					) {
						resultText = '`' + rollResult.results.total.toString() + '`';
					} else {
						resultText = `\`${
							rollResult.results.total
						}="${rollResult.results.renderedExpression.toString()}"\``;
					}
					finalString.push(resultText, postRollExpressionText);
				} catch (err) {
					if (err instanceof DiceRollError)
						return `Failed to parse ${err.diceExpression}`;
					else {
						console.warn(err);
						return `Failed to parse the provided roll`;
					}
				}
			} else {
				finalString.push(splitText[i]);
			}
		}
		return finalString.join('');
	}

	addText({
		title,
		text,
		extraAttributes,
		tags,
	}: {
		title: string;
		text: string;
		extraAttributes?: Attribute[];
		tags?: string[];
	}) {
		const parsedString = this.evaluateRollsInText({ text, extraAttributes, tags });
		const result: TextResult = { name: title, type: 'text', value: parsedString };

		this.rollResults.push(result);
		return result;
	}

	/**
	 * Returns an array of all of the final numeric results of the roll or multiroll fields
	 */
	public getRollTotalArray(): (number | null)[] {
		const resultArray: (number | null)[] = [];
		for (const result of this.rollResults) {
			if (result.type === 'dice' && result?.results?.total) {
				resultArray.push(result.results.total);
			} else if (result.type === 'multiDice') {
				for (const subResult of result.results) {
					if (subResult?.results?.total) {
						resultArray.push(subResult.results.total);
					}
				}
			} else {
				resultArray.push(null);
			}
		}
		return resultArray;
	}

	/**
	 * Converts a roll result step into an embed display field
	 * @param result The result field to convert to an embed field
	 * @returns
	 */
	public convertResultToEmbedField(result: ResultField): APIEmbedField {
		let convertedResult: APIEmbedField;
		if (result.type === 'multiDice') {
			convertedResult = {
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
			convertedResult = {
				name: result.name,
				value: result.value,
			};
		} else if (result.type === 'error') {
			convertedResult = {
				name: result.type,
				value: result.value,
			};
		} else {
			//if (result.type === 'dice')
			convertedResult = {
				name: result.name,
				value: result.value.replaceAll('*', '\\*').replaceAll('_', '\\_'),
			};
		}
		return convertedResult;
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
			response.setFooter({ text: this.evaluateRollsInText({ text: rollNote + footer }) });
		}

		return response;
	}

	public static fromSimpleCreatureRoll({
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
			actorName: actorName ?? creature.name ?? userName,
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
}
