import { describe, it, expect } from 'vitest';
import { AbilityEnum, SheetStatKeys, CounterStyleEnum } from '@kobold/schema';
import {
	parseResistWeakString,
	titleCase,
	parseTotal,
	getSpeed,
	buildProfStat,
	buildStats,
	applySpellTraditions,
	buildAdditionalSkills,
	buildSenses,
	buildAttacks,
	buildBaseCounters,
	convertWgV4ExportToSheet,
	WG_SKILL_TO_STAT,
	STAT_TO_ABILITY,
	WG_TRADITION_TO_STAT,
	WG_ATTRIBUTE_TO_ABILITY,
	type WgV4Export,
	type WgV4Proficiency,
	type WgV4Weapon,
	type WgV4SpellSource,
	type WgV4Character,
	type WgV4Content,
} from './sheet-import-wg-v4.js';

// ── Helpers ──

function prof(total: string, profValue: number): WgV4Proficiency {
	return { total, parts: { profValue } };
}

function minimalExport(overrides?: {
	character?: Partial<WgV4Character>;
	content?: Partial<WgV4Content>;
}): WgV4Export {
	return {
		version: 4,
		character: {
			id: 1,
			name: 'Test Character',
			level: 5,
			hp_current: 40,
			hp_temp: 0,
			hero_points: 1,
			...(overrides?.character ?? {}),
		},
		content: {
			...(overrides?.content ?? {}),
		},
	};
}

// ── parseResistWeakString ──

describe('parseResistWeakString', () => {
	it('parses type and amount separated by spaces', () => {
		expect(parseResistWeakString('Poison  3')).toEqual({ type: 'Poison', amount: 3 });
	});

	it('parses single word with amount', () => {
		expect(parseResistWeakString('Fire 10')).toEqual({ type: 'Fire', amount: 10 });
	});

	it('returns amount 0 for entries without a number', () => {
		expect(parseResistWeakString('All damage')).toEqual({ type: 'All damage', amount: 0 });
	});

	it('handles leading/trailing whitespace', () => {
		expect(parseResistWeakString('  Cold  5  ')).toEqual({ type: 'Cold', amount: 5 });
	});

	it('handles multi-word types', () => {
		expect(parseResistWeakString('Physical except magical 5')).toEqual({
			type: 'Physical except magical',
			amount: 5,
		});
	});

	it('handles empty string', () => {
		expect(parseResistWeakString('')).toEqual({ type: '', amount: 0 });
	});
});

// ── titleCase ──

describe('titleCase', () => {
	it('converts all-caps single word', () => {
		expect(titleCase('COMMON')).toBe('Common');
	});

	it('converts multi-word all-caps', () => {
		expect(titleCase('TIAN XIA')).toBe('Tian Xia');
	});

	it('handles underscores', () => {
		expect(titleCase('SOME_LANG')).toBe('Some Lang');
	});

	it('handles already title-cased strings', () => {
		expect(titleCase('Common')).toBe('Common');
	});

	it('handles hyphenated words', () => {
		expect(titleCase('half-elf')).toBe('Half-Elf');
	});

	it('returns empty for empty string', () => {
		expect(titleCase('')).toBe('');
	});
});

// ── parseTotal ──

describe('parseTotal', () => {
	it('parses a number directly', () => {
		expect(parseTotal(7)).toBe(7);
	});

	it('parses a numeric string', () => {
		expect(parseTotal('12')).toBe(12);
	});

	it('returns null for undefined', () => {
		expect(parseTotal(undefined)).toBeNull();
	});

	it('returns null for NaN string', () => {
		expect(parseTotal('abc')).toBeNull();
	});

	it('parses zero', () => {
		expect(parseTotal(0)).toBe(0);
	});

	it('parses negative numbers', () => {
		expect(parseTotal(-2)).toBe(-2);
	});

	it('parses negative string', () => {
		expect(parseTotal('-3')).toBe(-3);
	});
});

// ── getSpeed ──

