import { ChatInputCommandInteraction } from 'discord.js';
import _ from 'lodash';
import { getEmoji } from '../constants/emoji.js';
import L from '../i18n/i18n-node.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import {
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	AdvancedDamageRoll,
	AttackOrSkillRoll,
	Attribute,
	DamageRoll,
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	Roll,
	RollCompactModeEnum,
	RollTypeEnum,
	SaveRoll,
	SheetInfoLists,
	SheetWeaknessesResistances,
	TextRoll,
	UserSettings,
} from '../services/kobold/index.js';
import { KoboldError } from './KoboldError.js';
import { Creature } from './creature.js';
import {
	DiceRollError,
	DiceRollResult,
	DiceUtils,
	ErrorResult,
	MultiRollResult,
	TextResult,
} from './dice-utils.js';
import { EmbedUtils, KoboldEmbed } from './kobold-embed-utils.js';
import { RollBuilder } from './roll-builder.js';
import { StringUtils } from './string-utils.js';

type ContestedRollTypes = 'attack' | 'skill-challenge' | 'save' | 'none';
type ResultRollTypes = 'damage' | 'advanced-damage' | 'text';

type BuildRollOptions = {
	heightenLevel?: number;
	targetDC?: number;
	saveDiceRoll?: string;
	attackModifierExpression?: string;
	damageModifierExpression?: string;
	title?: string;
};

type TargetingResult =
	| 'critical success'
	| 'success'
	| 'failure'
	| 'critical failure'
	| null
	| undefined;

type MultiRollResultItem = MultiRollResult['results'][0] | null;

export class ActionRoller {
	public tags: string[];
	public totalDamageDealt = 0;
	public totalHealingDone = 0;
	public triggeredWeaknesses: SheetWeaknessesResistances['weaknesses'] = [];
	public triggeredResistances: SheetWeaknessesResistances['resistances'] = [];
	public triggeredImmunities: SheetInfoLists['immunities'] = [];
	constructor(
		public userSettings: UserSettings | null,
		public action: Action,
		public creature: Creature,
		public targetCreature?: Creature | null,
		public options?: {
			heightenLevel?: number;
		}
	) {
		this.action = action;
		this.tags = _.uniq([...(action?.tags ?? [])]);
		if (this.action?.type) this.tags.push(this.action.type);
		this.options = options;

		if (!userSettings) {
			this.userSettings = {
				userId: '',
				inlineRollsDisplay: InlineRollsDisplayEnum.detailed,
				rollCompactMode: RollCompactModeEnum.normal,
				initStatsNotification: InitStatsNotificationEnum.every_round,
			};
		}
	}

	public shouldDisplayDamageText() {
		return (
			this.totalDamageDealt > 0 ||
			this.totalHealingDone > 0 ||
			this.triggeredResistances.length > 0 ||
			this.triggeredImmunities.length > 0
		);
	}

