import {
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	DamageTerm,
	RollTypeEnum,
	SheetAttack,
} from '@kobold/db';
import _ from 'lodash';
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

function replaceLeadingDiceSides(
	dice: string | null,
	sidesOverride?: string | null
): string | null {
	const parsed = parseLeadingDice(dice);
	if (!parsed || !sidesOverride) return dice;
	return `${parsed.count}d${sidesOverride}${parsed.tail}`;
}

function multiplyDamageDice(dice: string | null, sidesOverride?: string | null): string | null {
	if (!dice) return dice;
	const diceWithSides = replaceLeadingDiceSides(dice, sidesOverride);
	return `(${diceWithSides})*2`;
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

function termSourceLabel(term: DamageTerm): string | null {
	const rawLabel = term.label ?? term.source;
	if (!rawLabel?.trim()) return null;
	const label = _.startCase(rawLabel.trim());
	return label.toLowerCase().endsWith('damage') ? label : `${label} Damage`;
}

function damageTypeLabel(term: DamageTerm): string | null {
	if (!term.type?.trim()) return null;
	return `${_.startCase(term.type.trim())} Damage`;
}

function importedDamageRollName(term: DamageTerm, index: number): string {
	if (index === 0) return 'Weapon Damage';
	return termSourceLabel(term) ?? damageTypeLabel(term) ?? `Damage ${index + 1}`;
}

function uniqueDamageRollNames(terms: DamageTerm[]): string[] {
	const seen = new Map<string, number>();
	return terms.map((term, index) => {
		const baseName = importedDamageRollName(term, index);
		const count = seen.get(baseName) ?? 0;
		seen.set(baseName, count + 1);
		return count === 0 ? baseName : `${baseName} ${count + 1}`;
	});
}

function buildCriticalSuccessTermsForDamage({
	attack,
	term,
	index,
	mainDamageDice,
	fatalSides,
	deadlySides,
}: {
	attack: SheetAttack;
	term: DamageTerm;
	index: number;
	mainDamageDice: string | null;
	fatalSides: string | null;
	deadlySides: string | null;
}): DamageTerm[] {
	const dice = index === 0 ? mainDamageDice : term.dice;
	const terms = [
		normalizeTerm({
			...term,
			dice: multiplyDamageDice(dice, index === 0 ? fatalSides : null),
		}),
	];

	if (index === 0 && fatalSides && attack.damage[0]) {
		terms.push(
			normalizeTerm({
				...attack.damage[0],
				dice: `1d${fatalSides}`,
				source: 'fatal',
				label: 'Fatal',
			})
		);
	} else if (index === 0 && deadlySides && attack.damage[0]) {
		terms.push(
			normalizeTerm({
				...attack.damage[0],
				dice: `${deadlyDiceCount(attack.damage[0].dice)}d${deadlySides}`,
				source: 'deadly',
				label: 'Deadly',
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
		const damageRollNames = uniqueDamageRollNames(attack.damage);
		if (usesAdvancedDamage) {
			attack.damage.forEach((term, index) => {
				action.rolls.push({
					type: RollTypeEnum.AdvancedDamage,
					name: damageRollNames[index],
					successTerms: [
						normalizeTerm({
							...term,
							dice: index === 0 ? mainDamageDice : term.dice,
						}),
					],
					criticalSuccessTerms: buildCriticalSuccessTermsForDamage({
						attack,
						term,
						index,
						mainDamageDice,
						fatalSides,
						deadlySides,
					}),
					failureTerms: [],
					criticalFailureTerms: [],
					allowRollModifiers: index === 0,
				});
			});
		} else {
			action.rolls.push({
				type: RollTypeEnum.damage,
				name: damageRollNames[0],
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
					name: damageRollNames[i],
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
