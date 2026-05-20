import { ChatInputCommandInteraction } from 'discord.js';
import _ from 'lodash';
import { getEmoji } from '../constants/emoji.js';
import { utilStrings } from '@kobold/documentation';
import {
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	AdvancedDamageRoll,
	AttackOrSkillRoll,
	DefenseRule,
	Attribute,
	DamageRoll,
	Roll,
	RollTypeEnum,
	SaveRoll,
	TextRoll,
	UserSettings,
} from '@kobold/db';
import { KoboldError, StringUtils } from '@kobold/util';
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
import { DefaultUtils } from './default-utils.js';
import {
	getCriticalHitImmunities,
	hasCriticalHitImmunity,
	type DamageOutcome,
	type DamagePacket,
	type PreparedDamageLine,
} from './damage-resolver.js';

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
type DamageMode = 'damage' | 'healing';
type BasicDamageRollInput = {
	name: string;
	allowRollModifiers: boolean;
	roll: string | null;
	damageType: string | null;
};

export class ActionRoller {
	public tags: string[];
	public totalDamageDealt = 0;
	public totalHealingDone = 0;
	public triggeredWeaknesses: DefenseRule[] = [];
	public triggeredResistances: DefenseRule[] = [];
	public triggeredImmunities: DefenseRule[] = [];
	public preparedDamageLines: PreparedDamageLine[] = [];
	protected damageHasResolved = false;
	protected damageRollOverwriteIfUnused: string | null = null;
	constructor(
		public userSettings: UserSettings | null,
		public action: Action,
		public creature: Creature,
		public targetCreature?: Creature | null,
		public options?: {
			heightenLevel?: number;
			attackRollOverwrite?: string;
			autoApplyDamage?: boolean;
			damageRollOverwrite?: string;
			saveRollOverwrite?: string;
		}
	) {
		this.damageRollOverwriteIfUnused = options?.damageRollOverwrite ?? null;
		this.action = action;
		this.tags = _.uniq([...(action?.tags ?? [])]);
		if (this.action?.type === 'spell') this.tags.push('spell');
		if (this.action?.type === 'attack') this.tags.push('attack_action');
		this.options = options;

		if (!userSettings) {
			this.userSettings = DefaultUtils.userSettings;
		}
	}

	public shouldDisplayDamageText() {
		return (
			this.totalDamageDealt > 0 ||
			this.totalHealingDone > 0 ||
			this.triggeredWeaknesses.length > 0 ||
			this.triggeredResistances.length > 0 ||
			this.triggeredImmunities.length > 0
		);
	}

	private getDamageOutcome(
		actualOutcome: TargetingResult,
		lastTargetingActionType: ContestedRollTypes
	): {
		damageOutcome: TargetingResult;
		outcomeAdjustedBy: DefenseRule[];
	} {
		const outcomeAdjustedBy =
			this.targetCreature &&
			lastTargetingActionType === 'attack' &&
			actualOutcome === 'critical success'
				? getCriticalHitImmunities(this.targetCreature.sheet)
				: [];
		return {
			damageOutcome: outcomeAdjustedBy.length ? 'success' : actualOutcome,
			outcomeAdjustedBy,
		};
	}

