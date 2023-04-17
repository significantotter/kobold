import { Character } from '../services/kobold/models/index.js';

export const staticAttributes = (character?: Character) => {
	if (character && character?.characterData?.level) {
		return [
			{ name: 'untrained', value: character.characterData.level + 0 },
			{ name: 'trained', value: character.characterData.level + 2 },
			{ name: 'expert', value: character.characterData.level + 4 },
			{ name: 'master', value: character.characterData.level + 6 },
			{ name: 'legendary', value: character.characterData.level + 8 },
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
