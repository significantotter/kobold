import { Sheet } from '../services/kobold/models/index.js';

export const staticAttributes = (sheet?: Sheet) => {
	if (sheet && sheet?.info?.level) {
		return [
			{ name: 'untrained', value: sheet.info.level + 0 },
			{ name: 'trained', value: sheet.info.level + 2 },
			{ name: 'expert', value: sheet.info.level + 4 },
			{ name: 'master', value: sheet.info.level + 6 },
			{ name: 'legendary', value: sheet.info.level + 8 },
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

export const attributeShorthands = {
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