describe('getSpeed', () => {
	const speeds = [
		{ name: 'SPEED', value: { total: 25 } },
		{ name: 'SPEED_FLY', value: { total: 30 } },
		{ name: 'SPEED_SWIM', value: { total: 0 } },
	];

	it('returns the speed value for a matching name', () => {
		expect(getSpeed(speeds, 'SPEED')).toBe(25);
	});

	it('returns null for a non-existent speed', () => {
		expect(getSpeed(speeds, 'SPEED_CLIMB')).toBeNull();
	});

	it('returns null for speed of 0', () => {
		expect(getSpeed(speeds, 'SPEED_SWIM')).toBeNull();
	});

	it('returns null for undefined speeds array', () => {
		expect(getSpeed(undefined, 'SPEED')).toBeNull();
	});
});

// ── buildProfStat ──

describe('buildProfStat', () => {
	it('builds a stat from proficiency data', () => {
		const result = buildProfStat('athletics', prof('14', 4), AbilityEnum.strength);
		expect(result).toEqual({
			name: 'athletics',
			bonus: 14,
			dc: 24,
			proficiency: 4,
			ability: AbilityEnum.strength,
			note: null,
		});
	});

	it('handles undefined proficiency', () => {
		const result = buildProfStat('arcana', undefined, AbilityEnum.intelligence);
		expect(result).toEqual({
			name: 'arcana',
			bonus: null,
			dc: null,
			proficiency: null,
			ability: AbilityEnum.intelligence,
			note: null,
		});
	});

	it('handles null ability', () => {
		const result = buildProfStat('class', prof('20', 6), null);
		expect(result.ability).toBeNull();
		expect(result.bonus).toBe(20);
		expect(result.dc).toBe(30);
	});
});

// ── buildStats ──

describe('buildStats', () => {
	it('builds saves from proficiency map', () => {
		const profs = {
			SAVE_FORT: prof('12', 4),
			SAVE_REFLEX: prof('10', 2),
			SAVE_WILL: prof('8', 2),
		};
		const stats = buildStats(profs);

		expect(stats.fortitude.bonus).toBe(12);
		expect(stats.fortitude.ability).toBe(AbilityEnum.constitution);
		expect(stats.reflex.bonus).toBe(10);
		expect(stats.will.bonus).toBe(8);
	});

	it('builds perception', () => {
		const stats = buildStats({ PERCEPTION: prof('11', 4) });
		expect(stats.perception.bonus).toBe(11);
		expect(stats.perception.ability).toBe(AbilityEnum.wisdom);
	});

	it('builds class DC', () => {
		const stats = buildStats({ CLASS_DC: prof('20', 6) });
		expect(stats.class.bonus).toBe(20);
		expect(stats.class.dc).toBe(30);
		expect(stats.class.ability).toBeNull();
	});

	it('builds standard skills', () => {
		const profs = {
			SKILL_ATHLETICS: prof('14', 4),
			SKILL_STEALTH: prof('10', 2),
		};
		const stats = buildStats(profs);

		expect(stats.athletics.bonus).toBe(14);
		expect(stats.athletics.ability).toBe(AbilityEnum.strength);
		expect(stats.stealth.bonus).toBe(10);
		expect(stats.stealth.ability).toBe(AbilityEnum.dexterity);
	});

	it('ignores lore skills', () => {
		const profs = {
			SKILL_LORE_WARFARE: prof('8', 2),
		};
		const stats = buildStats(profs);
		// Lore should not appear in stats — all standard stat keys should remain default
		expect(stats.acrobatics.bonus).toBeNull();
	});

	it('initializes all stat keys with defaults for an empty proficiency map', () => {
		const stats = buildStats({});
		for (const key of Object.values(SheetStatKeys)) {
			expect(stats[key]).toBeDefined();
			expect(stats[key].bonus).toBeNull();
		}
	});
});

// ── applySpellTraditions ──