	public buildResultText() {
		if (!this.targetCreature) return '';
		return EmbedUtils.buildDamageResultText({
			sourceCreatureName: this.creature.name,
			targetCreatureName: this.targetCreature.name,
			totalDamageDealt: this.totalDamageDealt - this.totalHealingDone,
			actionName: this.action?.name,
			targetCreatureSheet: this.targetCreature.sheet,
			triggeredResistances: this.triggeredResistances,
			triggeredWeaknesses: this.triggeredWeaknesses,
			triggeredImmunities: this.triggeredImmunities,
		});
	}
	public rollSkillChallenge(
		rollBuilder: RollBuilder,
		roll: AttackOrSkillRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number
	) {
		const rollName = roll.name;
		let rollExpression = roll.roll;
		const allowRollModifiers = roll.allowRollModifiers ?? true;
		let currentExtraAttributes = _.values(extraAttributes);
		let tags = _.uniq(this.tags);

		if (allowRollModifiers && options.attackModifierExpression) {
			// add the attack modifier expression
			rollExpression = `${rollExpression}+(${options.attackModifierExpression})`;
		}

		// Roll the attack
		const result = rollBuilder.addRoll({
			rollTitle: rollName || 'Contested Roll',
			rollExpression,
			tags,
			extraAttributes: currentExtraAttributes,
			targetDC: options.targetDC,
			showTags: false,
			rollType: 'skill-challenge',
			skipModifiers: !(roll.allowRollModifiers ?? true),
		});
		if (result.type !== 'error') {
			// update the extra attributes for the next roll
			['challengeResult', 'challenge', 'hit'].forEach(
				name =>
					(extraAttributes[name] = {
						name,
						aliases: [name.toLowerCase()],
						value: result.results.total,
						type: 'rollResult',
						tags: [],
					})
			);
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				aliases: [`roll${rollCounter}`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
			extraAttributes[`roll${rollCounter}Attack`] = {
				name: `roll${rollCounter}Attack`,
				aliases: [`roll${rollCounter}Attack`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
		}

		return result;
	}

	public rollAttack(
		rollBuilder: RollBuilder,
		roll: AttackOrSkillRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number
	) {
		const rollName = roll.name;
		let rollExpression = roll.roll;
		const allowRollModifiers = roll.allowRollModifiers ?? true;
		let currentExtraAttributes = _.values(extraAttributes);
		let tags = [...this.tags];

		if ((roll.targetDC ?? '').toLowerCase() === 'ac') tags = _.uniq([...tags, 'attack']);

		if (allowRollModifiers && options.attackModifierExpression) {
			// add the attack modifier expression
			rollExpression = `${rollExpression}+(${options.attackModifierExpression})`;
		}

		// Roll the attack
		const result = rollBuilder.addRoll({
			rollTitle: rollName || 'Attack',
			rollExpression,
			tags,
			extraAttributes: currentExtraAttributes,
			targetDC: options.targetDC,
			showTags: false,
			rollType: 'attack',
			skipModifiers: !(roll.allowRollModifiers ?? true),
		});
		if (result.type !== 'error' && result.results.total) {
			// update the extra attributes for the next roll
			['attackResult', 'attack', 'hit'].forEach(
				name =>
					(extraAttributes[name] = {
						name,
						aliases: [name.toLowerCase()],
						value: result.results.total,
						type: 'rollResult',
						tags: [],
					})
			);
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				aliases: [`roll${rollCounter}`.toLowerCase()],
				value: result.results.total,

				type: 'rollResult',
				tags: [],
			};
			extraAttributes[`roll${rollCounter}Attack`] = {
				name: `roll${rollCounter}Attack`,
				aliases: [`roll${rollCounter}Attack`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
		}

		return result;
	}
	rollSave(
		rollBuilder: RollBuilder,
		roll: SaveRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number
	) {
		const tags = [...this.tags, 'save'];
		let targetDcClause = '';
		if (options.targetDC) {
			targetDcClause = `DC ${options.targetDC} `;
		}
		let currentExtraAttributes = _.values(extraAttributes);
		if (options.saveDiceRoll) {
			// Roll the save
			const result = rollBuilder.addRoll({
				rollTitle: `${targetDcClause}${roll.saveRollType} check VS. ${roll.saveTargetDC}`,
				rollExpression: options.saveDiceRoll,
				tags,
				extraAttributes: currentExtraAttributes,
				targetDC: options.targetDC,
				showTags: false,
				rollType: 'save',
				rollFromTarget: true,
				skipModifiers: !(roll.allowRollModifiers ?? true),
			});
			if (result.type !== 'error') {
				// Just record text that there should be a save here
				// update the extra attributes for the next roll
				['SaveResult', 'Save', 'savingThrow'].forEach(
					name =>
						(extraAttributes[name] = {
							name,
							aliases: [name.toLowerCase()],
							value: result.results?.total,
							type: 'rollResult',
							tags: [],
						})
				);
				extraAttributes[`roll${rollCounter}`] = {
					name: `roll${rollCounter}`,
					aliases: [`roll${rollCounter}`.toLowerCase()],
					value: result.results?.total,
					type: 'rollResult',
					tags: [],
				};
				extraAttributes[`roll${rollCounter}Save`] = {
					name: `roll${rollCounter}Save`,
					aliases: [`roll${rollCounter}Save`.toLowerCase()],
					value: result.results?.total,
					type: 'rollResult',
					tags: [],
				};
			}
			return result;
		} else {
			const title = roll.name || 'Save';
			const text = `The target makes a ${targetDcClause}${roll.saveRollType} check VS. ${this.creature.name}'s ${roll.saveTargetDC}`;
			rollBuilder.addText({ title, text, extraAttributes: currentExtraAttributes, tags });

			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				aliases: [`roll${rollCounter}`.toLowerCase()],
				value: 0,
				type: 'rollResult',
				tags: [],
			};
			extraAttributes[`roll${rollCounter}Save`] = {
				name: `roll${rollCounter}Save`,
				aliases: [`roll${rollCounter}Save`.toLowerCase()],
				value: 0,
				type: 'rollResult',
				tags: [],
			};

			return null;
		}
	}

	public rollText(
		rollBuilder: RollBuilder,
		roll: TextRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number,
		lastTargetingResult: TargetingResult,
		lastTargetingActionType: ContestedRollTypes
	) {
		const tags = [...this.tags, 'text', ...(roll.extraTags || [])];
		// should always be true, but coerces the type of the roll
		if (roll.type !== 'text') return null;
		const title = roll.name || 'Text';
		let text = roll.defaultText || '';
		if (
			roll.criticalSuccessText &&
			// the last attack was a crit success
			(lastTargetingResult === 'critical success' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			text += `\nCritical Success: ${roll.criticalSuccessText}`;
		}
		if (
			roll.successText &&
			// the last attack was a crit success
			(lastTargetingResult === 'success' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult ||
				(lastTargetingResult === 'critical success' && roll.criticalSuccessText === null))
		) {
			text += `\nSuccess: ${roll.successText}`;
		}
		if (
			roll.failureText &&
			// the last attack was a crit success
			(lastTargetingResult === 'failure' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult ||
				(lastTargetingResult === 'critical failure' && roll.criticalSuccessText === null))
		) {
			text += `\nFailure: ${roll.failureText}`;
		}
		if (
			roll.criticalFailureText &&
			// the last attack was a crit success
			(lastTargetingResult === 'critical failure' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			text += `\nCritical Failure: ${roll.criticalFailureText}`;
		}
		rollBuilder.addText({ title, text, extraAttributes: _.values(extraAttributes), tags });
	}

	public rollBasicDamage(
		rollBuilder: RollBuilder,
		roll: DamageRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number,
		lastTargetingResult: TargetingResult,
		lastTargetingActionType: ContestedRollTypes,
		healInstead: boolean = false
	) {
		const effectTerm = healInstead ? 'healing' : 'damage';
		const tags = [...this.tags, effectTerm];
		let currentExtraAttributes = _.values(extraAttributes);
		let rollExpression = roll.roll;
		if (options.damageModifierExpression) {
			rollExpression = `${rollExpression ?? ''} +(${
				options.damageModifierExpression
			})`.trim();
		}

		// normal damage cases: Last action was an attack and it succeeded, last action was a save that failed, we don't know about the last action
		let multiplier = 1;
		// no damage cases: Last action was an attack and it failed or crit failed, last action was a save that crit succeeded
		if (
			((lastTargetingActionType === 'attack' ||
				lastTargetingActionType === 'skill-challenge') &&
				(lastTargetingResult === 'failure' ||
					lastTargetingResult === 'critical failure')) ||
			(lastTargetingActionType === 'save' && lastTargetingResult === 'critical success')
		) {
			return null;
		}
		// double damage cases: Last action was an attack and it was a crit success, last action was a save that was crit failed
		else if (
			((lastTargetingActionType === 'attack' ||
				lastTargetingActionType === 'skill-challenge') &&
				lastTargetingResult === 'critical success') ||
			(lastTargetingActionType === 'save' && lastTargetingResult === 'critical failure')
		) {
			multiplier = 2;
		}
		// half damage cases: Last action was a save that succeeded
		else if (lastTargetingActionType === 'save' && lastTargetingResult === 'success') {
			multiplier = 0.5;
		}

		const rollTitle = roll.name || _.capitalize(effectTerm);

		let result: DiceRollResult | ErrorResult | TextResult;

		if (rollExpression) {
			result = rollBuilder.addRoll({
				rollTitle,
				damageType: roll.damageType ?? undefined,
				rollExpression,
				tags,
				extraAttributes: currentExtraAttributes,
				multiplier,
				skipModifiers: !(roll.allowRollModifiers ?? true),
				showTags: false,
			});
		} else if (roll.damageType) {
			result = rollBuilder.addText({
				title: rollTitle,
				text: roll.damageType,
				extraAttributes: currentExtraAttributes,
			});
		} else {
			result = {
				type: 'error',
				value: 'A damage roll must have either a dice roll or a damage type!',
			} satisfies ErrorResult;
		}

		if (result.type === 'dice') {
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				aliases: [`roll${rollCounter}`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
			extraAttributes[`roll${rollCounter}${_.capitalize(effectTerm)}`] = {
				name: `roll${rollCounter}${_.capitalize(effectTerm)}`,
				aliases: [`roll${rollCounter}${effectTerm}`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
			extraAttributes[`roll${rollCounter}Applied${_.capitalize(effectTerm)}`] = {
				name: `roll${rollCounter}Applied${_.capitalize(effectTerm)}`,
				aliases: [`roll${rollCounter}Applied${effectTerm}`.toLowerCase()],
				value: result.results.total,
				type: 'rollResult',
				tags: [],
			};
		}

		return result;
	}

	public rollAdvancedDamage(
		rollBuilder: RollBuilder,
		roll: AdvancedDamageRoll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number,
		lastTargetingResult: TargetingResult,
		lastTargetingActionType: ContestedRollTypes,
		healInstead: boolean = false
	) {
		const effectTerm = healInstead ? 'healing' : 'damage';
		const tags = [...this.tags, effectTerm];
		let currentExtraAttributes = _.values(extraAttributes);
		const rollExpressions: {
			name: string;
			damageType: string | null;
			rollExpression: string;
			tags: string[];
			extraAttributes: {
				name: string;
				type: string;
				value: number;
				aliases: string[];
				tags: string[];
			}[];
			modifierMultiplier: number;
		}[] = [];

		let rollCritSuccessExpression = roll.criticalSuccessRoll;
		let rollSuccessExpression = roll.successRoll;
		let rollCritFailureExpression = roll.criticalFailureRoll;
		let rollFailureExpression = roll.failureRoll;

		let rolledSuccessDamage = false;
		let rolledFailureDamage = false;
		let rolledCritSuccessDamage = false;
		let rolledCritFailureDamage = false;

		// if we have a previous attack result that was a crit success or we're rolling after an attack with no knowledge of success, we roll crit damage
		if (
			// if the crit success expression is defined
			rollCritSuccessExpression &&
			// AND
			// the last attack was a crit success
			(lastTargetingResult === 'critical success' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			rolledCritSuccessDamage = true;

			if (roll.allowRollModifiers && options.damageModifierExpression) {
				// add the doubled damage modifier expression
				rollCritSuccessExpression = `${rollCritSuccessExpression}+2*(${options.damageModifierExpression})`;
			}
			let modifierMultiplier = lastTargetingActionType === 'save' ? 0 : 2;

			if (rollCritSuccessExpression) {
				rollExpressions.push({
					name: `critical success ${effectTerm}`,
					damageType: roll.damageType,
					rollExpression: rollCritSuccessExpression,
					tags,
					extraAttributes: currentExtraAttributes,
					modifierMultiplier,
				});
			}
		}

		// if we don't have a previous attack result, or we're rolling after an attack with no knowledge of success, we roll damage
		if (
			// if the success expression is defined
			rollSuccessExpression &&
			// AND
			// the last attack was a success
			(lastTargetingResult === 'success' ||
				// or the last attack was a crit success, but we don't have a crit success expression
				(lastTargetingResult === 'critical success' && !rollCritSuccessExpression) ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			// without a previous attack result, roll both damage and crit damage
			rolledSuccessDamage = true;

			if (roll.allowRollModifiers && options.damageModifierExpression) {
				// add the damage modifier expression
				rollSuccessExpression = `${rollSuccessExpression}+(${options.damageModifierExpression})`;
			}

			let modifierMultiplier = lastTargetingActionType === 'save' ? 0.5 : 1;

			rollExpressions.push({
				name: `success ${effectTerm}`,
				damageType: roll.damageType,
				rollExpression: rollSuccessExpression,
				tags,
				extraAttributes: currentExtraAttributes,
				modifierMultiplier,
			});
		}

		// Roll failure damage if we have any
		if (
			// if the failure expression is defined
			rollFailureExpression &&
			// AND
			// the last attack was a failure
			(lastTargetingResult === 'failure' ||
				// or the last attack was a crit failure, but we don't have a crit failure expression
				(lastTargetingResult === 'critical failure' && !rollCritFailureExpression) ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			// without a previous attack result, roll both damage and crit damage
			rolledFailureDamage = true;

			if (roll.allowRollModifiers && options.damageModifierExpression) {
				// add the damage modifier expression
				rollFailureExpression = `${rollFailureExpression}+(${options.damageModifierExpression})`;
			}

			let modifierMultiplier = lastTargetingActionType === 'save' ? 1 : 0.5;

			rollExpressions.push({
				name: `failure ${effectTerm}`,
				damageType: roll.damageType,
				rollExpression: rollFailureExpression,
				tags,
				extraAttributes: currentExtraAttributes,
				modifierMultiplier,
			});
		}

		// Roll crit failure damage if we have any
		if (
			// if the crit failure expression is defined
			rollCritFailureExpression &&
			// AND
			// the last attack was a crit failure
			(lastTargetingResult === 'critical failure' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
		) {
			// without a previous attack result, roll both damage and crit damage
			rolledCritFailureDamage = true;

			if (roll.allowRollModifiers && options.damageModifierExpression) {
				// add the damage modifier expression
				rollCritFailureExpression = `${rollCritFailureExpression}+(${options.damageModifierExpression})`;
			}

			let modifierMultiplier = lastTargetingActionType === 'save' ? 2 : 0;

			rollExpressions.push({
				name: `critical failure ${effectTerm}`,
				damageType: roll.damageType,
				rollExpression: rollCritFailureExpression,
				tags,
				extraAttributes: currentExtraAttributes,
				modifierMultiplier,
			});
		}

		// if we haven't added any rollExpressions, we skip rolling damage and move on
		if (rollExpressions.length === 0) {
			//update the counters and attributes and continue
			[
				`roll${rollCounter}`,
				`roll${rollCounter}${_.capitalize(effectTerm)}`,
				`roll${rollCounter}Critical${_.capitalize(effectTerm)}`,
				`roll${rollCounter}Applied${_.capitalize(effectTerm)}`,
			].forEach(
				name =>
					(extraAttributes[name] = {
						name,
						aliases: [name.toLowerCase()],
						value: 0,
						type: 'rollResult',
						tags: [],
					})
			);
			return null;
		}

		const results = rollBuilder.addMultiRoll({
			skipModifiers: !(roll.allowRollModifiers ?? true),
			rollTitle: roll.name,
			rollExpressions: rollExpressions,
		});

		// sort the results into variables
		let damageResult: MultiRollResultItem = null;
		let critSuccessDamageResult: MultiRollResultItem = null;
		let critFailureDamageResult: MultiRollResultItem = null;
		let failureDamageResult: MultiRollResultItem = null;

		// we use the booleans for whether we rolled to determine the index of the result.
		// we know the order the rolls would be in, so if we did roll the value, it's true or 1
		// if we didn't roll the value, it's false or 0
		if (rolledCritSuccessDamage) {
			critSuccessDamageResult = results.results[0];
		}
		if (rolledSuccessDamage) {
			damageResult = results.results[Number(rolledCritSuccessDamage)];
		}
		if (rolledFailureDamage) {
			failureDamageResult =
				results.results[Number(rolledCritSuccessDamage) + Number(rolledSuccessDamage)];
		}
		if (rolledCritFailureDamage) {
			critFailureDamageResult =
				results.results[
					Number(rolledCritSuccessDamage) +
						Number(rolledSuccessDamage) +
						Number(rolledFailureDamage)
				];
		}

		// Determine if there's applied damage
		let appliedDamage = 0;
		if (lastTargetingActionType !== 'none' && lastTargetingResult) {
			if (lastTargetingResult === 'critical success') {
				appliedDamage = critSuccessDamageResult?.results?.total || 0;
			}
			if (
				lastTargetingResult === 'success' ||
				(lastTargetingResult === 'critical success' && !rollCritSuccessExpression)
			) {
				appliedDamage = damageResult?.results?.total || 0;
			}
			if (
				lastTargetingResult === 'failure' ||
				(lastTargetingResult === 'critical failure' && !rollCritFailureExpression)
			) {
				appliedDamage = failureDamageResult?.results?.total || 0;
			}
			if (lastTargetingResult === 'critical failure') {
				appliedDamage = critFailureDamageResult?.results?.total || 0;
			}
		}

		// update the extra attributes for the next roll
		extraAttributes[`roll${rollCounter}`] = {
			name: `roll${rollCounter}`,
			aliases: [`roll${rollCounter}`.toLowerCase()],
			value: appliedDamage,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}${effectTerm}`.toLowerCase()],
			value: appliedDamage,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}Applied${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Applied${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}Applied${effectTerm}`.toLowerCase()],
			value: appliedDamage,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}CriticalSuccess${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}CriticalSuccess${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}CriticalSuccess${effectTerm}`.toLowerCase()],
			value: critSuccessDamageResult?.results?.total || 0,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}Success${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Success${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}Success${effectTerm}`.toLowerCase()],
			value: damageResult?.results?.total || 0,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}Failure${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Failure${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}Failure${effectTerm}`.toLowerCase()],
			value: failureDamageResult?.results?.total || 0,
			type: 'rollResult',
			tags: [],
		};
		extraAttributes[`roll${rollCounter}CriticalFailure${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}CriticalFailure${_.capitalize(effectTerm)}`,
			aliases: [`roll${rollCounter}CriticalFailure${effectTerm}`.toLowerCase()],
			value: critFailureDamageResult?.results?.total || 0,
			type: 'rollResult',
			tags: [],
		};
		results.appliedDamage = appliedDamage;

		return results;
	}

	public applyDamage(roll: DamageRoll | AdvancedDamageRoll, damage: number) {
		if (this.targetCreature) {
			const {
				appliedDamage,
				totalDamage,
				appliedResistance,
				appliedWeakness,
				appliedImmunity,
			} = this.targetCreature.applyDamage(damage, roll.damageType ?? undefined);
			this.totalDamageDealt += appliedDamage;
			if (appliedImmunity)
				this.triggeredImmunities = _.uniq([...this.triggeredImmunities, appliedImmunity]);
			if (appliedResistance)
				this.triggeredResistances = _.uniq([
					...this.triggeredResistances,
					appliedResistance,
				]);
			if (appliedWeakness)
				this.triggeredWeaknesses = _.uniq([...this.triggeredWeaknesses, appliedWeakness]);
		}
	}

	public applyHealing(roll: Roll, healing: number) {
		if (this.targetCreature) {
			const { totalHealed } = this.targetCreature.heal(healing);
			this.totalHealingDone += totalHealed;
		}
	}

	public buildRoll(
		rollNote: string,
		rollDescription: string,
		options: BuildRollOptions
	): RollBuilder {
		let title: string;
		const overwriteTargetDc = options?.targetDC;

		if (options?.title) {
			title = options.title;
		} else if (this.creature && this.action.name && this.targetCreature) {
			title = `${this.creature.name} used ${this.action.name} on ${this.targetCreature.name}!`;
		} else if (this.creature && this.action.name) {
			title = `${this.creature.name} used ${this.action.name}!`;
		} else {
			title = `${this.action.name}`;
		}

		const rollBuilder = new RollBuilder({
			creature: this.creature,
			targetCreature: this.targetCreature,
			rollNote,
			rollDescription,
			title,
			userSettings: this.userSettings ?? undefined,
		});

		let abilityLevel = 1;

		if (!options.heightenLevel) {
			if (this.action?.autoHeighten) {
				abilityLevel = Math.ceil(this.creature.level / 2);
			} else {
				abilityLevel = this.action.baseLevel || 1;
			}
		} else {
			abilityLevel = options.heightenLevel;
		}

		const extraAttributes: { [k: string]: Attribute } = {};

		// allow a bunch of aliases for the heighten level attribute
		['heightenLevel', 'spellLevel', 'abilityLevel', 'heighten', '_level'].forEach(
			name =>
				(extraAttributes[name] = {
					name,
					aliases: [name.toLowerCase()],
					value: abilityLevel,
					type: 'rollResult',
					tags: [],
				})
		);

		if (overwriteTargetDc) {
			['dc', 'targetDC', 'target'].forEach(
				name =>
					(extraAttributes[name] = {
						name,
						aliases: [name.toLowerCase()],
						value: overwriteTargetDc,
						type: 'rollResult',
						tags: [],
					})
			);
		}

		let lastTargetingResult: TargetingResult;
		let lastTargetingActionType: ContestedRollTypes = 'none';
		let rollCounter = 0;

		for (const roll of this.action.rolls) {
			// main fields
			const rollType = roll.type;
			rollCounter += 1;

			// time for our state machine!
			if (rollType === 'attack') {
				let rollTargetValue = overwriteTargetDc;
				if (this.targetCreature && !rollTargetValue) {
					rollTargetValue =
						this.targetCreature.getDC(roll?.targetDC ?? 'ac') ?? undefined;

					if (!rollTargetValue) {
						try {
							// try evaluating it as a dice expression.
							// this allows players to set static DCs, or use proficiency-based
							// target values like for medicine checks
							const testRollResult = DiceUtils.parseAndEvaluateDiceExpression({
								rollExpression: roll?.targetDC ?? '',
								creature: this.creature,
								tags: this.tags,
								skipModifiers: true,
								extraAttributes: _.values(extraAttributes),
							});
							rollTargetValue = testRollResult.results.total;
						} catch (err) {
							if (err instanceof DiceRollError) {
								console.warn(err);
							}
						}
					}
				}
				const attackResult = this.rollAttack(
					rollBuilder,
					roll,
					{ ...options, targetDC: rollTargetValue },
					extraAttributes,
					rollCounter
				);
				// note the current success status for future damage rolls
				if (attackResult.type != 'error') {
					lastTargetingResult = attackResult.success;
					lastTargetingActionType = 'attack';
				} else {
					lastTargetingResult = null;
					lastTargetingActionType = 'attack';
				}
			}
			if (rollType === 'skill-challenge') {
				let rollTargetValue =
					overwriteTargetDc ?? this.creature.getDC(roll?.targetDC ?? 'ac') ?? undefined;

				if (!rollTargetValue) {
					try {
						// try evaluating it as a dice expression.
						// this allows players to set static DCs, or use proficiency-based
						// target values like for medicine checks
						const testRollResult = DiceUtils.parseAndEvaluateDiceExpression({
							rollExpression: roll?.targetDC ?? '',
							creature: this.creature,
							tags: this.tags,
							skipModifiers: true,
							extraAttributes: _.values(extraAttributes),
						});
						rollTargetValue = testRollResult.results.total;
					} catch (err) {
						if (err instanceof DiceRollError) {
							console.warn(err);
						}
					}
				}
				const skillChallengeResult = this.rollSkillChallenge(
					rollBuilder,
					roll,
					{ ...options, targetDC: rollTargetValue },
					extraAttributes,
					rollCounter
				);
				// note the current success status for future damage rolls
				if (skillChallengeResult.type !== 'error') {
					lastTargetingResult = skillChallengeResult.success;
					lastTargetingActionType = 'skill-challenge';
				} else {
					lastTargetingResult = null;
					lastTargetingActionType = 'skill-challenge';
				}
			} else if (rollType === 'save') {
				let rollTargetValue = overwriteTargetDc;
				let saveRoll = options.saveDiceRoll;
				if (this.creature) {
					rollTargetValue =
						this.creature.getDC(roll.saveTargetDC ?? '') ?? rollTargetValue;
				}
				if (this.targetCreature) {
					const saveRollBonus =
						this.targetCreature.rolls[(roll.saveRollType ?? '').trim().toLowerCase()]
							?.bonus;
					saveRoll = DiceUtils.buildDiceExpression('d20', String(saveRollBonus ?? 0));
				}
				const saveResult = this.rollSave(
					rollBuilder,
					roll,
					{ ...options, targetDC: rollTargetValue, saveDiceRoll: saveRoll },
					extraAttributes,
					rollCounter
				);
				if (saveResult?.type === 'dice') {
					// note the current success status for future damage rolls
					lastTargetingResult = saveResult?.success;
					lastTargetingActionType = 'save';
				} else {
					lastTargetingActionType = 'save';
					lastTargetingResult = null;
				}
			} else if (rollType === 'text') {
				this.rollText(
					rollBuilder,
					roll,
					options,
					extraAttributes,
					rollCounter,
					lastTargetingResult,
					lastTargetingActionType
				);
			} else if (rollType === 'damage') {
				const result = this.rollBasicDamage(
					rollBuilder,
					roll,
					options,
					extraAttributes,
					rollCounter,
					lastTargetingResult,
					lastTargetingActionType
				);
				if (result && result.type === 'dice') {
					if (result?.results?.total && !roll.healInsteadOfDamage)
						this.applyDamage(roll, result.results.total);
					else if (result?.results?.total && roll.healInsteadOfDamage)
						this.applyHealing(roll, result.results.total);
				}
			} else if (rollType === 'advanced-damage') {
				const result = this.rollAdvancedDamage(
					rollBuilder,
					roll,
					options,
					extraAttributes,
					rollCounter,
					lastTargetingResult,
					lastTargetingActionType
				);
				if (result) {
					if (result?.appliedDamage && !roll.healInsteadOfDamage)
						this.applyDamage(roll, result?.appliedDamage);
					else if (result?.appliedDamage && roll.healInsteadOfDamage)
						this.applyHealing(roll, result?.appliedDamage);
				}
			}
		}

		return rollBuilder;
	}

	public static fromCreatureAttack({
		creature,
		targetCreature,
		attackName,
		rollNote,
		attackModifierExpression,
		damageModifierExpression,
		targetAC,
		userSettings,
	}: {
		creature: Creature;
		targetCreature?: Creature | null;
		attackName: string;
		rollNote?: string;
		attackModifierExpression?: string;
		damageModifierExpression?: string;
		targetAC?: number;
		userSettings?: UserSettings;
	}): { actionRoller: ActionRoller; builtRoll: RollBuilder } {
		const targetAttack = creature.attackRolls[attackName.toLowerCase()];
		if (!targetAttack)
			throw new KoboldError(
				`Yip! I couldn\'t find an attack called "${attackName.toLowerCase()}"`
			);

		// build a little action from the attack!
		const action: Action = {
			name: targetAttack.name,
			description: '',
			baseLevel: 0,
			autoHeighten: false,
			type: ActionTypeEnum.attack,
			actionCost: ActionCostEnum.oneAction,
			tags: [],
			rolls: [],
		};
		// add the attack roll
		if (targetAttack.toHit != null) {
			action.rolls.push({
				type: RollTypeEnum.attack,
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
				type: RollTypeEnum.damage,
				name: 'Damage',
				roll:
					DiceUtils.buildDiceExpression(
						targetAttack.damage[0].dice,
						null,
						damageModifierExpression
					) || null,
				healInsteadOfDamage: false,
				damageType: targetAttack.damage[0].type,
				allowRollModifiers: true,
			});
		}
		for (let i = 1; i < targetAttack.damage.length; i++) {
			action.rolls.push({
				type: RollTypeEnum.damage,
				name: 'Damage',
				roll: targetAttack.damage[i].dice,
				healInsteadOfDamage: false,
				damageType: targetAttack.damage[i].type,
				allowRollModifiers: false,
			});
		}
		if (targetAttack.effects.length) {
			action.rolls.push({
				type: RollTypeEnum.text,
				name: 'Effects',
				criticalSuccessText: null,
				successText: StringUtils.oxfordListJoin(targetAttack.effects),
				failureText: null,
				criticalFailureText: null,
				allowRollModifiers: false,
				defaultText: null,
				extraTags: [],
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
	public static async fromCreatureRoll(
		creature: Creature,
		rollChoice: string,
		intr: ChatInputCommandInteraction,
		options: {
			overwriteCreatureName?: string;
			rollNote?: string;
			modifierExpression?: string;
			damageModifierExpression?: string;
			targetAC?: number;
			targetCreature?: Creature | null;
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
			const response = await RollBuilder.fromSimpleCreatureRoll({
				actorName: options.overwriteCreatureName,
				creature,
				attributeName: targetRoll.name,
				rollNote: options.rollNote ?? '',
				modifierExpression: options.modifierExpression,
				LL,
			});

			return { error: false, message: response.compileEmbed() };
		} else if (targetRoll.type === 'attack') {
			let attackResult = ActionRoller.fromCreatureAttack({
				creature,
				targetCreature: options.targetCreature,
				attackName: targetRoll.name,
				rollNote: options.rollNote,
				attackModifierExpression: options.modifierExpression,
				damageModifierExpression: options.damageModifierExpression,
				targetAC: options.targetAC,
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
				targetAction.description ?? '',
				{
					attackModifierExpression: options.modifierExpression,
					damageModifierExpression: options.damageModifierExpression,
					title: `${emojiText}${creature.sheet.staticInfo.name} used ${targetAction.name}!`,
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
