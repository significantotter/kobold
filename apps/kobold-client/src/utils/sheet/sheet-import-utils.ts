import _ from 'lodash';
import { ProficiencyStat, Sheet } from 'kobold-db';

export function scoreToBonus(score: number) {
	return Math.floor((score - 10) / 2);
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