describe('applySpellTraditions', () => {
	it('sets spell tradition stats', () => {
		const stats = buildStats({});
		const spellSources: WgV4SpellSource[] = [
			{
				source: {
					name: 'Wizard',
					type: 'PREPARED',
					tradition: 'ARCANE',
					attribute: 'ATTRIBUTE_INT',
				},
				stats: {
					spell_attack: { total: [15], parts: {} },
					spell_dc: { total: 25, parts: {} },
				},
			},
		];

		applySpellTraditions(stats, spellSources);

		expect(stats.arcane.bonus).toBe(15);
		expect(stats.arcane.dc).toBe(25);
		expect(stats.arcane.ability).toBe(AbilityEnum.intelligence);
	});

	it('handles multiple traditions', () => {
		const stats = buildStats({});
		const spellSources: WgV4SpellSource[] = [
			{
				source: {
					name: 'Cleric',
					type: 'PREPARED',
					tradition: 'DIVINE',
					attribute: 'ATTRIBUTE_WIS',
				},
				stats: {
					spell_attack: { total: [12], parts: {} },
					spell_dc: { total: 22, parts: {} },
				},
			},
			{
				source: {
					name: 'Druid',
					type: 'PREPARED',
					tradition: 'PRIMAL',
					attribute: 'ATTRIBUTE_WIS',
				},
				stats: {
					spell_attack: { total: [14], parts: {} },
					spell_dc: { total: 24, parts: {} },
				},
			},
		];

		applySpellTraditions(stats, spellSources);

		expect(stats.divine.bonus).toBe(12);
		expect(stats.primal.bonus).toBe(14);
	});

	it('skips sources with unknown traditions', () => {
		const stats = buildStats({});
		applySpellTraditions(stats, [
			{
				source: { name: 'Unknown', type: 'INNATE', tradition: 'UNKNOWN' },
				stats: {
					spell_attack: { total: [10], parts: {} },
					spell_dc: { total: 20, parts: {} },
				},
			},
		]);
		expect(stats.arcane.bonus).toBeNull();
		expect(stats.divine.bonus).toBeNull();
	});

	it('handles missing attribute', () => {
		const stats = buildStats({});
		applySpellTraditions(stats, [
			{
				source: { name: 'Innate', type: 'INNATE', tradition: 'OCCULT' },
				stats: {
					spell_attack: { total: [10], parts: {} },
					spell_dc: { total: 20, parts: {} },
				},
			},
		]);
		expect(stats.occult.bonus).toBe(10);
		expect(stats.occult.ability).toBeNull();
	});
});

// ── buildAdditionalSkills ──

describe('buildAdditionalSkills', () => {
	it('extracts lore skills', () => {
		const profs = {
			SKILL_LORE_WARFARE: prof('8', 2),
			SKILL_LORE_UNDERWORLD: prof('10', 4),
		};
		const skills = buildAdditionalSkills(profs);

		expect(skills).toHaveLength(2);
		expect(skills[0].name).toBe('Warfare Lore');
		expect(skills[0].bonus).toBe(8);
		expect(skills[0].dc).toBe(18);
		expect(skills[0].ability).toBe(AbilityEnum.intelligence);

		expect(skills[1].name).toBe('Underworld Lore');
		expect(skills[1].bonus).toBe(10);
	});

	it('ignores non-lore skills', () => {
		const profs = {
			SKILL_ATHLETICS: prof('14', 4),
			PERCEPTION: prof('11', 4),
		};
		const skills = buildAdditionalSkills(profs);
		expect(skills).toHaveLength(0);
	});

	it('handles lore with underscores in name', () => {
		const profs = {
			SKILL_LORE_TIAN_XIA: prof('6', 2),
		};
		const skills = buildAdditionalSkills(profs);
		expect(skills).toHaveLength(1);
		expect(skills[0].name).toBe('Tian Xia Lore');
	});

	it('returns empty for empty proficiencies', () => {
		expect(buildAdditionalSkills({})).toHaveLength(0);
	});
});

