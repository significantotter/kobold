import {
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	DamageTerm,
	RollTypeEnum,
	SheetAttack,
} from '@kobold/db';
import { StringUtils } from '@kobold/util';
import { DiceUtils } from './dice-utils.js';

type BuildImportedAttackActionOptions = {
	attack: SheetAttack;
	userId?: string;
	id?: number;
	sheetRecordId?: number | null;
	attackModifierExpression?: string | null;
	damageModifierExpression?: string | null;
};

function traitValue(traits: string[], traitName: string): string | null {
	const regex = new RegExp(`^${traitName}\\s+(?:1)?d(\\d+)$`, 'i');
	for (const trait of traits) {
		const match = trait.trim().match(regex);
		if (match?.[1]) return match[1];
	}
	return null;
}

function appendDamageModifier(
	dice: string | null,
	modifierExpression?: string | null
): string | null {
	if (!dice) return dice;
	if (!modifierExpression) return dice;
	return `${dice}+(${modifierExpression})`;
}

function parseLeadingDice(
	dice: string | null
): { count: number; sides: string; tail: string } | null {
	if (!dice) return null;
	const match = dice.trim().match(/^(\d*)d(\d+)(.*)$/i);
	if (!match) return null;
	return {
		count: match[1] ? Number(match[1]) : 1,
		sides: match[2],
		tail: match[3] ?? '',
	};
}

function doubleTail(tail: string): string {
	if (!tail.trim()) return '';
	const match = tail.match(/^\s*([+-])\s*(\d+)\s*$/);
	if (!match) return '';
	const value = Number(match[2]) * 2;
	return `${match[1]}${value}`;
}

function doubleDamageDice(dice: string | null, sidesOverride?: string | null): string | null {
	const parsed = parseLeadingDice(dice);
	if (!parsed) return dice ? `2*(${dice})` : dice;
	const sides = sidesOverride ?? parsed.sides;
	const tail = doubleTail(parsed.tail);
	if (parsed.tail.trim() && !tail) return `2*(${dice})`;
	return `${parsed.count * 2}d${sides}${tail}`;
}

function deadlyDiceCount(mainDamageDice: string | null): number {
	const parsed = parseLeadingDice(mainDamageDice);
	if (!parsed) return 1;
	if (parsed.count >= 4) return 3;
	if (parsed.count >= 3) return 2;
	return 1;
}

function normalizeTerm(term: DamageTerm): DamageTerm {
	return {
		...term,
		mode: term.mode ?? 'damage',
		persistent: term.persistent ?? false,
	};
}

function buildCriticalSuccessTerms({
	attack,
	mainDamageDice,
	fatalSides,
	deadlySides,
}: {
	attack: SheetAttack;
	mainDamageDice: string | null;
	fatalSides: string | null;
	deadlySides: string | null;
}): DamageTerm[] {
	const terms = attack.damage.map((term, index) => {
		const dice = index === 0 ? mainDamageDice : term.dice;
		return normalizeTerm({
			...term,
			dice: doubleDamageDice(dice, index === 0 ? fatalSides : null),
		});
	});

	if (fatalSides && attack.damage[0]) {
		terms.push(
			normalizeTerm({
				...attack.damage[0],
				dice: `1d${fatalSides}`,
				source: 'fatal',
			})
		);
	} else if (deadlySides && attack.damage[0]) {
		terms.push(
			normalizeTerm({
				...attack.damage[0],
				dice: `${deadlyDiceCount(attack.damage[0].dice)}d${deadlySides}`,
				source: 'deadly',
			})
		);
	}

	return terms;
}

export function buildImportedAttackAction({
	attack,
	userId = '-1',
	id = -1,
	sheetRecordId = null,
	attackModifierExpression,
	damageModifierExpression,
}: BuildImportedAttackActionOptions): Action {
	const traits = attack.traits ?? [];
	const deadlySides = traitValue(traits, 'deadly');
	const fatalSides = traitValue(traits, 'fatal');
	const mainDamageDice = appendDamageModifier(
		attack.damage[0]?.dice ?? null,
		damageModifierExpression
	);
	const usesAdvancedDamage = !!(deadlySides || fatalSides);

	const action: Action = {
		userId,
		id,
		sheetRecordId,
		name: attack.name,
		description: '',
		baseLevel: 0,
		autoHeighten: false,
		type: ActionTypeEnum.attack,
		actionCost: ActionCostEnum.oneAction,
		tags: traits,
		rolls: [],
	};

	if (attack.toHit != null) {
		action.rolls.push({
			type: RollTypeEnum.attack,
			name: 'To Hit',
			roll: DiceUtils.buildDiceExpression(
				'd20',
				String(attack.toHit),
				attackModifierExpression
			),
			targetDC: 'AC',
			allowRollModifiers: true,
		});
	}

	if (attack.damage[0]) {
		if (usesAdvancedDamage) {
			const successTerms = attack.damage.map((term, index) =>
				normalizeTerm({
					...term,
					dice: index === 0 ? mainDamageDice : term.dice,
				})
			);
			action.rolls.push({
				type: RollTypeEnum.AdvancedDamage,
				name: 'Damage',
				successTerms,
				criticalSuccessTerms: buildCriticalSuccessTerms({
					attack,
					mainDamageDice,
					fatalSides,
					deadlySides,
				}),
				failureTerms: [],
				criticalFailureTerms: [],
				allowRollModifiers: true,
			});
		} else {
			action.rolls.push({
				type: RollTypeEnum.damage,
				name: 'Damage',
				terms: [
					normalizeTerm({
						...attack.damage[0],
						dice: mainDamageDice,
					}),
				],
				allowRollModifiers: true,
			});

			for (let i = 1; i < attack.damage.length; i++) {
				action.rolls.push({
					type: RollTypeEnum.damage,
					name: 'Damage',
					terms: [normalizeTerm(attack.damage[i])],
					allowRollModifiers: false,
				});
			}
		}
	}

	if (attack.effects.length) {
		action.rolls.push({
			type: RollTypeEnum.text,
			name: 'Effects',
			criticalSuccessText: null,
			successText: StringUtils.oxfordListJoin(attack.effects),
			failureText: null,
			criticalFailureText: null,
			allowRollModifiers: false,
			defaultText: null,
			extraTags: [],
		});
	}

	return action;
}