	private termMode(term: { mode?: DamageMode }, fallback: DamageMode = 'damage'): DamageMode {
		return term.mode ?? fallback;
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
		let rollExpression = this.options?.attackRollOverwrite ?? roll.roll;
		const skipModifiers =
			!!this.options?.attackRollOverwrite || !(roll.allowRollModifiers ?? true);
		let currentExtraAttributes = _.values(extraAttributes);
		let tags = _.uniq(this.tags);

		if (!skipModifiers && options.attackModifierExpression) {
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
			skipModifiers,
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
		let rollExpression = this.options?.attackRollOverwrite ?? roll.roll;
		const skipModifiers =
			!!this.options?.attackRollOverwrite || !(roll.allowRollModifiers ?? true);
		let currentExtraAttributes = _.values(extraAttributes);
		let tags = [...this.tags];

		if ((roll.targetDC ?? '').toLowerCase() === 'ac') {
			tags = _.uniq([...tags, 'attack', 'tohit', 'to_hit', 'attack_roll']);
		}

		if (!skipModifiers && options.attackModifierExpression) {
			// add the attack modifier expression
			rollExpression = `${rollExpression}+(${options.attackModifierExpression})`;
		}

		const result = rollBuilder.addRoll({
			rollTitle: rollName || 'Attack',
			rollExpression,
			tags,
			extraAttributes: currentExtraAttributes,
			targetDC: options.targetDC,
			showTags: false,
			rollType: 'attack',
			skipModifiers,
			outcomeTitleSuffixes:
				this.targetCreature && hasCriticalHitImmunity(this.targetCreature.sheet)
					? { 'critical success': '(immune)' }
					: undefined,
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
			let saveDiceRoll = this.options?.saveRollOverwrite ?? options.saveDiceRoll;
			const skipModifiers =
				!!this.options?.saveRollOverwrite || !(roll.allowRollModifiers ?? true);
			// Roll the save
			const result = rollBuilder.addRoll({
				rollTitle: `${targetDcClause}${roll.saveRollType} check VS. ${roll.saveTargetDC}`,
				rollExpression: saveDiceRoll,
				tags,
				extraAttributes: currentExtraAttributes,
				targetDC: options.targetDC,
				showTags: false,
				rollType: 'save',
				rollFromTarget: true,
				skipModifiers,
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
		roll: BasicDamageRollInput,
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
		let rollExpression = this.damageRollOverwriteIfUnused ?? roll.roll;
		const skipModifiers =
			!!this.damageRollOverwriteIfUnused || !(roll.allowRollModifiers ?? true);

		this.damageRollOverwriteIfUnused = null;

		if (!skipModifiers && options.damageModifierExpression) {
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
			multiplier =
				this.targetCreature && hasCriticalHitImmunity(this.targetCreature.sheet) ? 1 : 2;
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
				skipModifiers,
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

	public prepareDamage(
		roll: DamageRoll | AdvancedDamageRoll,
		damage: number,
		tags: string[] = [],
		damageTypeOverride?: string | null,
		outcomes: {
			actualOutcome?: DamageOutcome | null;
			damageOutcome?: DamageOutcome | null;
			outcomeAdjustedBy?: DefenseRule[];
		} = {}
	) {
		this.damageHasResolved = false;
		const damageType = damageTypeOverride ?? 'untyped';
		this.preparedDamageLines.push({
			amount: damage,
			damageType,
			sourceName: roll.name,
			actualOutcome: outcomes.actualOutcome,
			damageOutcome: outcomes.damageOutcome,
			outcomeAdjustedBy: outcomes.outcomeAdjustedBy,
			tags: _.uniq([
				...this.tags,
				...tags,
				'damage',
				damageType,
				...damageType.split(/\W+/).filter(Boolean),
			]),
		});
	}

	public applyDamage(
		roll: DamageRoll | AdvancedDamageRoll,
		damage: number,
		tags: string[] = [],
		damageTypeOverride?: string | null
	) {
		this.prepareDamage(roll, damage, tags, damageTypeOverride);
	}

	public buildDamagePacket(): DamagePacket {
		return {
			actionName: this.action?.name,
			tags: this.tags,
			lines: this.preparedDamageLines,
		};
	}

	public resolveDamage(options?: { apply?: boolean }) {
		if (this.targetCreature) {
			if (this.damageHasResolved && options?.apply !== false) return null;
			if (!this.preparedDamageLines.length) return null;

			const {
				appliedDamage,
				appliedResistances,
				appliedWeaknesses,
				appliedImmunities,
				resolution,
			} = this.targetCreature.resolveDamagePacket(this.buildDamagePacket(), {
				apply: options?.apply ?? true,
			});
			if (options?.apply !== false) {
				this.damageHasResolved = true;
				this.totalDamageDealt += appliedDamage;
				this.triggeredImmunities = _.uniq([
					...this.triggeredImmunities,
					...appliedImmunities,
				]);
				this.triggeredResistances = _.uniq([
					...this.triggeredResistances,
					...appliedResistances,
				]);
				this.triggeredWeaknesses = _.uniq([
					...this.triggeredWeaknesses,
					...appliedWeaknesses,
				]);
			}
			return resolution;
		}
		return null;
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
								tags: [...this.tags, 'attack'],
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
							tags: [...this.tags, 'skill'],
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
				if (this.creature && !rollTargetValue) {
					rollTargetValue =
						this.creature.getDC(roll.saveTargetDC ?? '') ?? rollTargetValue;
				}
				if (this.targetCreature && !saveRoll) {
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
				const damageOutcome = this.getDamageOutcome(
					lastTargetingResult,
					lastTargetingActionType
				);
				for (let termIndex = 0; termIndex < roll.terms.length; termIndex++) {
					const term = roll.terms[termIndex];
					const mode = this.termMode(term);
					const termRoll: BasicDamageRollInput = {
						name: roll.terms.length === 1 ? roll.name : `${roll.name} ${termIndex + 1}`,
						roll: term.dice,
						damageType: term.type,
						allowRollModifiers: termIndex === 0 ? roll.allowRollModifiers : false,
					};
					const result = this.rollBasicDamage(
						rollBuilder,
						termRoll,
						options,
						extraAttributes,
						rollCounter,
						lastTargetingResult,
						lastTargetingActionType,
						mode === 'healing'
					);
					if (result && result.type === 'dice') {
						if (result?.results?.total && mode === 'damage') {
							this.prepareDamage(roll, result.results.total, term.tags, term.type, {
								actualOutcome: lastTargetingResult ?? null,
								damageOutcome: damageOutcome.damageOutcome ?? null,
								outcomeAdjustedBy: damageOutcome.outcomeAdjustedBy,
							});
						} else if (result?.results?.total && mode === 'healing') {
							this.applyHealing(roll, result.results.total);
						}
					}
				}
			} else if (rollType === 'advanced-damage') {
				const damageOutcome = this.getDamageOutcome(
					lastTargetingResult,
					lastTargetingActionType
				);
				const effectiveResult = damageOutcome.damageOutcome;
				const terms =
					effectiveResult === 'critical success'
						? roll.criticalSuccessTerms
						: effectiveResult === 'failure'
							? roll.failureTerms
							: effectiveResult === 'critical failure'
								? roll.criticalFailureTerms
								: roll.successTerms;
				for (let termIndex = 0; termIndex < terms.length; termIndex++) {
					const term = terms[termIndex];
					const mode = this.termMode(term);
					const termRoll: BasicDamageRollInput = {
						name: terms.length === 1 ? roll.name : `${roll.name} ${termIndex + 1}`,
						roll: term.dice,
						damageType: term.type,
						allowRollModifiers: termIndex === 0 ? roll.allowRollModifiers : false,
					};
					const result = this.rollBasicDamage(
						rollBuilder,
						termRoll,
						options,
						extraAttributes,
						rollCounter,
						null,
						'none',
						mode === 'healing'
					);
					if (result && result.type === 'dice') {
						if (result?.results?.total && mode === 'damage') {
							this.prepareDamage(roll, result.results.total, term.tags, term.type, {
								actualOutcome: lastTargetingResult ?? null,
								damageOutcome: damageOutcome.damageOutcome ?? null,
								outcomeAdjustedBy: damageOutcome.outcomeAdjustedBy,
							});
						} else if (result?.results?.total && mode === 'healing') {
							this.applyHealing(roll, result.results.total);
						}
					}
				}
			}
		}
		if (this.options?.autoApplyDamage !== false) this.resolveDamage({ apply: true });

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
		attackRollOverwrite,
		damageRollOverwrite,
	}: {
		creature: Creature;
		targetCreature?: Creature | null;
		attackName: string;
		rollNote?: string;
		attackModifierExpression?: string;
		damageModifierExpression?: string;
		targetAC?: number;
		userSettings?: UserSettings;
		attackRollOverwrite?: string;
		damageRollOverwrite?: string;
	}): { actionRoller: ActionRoller; builtRoll: RollBuilder } {
		const targetAttack = creature.attackRolls[attackName.toLowerCase()];
		if (!targetAttack)
			throw new KoboldError(
				`Yip! I couldn\'t find an attack called "${attackName.toLowerCase()}"`
			);

		// build a little action from the attack!
		// Note: id and sheetRecordId are set to placeholder values since this action
		// is only used temporarily and not saved to the database
		const action: Action = {
			userId: '-1',
			id: -1,
			sheetRecordId: null,
			name: targetAttack.name,
			description: '',
			baseLevel: 0,
			autoHeighten: false,
			type: ActionTypeEnum.attack,
			actionCost: ActionCostEnum.oneAction,
			tags: targetAttack.traits,
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
				terms: [
					{
						...targetAttack.damage[0],
						dice:
							DiceUtils.buildDiceExpression(
								targetAttack.damage[0].dice ?? '',
								null,
								damageModifierExpression
							) || null,
						mode: targetAttack.damage[0].mode ?? 'damage',
						persistent: targetAttack.damage[0].persistent ?? false,
					},
				],
				allowRollModifiers: true,
			});
		}
		for (let i = 1; i < targetAttack.damage.length; i++) {
			action.rolls.push({
				type: RollTypeEnum.damage,
				name: 'Damage',
				terms: [
					{
						...targetAttack.damage[i],
						mode: targetAttack.damage[i].mode ?? 'damage',
						persistent: targetAttack.damage[i].persistent ?? false,
					},
				],
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
			targetCreature,
			{
				attackRollOverwrite,
				damageRollOverwrite,
			}
		);
		const builtRoll = actionRoller.buildRoll(
			rollNote ?? '',
			utilStrings.roll.attackRollDescription({
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
		}
	): Promise<{ error: boolean; message: string | KoboldEmbed; actionRoller?: ActionRoller }> {
		const targetRoll = creature.rolls[rollChoice] ?? creature.attackRolls[rollChoice];

		const targetAction = creature.keyedActions[rollChoice];
		let actionRoller: ActionRoller;

		if (!targetRoll) {
			return {
				error: true,
				message: utilStrings.initiative.invalidRoll,
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