// ── buildSenses ──

describe('buildSenses', () => {
	it('collects precise and imprecise senses', () => {
		const senses = buildSenses({
			precise: [{ senseName: 'Darkvision' }],
			imprecise: [{ senseName: 'Scent 30 feet' }],
		});
		expect(senses).toEqual(['Darkvision', 'Scent 30 feet']);
	});

	it('returns empty for undefined', () => {
		expect(buildSenses(undefined)).toEqual([]);
	});

	it('skips entries with empty senseName', () => {
		const senses = buildSenses({
			precise: [{ senseName: '' }, { senseName: 'Darkvision' }],
		});
		expect(senses).toEqual(['Darkvision']);
	});

	it('includes vague senses are currently not collected', () => {
		// The current implementation only collects precise + imprecise, not vague
		const senses = buildSenses({
			precise: [],
			imprecise: [],
			vague: [{ senseName: 'Lifesense' }],
		});
		expect(senses).toEqual([]);
	});
});

// ── buildAttacks ──

describe('buildAttacks', () => {
	it('converts a weapon with positive damage bonus', () => {
		const weapon: WgV4Weapon = {
			item: { name: 'Longsword', meta_data: { range: 5 } },
			stats: {
				attack_bonus: { total: [15], parts: {} },
				damage: {
					dice: 1,
					die: 'd8',
					damageType: 'slashing',
					bonus: { total: 3, parts: {} },
					other: [],
					extra: '',
				},
			},
		};

		const attacks = buildAttacks([weapon]);
		expect(attacks).toHaveLength(1);
		expect(attacks[0].name).toBe('Longsword');
		expect(attacks[0].toHit).toBe(15);
		expect(attacks[0].damage).toEqual([{ dice: '1d8+3', type: 'slashing' }]);
		expect(attacks[0].range).toBe('5');
	});

	it('converts a weapon with negative damage bonus', () => {
		const weapon: WgV4Weapon = {
			item: { name: 'Fist' },
			stats: {
				attack_bonus: { total: [10], parts: {} },
				damage: {
					dice: 1,
					die: 'd4',
					damageType: 'bludgeoning',
					bonus: { total: -1, parts: {} },
					other: [],
					extra: '',
				},
			},
		};

		const attacks = buildAttacks([weapon]);
		expect(attacks[0].damage).toEqual([{ dice: '1d4-1', type: 'bludgeoning' }]);
	});

	it('converts a weapon with zero damage bonus', () => {
		const weapon: WgV4Weapon = {
			item: { name: 'Dagger' },
			stats: {
				attack_bonus: { total: [8], parts: {} },
				damage: {
					dice: 1,
					die: 'd4',
					damageType: 'piercing',
					bonus: { total: 0, parts: {} },
					other: [],
					extra: '',
				},
			},
		};

		const attacks = buildAttacks([weapon]);
		expect(attacks[0].damage).toEqual([{ dice: '1d4', type: 'piercing' }]);
	});

	it('handles weapon with range', () => {
		const weapon: WgV4Weapon = {
			item: { name: 'Shortbow', meta_data: { range: 60 } },
			stats: {
				attack_bonus: { total: [12], parts: {} },
				damage: {
					dice: 1,
					die: 'd6',
					damageType: 'piercing',
					bonus: { total: 0, parts: {} },
					other: [],
					extra: '',
				},
			},
		};

		const attacks = buildAttacks([weapon]);
		expect(attacks[0].range).toBe('60');
	});

	it('handles weapon without range', () => {
		const weapon: WgV4Weapon = {
			item: { name: 'Fist' },
			stats: {
				attack_bonus: { total: [10], parts: {} },
				damage: {
					dice: 1,
					die: 'd4',
					damageType: 'bludgeoning',
					bonus: { total: 0, parts: {} },
					other: [],
					extra: '',
				},
			},
		};

		const attacks = buildAttacks([weapon]);
		expect(attacks[0].range).toBeNull();
	});

	it('returns empty array for no weapons', () => {
		expect(buildAttacks([])).toEqual([]);
	});
});

