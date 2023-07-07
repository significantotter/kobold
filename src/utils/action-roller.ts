import _ from 'lodash';
import { Character, InitiativeActor, Sheet } from '../services/kobold/models/index.js';
import { DiceUtils, MultiRollResult } from './dice-utils.js';
import { RollBuilder } from './roll-builder.js';
import { Creature } from './creature.js';
import { EmbedUtils } from './kobold-embed-utils.js';

type Action = Character['actions'][0];
type Roll = Character['actions'][0]['rolls'][0];
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
type Attribute = { name: string; value: number; tags?: string[] };

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
	public triggeredWeaknesses: Sheet['defenses']['weaknesses'] = [];
	public triggeredResistances: Sheet['defenses']['resistances'] = [];
	public triggeredImmunities: Sheet['defenses']['immunities'] = [];
	constructor(
		public action?: Action,
		public creature?: Creature,
		public targetCreature?: Creature,
		public options?: {
			heightenLevel?: number;
		}
	) {
		this.action = action;
		this.tags = _.uniq([...(action?.tags ?? []), this.action?.type]);
		this.creature = creature;
		this.options = options;
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
		return EmbedUtils.buildDamageResultText({
			sourceCreatureName: this.creature.name,
			targetCreatureName: this.targetCreature.name,
			totalDamageDealt: this.totalDamageDealt - this.totalHealingDone,
			actionName: this.action.name,
			targetCreatureSheet: this.targetCreature.sheet,
			triggeredResistances: this.triggeredResistances,
			triggeredWeaknesses: this.triggeredWeaknesses,
			triggeredImmunities: this.triggeredImmunities,
		});
	}
	public rollSkillChallenge(
		rollBuilder: RollBuilder,
		roll: Roll,
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
			targetDC: options.targetDC ?? null,
			showTags: false,
			rollType: 'skill-challenge',
		});
		if (result?.results?.total) {
			// update the extra attributes for the next roll
			['challengeResult', 'challenge', 'hit'].forEach(
				name => (extraAttributes[name] = { name, value: result.results.total })
			);
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				value: result.results.total,
			};
			extraAttributes[`roll${rollCounter}Attack`] = {
				name: `roll${rollCounter}Attack`,
				value: result.results.total,
			};
		}

		return result;
	}

	public rollAttack(
		rollBuilder: RollBuilder,
		roll: Roll,
		options: BuildRollOptions,
		extraAttributes: { [k: string]: Attribute },
		rollCounter: number
	) {
		const rollName = roll.name;
		let rollExpression = roll.roll;
		const allowRollModifiers = roll.allowRollModifiers ?? true;
		let currentExtraAttributes = _.values(extraAttributes);
		let tags = [...this.tags];

		if (roll.targetDC.toLowerCase() === 'ac') tags = _.uniq([...tags, 'attack']);

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
			targetDC: options.targetDC ?? null,
			showTags: false,
			rollType: 'attack',
		});
		if (result?.results?.total) {
			// update the extra attributes for the next roll
			['attackResult', 'attack', 'hit'].forEach(
				name => (extraAttributes[name] = { name, value: result.results.total })
			);
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				value: result.results.total,
			};
			extraAttributes[`roll${rollCounter}Attack`] = {
				name: `roll${rollCounter}Attack`,
				value: result.results.total,
			};
		}

		return result;
	}
	rollSave(
		rollBuilder: RollBuilder,
		roll: Roll,
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
				targetDC: options.targetDC ?? null,
				showTags: false,
				rollType: 'save',
				rollFromTarget: true,
			});
			// Just record text that there should be a save here
			// update the extra attributes for the next roll
			['SaveResult', 'Save', 'savingThrow'].forEach(
				name => (extraAttributes[name] = { name, value: result.results.total })
			);
			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				value: result.results.total,
			};
			extraAttributes[`roll${rollCounter}Save`] = {
				name: `roll${rollCounter}Save`,
				value: result.results.total,
			};
			return result;
		} else {
			const title = roll.name || 'Save';
			const text = `The target makes a ${targetDcClause}${roll.saveRollType} check VS. ${this.creature.sheet.info.name}'s ${roll.saveTargetDC}`;
			rollBuilder.addText({ title, text, extraAttributes: currentExtraAttributes, tags });

			extraAttributes[`roll${rollCounter}`] = {
				name: `roll${rollCounter}`,
				value: 0,
			};
			extraAttributes[`roll${rollCounter}Save`] = {
				name: `roll${rollCounter}Save`,
				value: 0,
			};

			return null;
		}
	}

	public rollText(
		rollBuilder: RollBuilder,
		roll: Roll,
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
				!lastTargetingResult)
		) {
			text += `\nSuccess: ${roll.successText}`;
		}
		if (
			roll.failureText &&
			// the last attack was a crit success
			(lastTargetingResult === 'failure' ||
				// or we don't have a previous attack result
				lastTargetingActionType === 'none' ||
				!lastTargetingResult)
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
		roll: Roll,
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
			rollExpression = `${rollExpression} + (${options.damageModifierExpression})`;
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

		const result = rollBuilder.addRoll({
			rollTitle: roll.name || _.capitalize(effectTerm),
			damageType: roll?.damageType,
			rollExpression,
			tags,
			extraAttributes: currentExtraAttributes,
			multiplier,
			showTags: false,
		});

		extraAttributes[`roll${rollCounter}`] = {
			name: `roll${rollCounter}`,
			value: result.results.total,
		};
		extraAttributes[`roll${rollCounter}${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}${_.capitalize(effectTerm)}`,
			value: result.results.total,
		};
		extraAttributes[`roll${rollCounter}Applied${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Applied${_.capitalize(effectTerm)}`,
			value: result.results.total,
		};

		return result;
	}

	public rollAdvancedDamage(
		rollBuilder: RollBuilder,
		roll: Roll,
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
		const rollExpressions = [];

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
					damageType: roll?.damageType,
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
				damageType: roll?.damageType,
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
				damageType: roll?.damageType,
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
				damageType: roll?.damageType,
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
			].forEach(name => (extraAttributes[name] = { name, value: 0 }));
			return null;
		}

		const results = rollBuilder.addMultiRoll({
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
			value: appliedDamage,
		};
		extraAttributes[`roll${rollCounter}${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}${_.capitalize(effectTerm)}`,
			value: appliedDamage,
		};
		extraAttributes[`roll${rollCounter}Applied${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Applied${_.capitalize(effectTerm)}`,
			value: appliedDamage,
		};
		extraAttributes[`roll${rollCounter}CriticalSuccess${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}CriticalSuccess${_.capitalize(effectTerm)}`,
			value: critSuccessDamageResult?.results?.total || 0,
		};
		extraAttributes[`roll${rollCounter}Success${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Success${_.capitalize(effectTerm)}`,
			value: damageResult?.results?.total || 0,
		};
		extraAttributes[`roll${rollCounter}Failure${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}Failure${_.capitalize(effectTerm)}`,
			value: failureDamageResult?.results?.total || 0,
		};
		extraAttributes[`roll${rollCounter}CriticalFailure${_.capitalize(effectTerm)}`] = {
			name: `roll${rollCounter}CriticalFailure${_.capitalize(effectTerm)}`,
			value: critFailureDamageResult?.results?.total || 0,
		};
		results.appliedDamage = appliedDamage;

		return results;
	}

	public applyDamage(roll: Roll, damage: number) {
		if (this.targetCreature) {
			const {
				appliedDamage,
				totalDamage,
				appliedResistance,
				appliedWeakness,
				appliedImmunity,
			} = this.targetCreature.applyDamage(damage, roll.damageType);
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

	public buildRoll(rollNote, rollDescription, options: BuildRollOptions): RollBuilder {
		const rollBuilder = new RollBuilder({
			creature: this.creature,
			targetCreature: this.targetCreature,
			rollNote,
			rollDescription,
			title: options?.title ?? `${this.creature.sheet.info.name} used ${this.action.name}!`,
		});

		let abilityLevel = 1;

		if (!options.heightenLevel) {
			if (this.action.autoHeighten) {
				abilityLevel = Math.ceil(this.creature.sheet.info.level / 2);
			} else {
				abilityLevel = this.action.baseLevel || 1;
			}
		} else {
			abilityLevel = options.heightenLevel;
		}

		const extraAttributes: { [k: string]: Attribute } = {};

		// allow a bunch of aliases for the heighten level attribute
		['heightenLevel', 'spellLevel', 'abilityLevel', 'heighten', '_level'].forEach(
			name => (extraAttributes[name] = { name, value: abilityLevel })
		);

		['dc', 'targetDC', 'target'].forEach(
			name => (extraAttributes[name] = { name, value: options.targetDC })
		);

		let lastTargetingResult: TargetingResult;
		let lastTargetingActionType: ContestedRollTypes = 'none';
		let rollCounter = 0;

		for (const roll of this.action.rolls) {
			// main fields
			const rollType = roll.type;
			rollCounter += 1;

			// time for our state machine!
			if (rollType === 'attack') {
				let rollTargetValue = options.targetDC;
				if (this.targetCreature) {
					rollTargetValue = this.targetCreature.getDC(roll?.targetDC ?? 'ac');

					if (!rollTargetValue) {
						// try evaluating it as a dice expression.
						// this allows players to set static DCs, or use proficiency-based
						// target values like for medicine checks
						const testRollResult = DiceUtils.parseAndEvaluateDiceExpression({
							rollExpression: roll?.targetDC,
							creature: this.creature,
							tags: this.tags,
							extraAttributes: _.values(extraAttributes),
						});
						if (!testRollResult.error) {
							rollTargetValue = testRollResult.results.total;
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
				lastTargetingResult = attackResult.success;
				lastTargetingActionType = 'attack';
			}
			if (rollType === 'skill-challenge') {
				let rollTargetValue = this.creature.getDC(roll?.targetDC ?? 'ac');

				if (!rollTargetValue) {
					// try evaluating it as a dice expression.
					// this allows players to set static DCs, or use proficiency-based
					// target values like for medicine checks
					const testRollResult = DiceUtils.parseAndEvaluateDiceExpression({
						rollExpression: roll?.targetDC,
						creature: this.creature,
						tags: this.tags,
						extraAttributes: _.values(extraAttributes),
					});
					if (!testRollResult.error) {
						rollTargetValue = testRollResult.results.total;
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
				lastTargetingResult = skillChallengeResult.success;
				lastTargetingActionType = 'skill-challenge';
			} else if (rollType === 'save') {
				let rollTargetValue = options.targetDC;
				let saveRoll = options.saveDiceRoll;
				if (this.creature) {
					rollTargetValue = this.creature.getDC(roll?.saveTargetDC) ?? rollTargetValue;
				}
				if (this.targetCreature) {
					const saveRollBonus =
						this.targetCreature.rolls[roll?.saveRollType.trim().toLowerCase()]?.bonus;
					saveRoll = saveRollBonus ? `d20+${saveRollBonus}` : saveRoll;
				}
				const saveResult = this.rollSave(
					rollBuilder,
					roll,
					{ ...options, targetDC: rollTargetValue, saveDiceRoll: saveRoll },
					extraAttributes,
					rollCounter
				);

				// note the current success status for future damage rolls
				lastTargetingResult = saveResult?.success;
				lastTargetingActionType = 'save';
			} else if (rollType === 'text') {
				const textResult = this.rollText(
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
				if (result?.results?.total) this.applyDamage(roll, result.results.total);
				else if (result?.results?.total && roll.healInsteadOfDamage)
					this.applyHealing(roll, result.results.total);
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
				if (result?.appliedDamage && !roll.healInsteadOfDamage)
					this.applyDamage(roll, result?.appliedDamage);
				else if (result?.appliedDamage && roll.healInsteadOfDamage)
					this.applyHealing(roll, result?.appliedDamage);
			}
		}

		return rollBuilder;
	}
}
