import _ from 'lodash';
import { ProficiencyStat, Sheet } from '@kobold/schema';

export type ImportedAttackRollMacro = {
	name: string;
	macro: string;
};

export function scoreToBonus(score: number) {
	return Math.floor((score - 10) / 2);
}

function slugifyAttackName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function traitValue(traits: string[], traitName: string): string | null {
	const regex = new RegExp(`^${traitName}\\s+(?:1)?d(\\d+)$`, 'i');
	for (const trait of traits) {
		const match = trait.trim().match(regex);
		if (match?.[1]) return match[1];
	}
	return null;
}

export function replaceLeadingDamageDie(
	damageDice: string | null | undefined,
	replacementSides: string
): string | null {
	if (!damageDice) return null;
	const trimmed = damageDice.trim();
	const match = trimmed.match(/^(\d*)d\d+(.*)$/i);
	if (!match) return trimmed;
	return `${match[1] || '1'}d${replacementSides}${match[2] ?? ''}`;
}

export function buildTwoHandRollMacrosForAttacks(
	attacks: Sheet['attacks']
): ImportedAttackRollMacro[] {
	const macros = attacks.flatMap(attack => {
		const twoHandSides = traitValue(attack.traits ?? [], 'two-hand');
		if (!twoHandSides || !attack.damage[0]?.dice) return [];

		const slug = slugifyAttackName(attack.name);
		if (!slug) return [];

		const macro = replaceLeadingDamageDie(attack.damage[0].dice, twoHandSides);
		if (!macro) return [];

		return [
			{
				name: `${slug}-two-hand`,
				macro,
			},
		];
	});

	return _.uniqBy(macros, macro => macro.name);
}

export function applyValuesToStatInPlace(
	sheet: Sheet,
	stat: ProficiencyStat,
	bonus: number | string | null,
	dc: number | string | null,
	proficiency: number | string | null
) {
	let parsedBonus: number | null = _.isString(bonus) ? parseInt(bonus) : bonus;
	let parsedDc: number | null = _.isString(dc) ? parseInt(dc) : dc;
	let parsedProficiency: number | null = _.isString(proficiency)
		? parseInt(proficiency)
		: proficiency;
	if (parsedBonus !== null && isNaN(parsedBonus)) parsedBonus = null;
	if (parsedDc !== null && isNaN(parsedDc)) parsedDc = null;
	if (parsedProficiency !== null && isNaN(parsedProficiency)) parsedProficiency = null;

	// apply the stat values. We can use prof mods + abilities to
	// infer any missing bonus

	if (parsedBonus === null && parsedProficiency !== null && stat.ability !== null) {
		parsedBonus =
			parsedProficiency +
			(sheet.staticInfo.level ?? 0) +
			(sheet.intProperties[stat.ability] ?? 0);
	}
	parsedDc = parsedBonus !== null ? parsedBonus + 10 : null;

	stat.bonus = parsedBonus;
	stat.dc = parsedDc;
	stat.proficiency = parsedProficiency;
}
