import { Sheet } from 'kobold-db';

export const staticAttributes = (sheet?: Sheet) => {
	if (sheet && sheet.staticInfo.level !== null) {
		return [
			{ name: 'untrained', value: (sheet.staticInfo.level ?? 0) + 0 },
			{ name: 'trained', value: (sheet.staticInfo.level ?? 0) + 2 },
			{ name: 'expert', value: (sheet.staticInfo.level ?? 0) + 4 },
			{ name: 'master', value: (sheet.staticInfo.level ?? 0) + 6 },
			{ name: 'legendary', value: (sheet.staticInfo.level ?? 0) + 8 },
		];
	} else {
		return [
			{ name: 'untrained', value: 0 },
			{ name: 'trained', value: 2 },
			{ name: 'expert', value: 4 },
			{ name: 'master', value: 6 },
			{ name: 'legendary', value: 8 },
		];
	}
};

export const attributeShorthands: { [k: string]: string } = {
	str: 'strength',
	dex: 'dexterity',
	con: 'constitution',
	int: 'intelligence',
	wis: 'wisdom',
	cha: 'charisma',
	fort: 'fortitude',
	ref: 'reflex',
	health: 'hp',
	tempHealth: 'tempHp',
	perc: 'perception',
};