// ── buildBaseCounters ──

describe('buildBaseCounters', () => {
	it('sets HP with current and max', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 5,
			hp_current: 30,
			hp_temp: 5,
			hero_points: 2,
		};
		const counters = buildBaseCounters(char, 45);

		expect(counters.hp.max).toBe(45);
		expect(counters.hp.current).toBe(30);
		expect(counters.hp.style).toBe(CounterStyleEnum.default);
	});

	it('sets temp HP', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 1,
			hp_current: 10,
			hp_temp: 7,
			hero_points: 0,
		};
		const counters = buildBaseCounters(char, 10);
		expect(counters.tempHp.current).toBe(7);
	});

	it('sets hero points', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 1,
			hp_current: 10,
			hp_temp: 0,
			hero_points: 3,
		};
		const counters = buildBaseCounters(char, 10);
		expect(counters.heroPoints.current).toBe(3);
		expect(counters.heroPoints.max).toBe(3);
	});

	it('sets focus points from spells', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 5,
			hp_current: 30,
			hp_temp: 0,
			hero_points: 1,
			spells: { focus_point_current: 2 },
		};
		const counters = buildBaseCounters(char, 30);
		expect(counters.focusPoints.current).toBe(2);
	});

	it('defaults focus points to 0 when spells is missing', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 1,
			hp_current: 10,
			hp_temp: 0,
			hero_points: 0,
		};
		const counters = buildBaseCounters(char, 10);
		expect(counters.focusPoints.current).toBe(0);
	});

	it('sets stamina and resolve from character data', () => {
		const char: WgV4Character = {
			id: 1,
			name: 'Test',
			level: 5,
			hp_current: 30,
			hp_temp: 0,
			hero_points: 1,
			stamina_current: 15,
			resolve_current: 3,
		};
		const counters = buildBaseCounters(char, 30);
		expect(counters.stamina.current).toBe(15);
		expect(counters.resolve.current).toBe(3);
	});

	it('defaults hp_current to maxHp when undefined', () => {
		const char = { id: 1, name: 'Test', level: 1, hero_points: 0 } as WgV4Character;
		const counters = buildBaseCounters(char, 20);
		expect(counters.hp.current).toBe(20);
	});
});

// ── Constant Maps ──

describe('WG_SKILL_TO_STAT', () => {
	it('maps all 16 standard skills', () => {
		expect(Object.keys(WG_SKILL_TO_STAT)).toHaveLength(16);
		expect(WG_SKILL_TO_STAT.ACROBATICS).toBe(SheetStatKeys.acrobatics);
		expect(WG_SKILL_TO_STAT.THIEVERY).toBe(SheetStatKeys.thievery);
	});
});

describe('STAT_TO_ABILITY', () => {
	it('maps skills to correct abilities', () => {
		expect(STAT_TO_ABILITY[SheetStatKeys.athletics]).toBe(AbilityEnum.strength);
		expect(STAT_TO_ABILITY[SheetStatKeys.stealth]).toBe(AbilityEnum.dexterity);
		expect(STAT_TO_ABILITY[SheetStatKeys.fortitude]).toBe(AbilityEnum.constitution);
		expect(STAT_TO_ABILITY[SheetStatKeys.arcana]).toBe(AbilityEnum.intelligence);
		expect(STAT_TO_ABILITY[SheetStatKeys.religion]).toBe(AbilityEnum.wisdom);
		expect(STAT_TO_ABILITY[SheetStatKeys.diplomacy]).toBe(AbilityEnum.charisma);
	});
});

describe('WG_TRADITION_TO_STAT', () => {
	it('maps all 4 traditions', () => {
		expect(WG_TRADITION_TO_STAT.ARCANE).toBe(SheetStatKeys.arcane);
		expect(WG_TRADITION_TO_STAT.DIVINE).toBe(SheetStatKeys.divine);
		expect(WG_TRADITION_TO_STAT.OCCULT).toBe(SheetStatKeys.occult);
		expect(WG_TRADITION_TO_STAT.PRIMAL).toBe(SheetStatKeys.primal);
	});
});

describe('WG_ATTRIBUTE_TO_ABILITY', () => {
	it('maps all 6 attributes', () => {
		expect(Object.keys(WG_ATTRIBUTE_TO_ABILITY)).toHaveLength(6);
		expect(WG_ATTRIBUTE_TO_ABILITY.ATTRIBUTE_STR).toBe(AbilityEnum.strength);
		expect(WG_ATTRIBUTE_TO_ABILITY.ATTRIBUTE_CHA).toBe(AbilityEnum.charisma);
	});
});

// ── convertWgV4ExportToSheet (integration) ──

describe('convertWgV4ExportToSheet', () => {
	it('converts a minimal export', () => {
		const sheet = convertWgV4ExportToSheet(minimalExport());

		expect(sheet.staticInfo.name).toBe('Test Character');
		expect(sheet.staticInfo.level).toBe(5);
		expect(sheet.staticInfo.usesStamina).toBe(false);
		expect(sheet.baseCounters.hp.current).toBe(40);
		expect(sheet.baseCounters.heroPoints.current).toBe(1);
	});

	it('populates info from character details', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				character: {
					details: {
						class: { name: 'Fighter' },
						ancestry: { name: 'Human' },
						background: { name: 'Soldier' },
						image_url: 'https://example.com/img.png',
						info: { gender: 'Female', age: '25' },
					},
				},
			})
		);

		expect(sheet.info.class).toBe('Fighter');
		expect(sheet.info.ancestry).toBe('Human');
		expect(sheet.info.background).toBe('Soldier');
		expect(sheet.info.imageURL).toBe('https://example.com/img.png');
		expect(sheet.info.gender).toBe('Female');
		expect(sheet.info.age).toBe('25');
	});

	it('populates attributes', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					attributes: {
						ATTRIBUTE_STR: { value: 4 },
						ATTRIBUTE_DEX: { value: 2 },
						ATTRIBUTE_CON: { value: 3 },
						ATTRIBUTE_INT: { value: 1 },
						ATTRIBUTE_WIS: { value: 0 },
						ATTRIBUTE_CHA: { value: -1 },
					},
				},
			})
		);

		expect(sheet.intProperties.strength).toBe(4);
		expect(sheet.intProperties.dexterity).toBe(2);
		expect(sheet.intProperties.constitution).toBe(3);
		expect(sheet.intProperties.intelligence).toBe(1);
		expect(sheet.intProperties.wisdom).toBe(0);
		expect(sheet.intProperties.charisma).toBe(-1);
	});

	it('populates speeds', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					speeds: [
						{ name: 'SPEED', value: { total: 25 } },
						{ name: 'SPEED_FLY', value: { total: 40 } },
					],
				},
			})
		);

		expect(sheet.intProperties.walkSpeed).toBe(25);
		expect(sheet.intProperties.flySpeed).toBe(40);
		expect(sheet.intProperties.swimSpeed).toBeNull();
	});

	it('populates AC', () => {
		const sheet = convertWgV4ExportToSheet(minimalExport({ content: { ac: 22 } }));
		expect(sheet.intProperties.ac).toBe(22);
	});

	it('populates languages', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: { languages: ['COMMON', 'DRACONIC', 'TIAN XIA'] },
			})
		);
		expect(sheet.infoLists.languages).toEqual(['Common', 'Draconic', 'Tian Xia']);
	});

	it('populates traits', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					character_traits: [{ name: 'Human' }, { name: 'Humanoid' }],
				},
			})
		);
		expect(sheet.infoLists.traits).toEqual(['Human', 'Humanoid']);
	});

	it('populates resistances, weaknesses, and immunities', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					resist_weaks: {
						resists: ['Fire 5', 'Cold 3'],
						weaks: ['Lightning 10'],
						immunes: ['Poison'],
					},
				},
			})
		);

		expect(sheet.weaknessesResistances.resistances).toEqual([
			{ type: 'Fire', amount: 5 },
			{ type: 'Cold', amount: 3 },
		]);
		expect(sheet.weaknessesResistances.weaknesses).toEqual([{ type: 'Lightning', amount: 10 }]);
		expect(sheet.infoLists.immunities).toEqual(['Poison']);
	});

	it('populates senses', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					senses: {
						precise: [{ senseName: 'Darkvision' }],
						imprecise: [{ senseName: 'Scent 30 feet' }],
					},
				},
			})
		);
		expect(sheet.infoLists.senses).toEqual(['Darkvision', 'Scent 30 feet']);
	});

	it('populates armor proficiencies', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					proficiencies: {
						HEAVY_ARMOR: prof('0', 0),
						MEDIUM_ARMOR: prof('0', 2),
						LIGHT_ARMOR: prof('0', 4),
						UNARMORED_DEFENSE: prof('0', 6),
					},
				},
			})
		);

		expect(sheet.intProperties.heavyProficiency).toBe(0);
		expect(sheet.intProperties.mediumProficiency).toBe(2);
		expect(sheet.intProperties.lightProficiency).toBe(4);
		expect(sheet.intProperties.unarmoredProficiency).toBe(6);
	});

	it('populates weapon proficiencies', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					proficiencies: {
						SIMPLE_WEAPONS: prof('0', 4),
						MARTIAL_WEAPONS: prof('0', 4),
						UNARMED_ATTACKS: prof('0', 4),
						ADVANCED_WEAPONS: prof('0', 0),
					},
				},
			})
		);

		expect(sheet.intProperties.simpleProficiency).toBe(4);
		expect(sheet.intProperties.martialProficiency).toBe(4);
		expect(sheet.intProperties.unarmedProficiency).toBe(4);
		expect(sheet.intProperties.advancedProficiency).toBe(0);
	});

	it('populates heritage', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				content: {
					feats_features: {
						heritages: [{ name: 'Versatile Heritage' }],
					},
				},
			})
		);
		expect(sheet.info.heritage).toBe('Versatile Heritage');
	});

	it('sets usesStamina from variants', () => {
		const sheet = convertWgV4ExportToSheet(
			minimalExport({
				character: { variants: { stamina: true } },
			})
		);
		expect(sheet.staticInfo.usesStamina).toBe(true);
	});

	it('sets URL from character ID', () => {
		const sheet = convertWgV4ExportToSheet(minimalExport({ character: { id: 42 } }));
		expect(sheet.info.url).toBe('https://wanderersguide.app/characters/42');
	});

	it('defaults unnamed character', () => {
		const sheet = convertWgV4ExportToSheet(minimalExport({ character: { name: '' } }));
		expect(sheet.staticInfo.name).toBe('Unnamed Character');
	});

	it('stores sourceData as a deep copy of the export', () => {
		const exp = minimalExport();
		const sheet = convertWgV4ExportToSheet(exp);

		expect(sheet.sourceData).toEqual(exp);
		// Verify it's a deep copy, not a reference
		expect(sheet.sourceData).not.toBe(exp);
	});

	it('handles max_hp', () => {
		const sheet = convertWgV4ExportToSheet(minimalExport({ content: { max_hp: 56 } }));
		expect(sheet.baseCounters.hp.max).toBe(56);
	});

	it('handles a full export with all sections populated', () => {
		const fullExport = minimalExport({
			character: {
				id: 100,
				name: 'Valeros',
				level: 10,
				hp_current: 80,
				hp_temp: 5,
				hero_points: 2,
				stamina_current: 20,
				resolve_current: 3,
				variants: { stamina: true },
				spells: { focus_point_current: 1 },
				details: {
					class: { name: 'Fighter' },
					ancestry: { name: 'Human' },
					background: { name: 'Gladiator' },
				},
			},
			content: {
				ac: 28,
				max_hp: 100,
				size: 'MEDIUM',
				attributes: {
					ATTRIBUTE_STR: { value: 4 },
					ATTRIBUTE_DEX: { value: 2 },
					ATTRIBUTE_CON: { value: 3 },
					ATTRIBUTE_INT: { value: 0 },
					ATTRIBUTE_WIS: { value: 1 },
					ATTRIBUTE_CHA: { value: 1 },
				},
				proficiencies: {
					SAVE_FORT: prof('21', 8),
					SAVE_REFLEX: prof('17', 6),
					SAVE_WILL: prof('15', 4),
					PERCEPTION: prof('16', 6),
					CLASS_DC: prof('18', 6),
					SKILL_ATHLETICS: prof('20', 8),
					SKILL_INTIMIDATION: prof('15', 4),
					SKILL_LORE_WARFARE: prof('12', 2),
				},
				speeds: [{ name: 'SPEED', value: { total: 25 } }],
				weapons: [
					{
						item: { name: 'Longsword +1', meta_data: { range: 5 } },
						stats: {
							attack_bonus: { total: [22], parts: {} },
							damage: {
								dice: 2,
								die: 'd8',
								damageType: 'slashing',
								bonus: { total: 4, parts: {} },
								other: [],
								extra: '',
							},
						},
					},
				],
				languages: ['COMMON', 'DRACONIC'],
				character_traits: [{ name: 'Human' }, { name: 'Humanoid' }],
				resist_weaks: {
					resists: ['Fire 5'],
					weaks: [],
					immunes: [],
				},
			},
		});

		const sheet = convertWgV4ExportToSheet(fullExport);

		// Static info
		expect(sheet.staticInfo.name).toBe('Valeros');
		expect(sheet.staticInfo.level).toBe(10);
		expect(sheet.staticInfo.usesStamina).toBe(true);

		// Info
		expect(sheet.info.class).toBe('Fighter');
		expect(sheet.info.ancestry).toBe('Human');
		expect(sheet.info.url).toBe('https://wanderersguide.app/characters/100');

		// Attributes
		expect(sheet.intProperties.strength).toBe(4);
		expect(sheet.intProperties.ac).toBe(28);
		expect(sheet.intProperties.walkSpeed).toBe(25);

		// Stats
		expect(sheet.stats.fortitude.bonus).toBe(21);
		expect(sheet.stats.athletics.bonus).toBe(20);
		expect(sheet.stats.perception.bonus).toBe(16);
		expect(sheet.stats.class.bonus).toBe(18);

		// Additional skills
		expect(sheet.additionalSkills).toHaveLength(1);
		expect(sheet.additionalSkills[0].name).toBe('Warfare Lore');

		// Attacks
		expect(sheet.attacks).toHaveLength(1);
		expect(sheet.attacks[0].name).toBe('Longsword +1');
		expect(sheet.attacks[0].toHit).toBe(22);
		expect(sheet.attacks[0].damage).toEqual([{ dice: '2d8+4', type: 'slashing' }]);

		// Counters
		expect(sheet.baseCounters.hp.max).toBe(100);
		expect(sheet.baseCounters.hp.current).toBe(80);
		expect(sheet.baseCounters.tempHp.current).toBe(5);
		expect(sheet.baseCounters.heroPoints.current).toBe(2);
		expect(sheet.baseCounters.stamina.current).toBe(20);
		expect(sheet.baseCounters.resolve.current).toBe(3);
		expect(sheet.baseCounters.focusPoints.current).toBe(1);

		// Lists
		expect(sheet.infoLists.languages).toEqual(['Common', 'Draconic']);
		expect(sheet.infoLists.traits).toEqual(['Human', 'Humanoid']);
		expect(sheet.weaknessesResistances.resistances).toEqual([{ type: 'Fire', amount: 5 }]);
	});
});
