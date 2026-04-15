import {
	Sheet,
	AbilityEnum,
	SheetStatKeys,
	ProficiencyStat,
	CounterStyleEnum,
} from '@kobold/schema';

/**
 * Parses a resistance/weakness string like "Poison  3" into { type, amount }.
 */
export function parseResistWeakString(str: string): { type: string; amount: number } {
	const trimmed = str.trim();
	const match = trimmed.match(/^(.+?)\s+(\d+)$/);
	if (match) {
		return { type: match[1].trim(), amount: parseInt(match[2], 10) };
	}
	return { type: trimmed, amount: 0 };
}

/**
 * Title-cases a string: "COMMON" -> "Common", "TIAN XIA" -> "Tian Xia"
 */
export function titleCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/(?:^|\s|[-_])\S/g, match => match.toUpperCase())
		.replace(/[_]/g, ' ');
}

/**
 * Maps a WG skill key suffix to the corresponding SheetStatKeys enum value.
 */
export const WG_SKILL_TO_STAT: Record<string, SheetStatKeys> = {
	ACROBATICS: SheetStatKeys.acrobatics,
	ARCANA: SheetStatKeys.arcana,
	ATHLETICS: SheetStatKeys.athletics,
	CRAFTING: SheetStatKeys.crafting,
	DECEPTION: SheetStatKeys.deception,
	DIPLOMACY: SheetStatKeys.diplomacy,
	INTIMIDATION: SheetStatKeys.intimidation,
	MEDICINE: SheetStatKeys.medicine,
	NATURE: SheetStatKeys.nature,
	OCCULTISM: SheetStatKeys.occultism,
	PERFORMANCE: SheetStatKeys.performance,
	RELIGION: SheetStatKeys.religion,
	SOCIETY: SheetStatKeys.society,
	STEALTH: SheetStatKeys.stealth,
	SURVIVAL: SheetStatKeys.survival,
	THIEVERY: SheetStatKeys.thievery,
};

/**
 * Maps stat keys to their primary ability.
 */
export const STAT_TO_ABILITY: Partial<Record<SheetStatKeys, AbilityEnum>> = {
	[SheetStatKeys.acrobatics]: AbilityEnum.dexterity,
	[SheetStatKeys.arcana]: AbilityEnum.intelligence,
	[SheetStatKeys.athletics]: AbilityEnum.strength,
	[SheetStatKeys.crafting]: AbilityEnum.intelligence,
	[SheetStatKeys.deception]: AbilityEnum.charisma,
	[SheetStatKeys.diplomacy]: AbilityEnum.charisma,
	[SheetStatKeys.intimidation]: AbilityEnum.charisma,
	[SheetStatKeys.medicine]: AbilityEnum.wisdom,
	[SheetStatKeys.nature]: AbilityEnum.wisdom,
	[SheetStatKeys.occultism]: AbilityEnum.intelligence,
	[SheetStatKeys.performance]: AbilityEnum.charisma,
	[SheetStatKeys.religion]: AbilityEnum.wisdom,
	[SheetStatKeys.society]: AbilityEnum.intelligence,
	[SheetStatKeys.stealth]: AbilityEnum.dexterity,
	[SheetStatKeys.survival]: AbilityEnum.wisdom,
	[SheetStatKeys.thievery]: AbilityEnum.dexterity,
	[SheetStatKeys.perception]: AbilityEnum.wisdom,
	[SheetStatKeys.fortitude]: AbilityEnum.constitution,
	[SheetStatKeys.reflex]: AbilityEnum.dexterity,
	[SheetStatKeys.will]: AbilityEnum.wisdom,
};

/** Maps WG tradition name to Kobold stat key. */
export const WG_TRADITION_TO_STAT: Record<string, SheetStatKeys> = {
	ARCANE: SheetStatKeys.arcane,
	DIVINE: SheetStatKeys.divine,
	OCCULT: SheetStatKeys.occult,
	PRIMAL: SheetStatKeys.primal,
};

/** Maps WG attribute name to Kobold ability. */
export const WG_ATTRIBUTE_TO_ABILITY: Record<string, AbilityEnum> = {
	ATTRIBUTE_STR: AbilityEnum.strength,
	ATTRIBUTE_DEX: AbilityEnum.dexterity,
	ATTRIBUTE_CON: AbilityEnum.constitution,
	ATTRIBUTE_INT: AbilityEnum.intelligence,
	ATTRIBUTE_WIS: AbilityEnum.wisdom,
	ATTRIBUTE_CHA: AbilityEnum.charisma,
};

// ── WG v4 Export Types ──

export interface WgV4Export {
	version: number;
	character: WgV4Character;
	content: WgV4Content;
}

export interface WgV4Character {
	id: number;
	name: string;
	level: number;
	hp_current: number;
	hp_temp: number;
	hero_points: number;
	stamina_current?: number;
	resolve_current?: number;
	experience?: number;
	details?: {
		class?: { name: string };
		ancestry?: { name: string };
		background?: { name: string };
		image_url?: string;
		info?: Record<string, string>;
	};
	variants?: Record<string, boolean>;
	spells?: {
		focus_point_current?: number;
		slots?: unknown[];
		list?: unknown[];
		innate_casts?: unknown[];
	};
	meta_data?: Record<string, unknown>;
}

export interface WgV4Proficiency {
	total: string;
	parts: {
		level?: number;
		profValue?: number;
		attributeMod?: number;
		hasConditionals?: boolean;
		breakdown?: Record<string, unknown>;
	};
}

export interface WgV4WeaponStats {
	attack_bonus: {
		total: number[];
		parts: Record<string, unknown>;
	};
	damage: {
		dice: number;
		die: string;
		damageType: string;
		bonus: { total: number; parts: Record<string, unknown> };
		other: unknown[];
		extra: string;
	};
}

export interface WgV4Weapon {
	item: {
		name: string;
		traits?: number[];
		meta_data?: {
			category?: string;
			damage?: { damageType?: string };
			range?: number | string;
			reload?: string;
		};
	};
	stats: WgV4WeaponStats;
}

export interface WgV4SpellSource {
	source: {
		name: string;
		type: string;
		tradition: string;
		attribute?: string;
	};
	stats: {
		spell_attack: { total: number[]; parts: Record<string, unknown> };
		spell_dc: { total: number; parts: Record<string, unknown> };
	};
}

export interface WgV4Content {
	ac?: number;
	max_hp?: number;
	size?: string;
	attributes?: Record<string, { value: number; partial?: boolean }>;
	proficiencies?: Record<string, WgV4Proficiency>;
	speeds?: Array<{ name: string; value: { total: number } }>;
	weapons?: WgV4Weapon[];
	languages?: string[];
	character_traits?: Array<{ name: string }>;
	senses?: {
		precise?: Array<{ senseName: string }>;
		imprecise?: Array<{ senseName: string }>;
		vague?: Array<{ senseName: string }>;
	};
	resist_weaks?: {
		resists?: string[];
		weaks?: string[];
		immunes?: string[];
	};
	feats_features?: {
		heritages?: Array<{ name: string }>;
		[key: string]: unknown;
	};
	spell_sources?: WgV4SpellSource[];
}

// ── Converter Helpers ──

export function parseTotal(total: string | number | undefined): number | null {
	if (total === undefined || total === null) return null;
	const parsed = typeof total === 'number' ? total : parseInt(String(total), 10);
	return isNaN(parsed) ? null : parsed;
}

export function getSpeed(speeds: WgV4Content['speeds'], speedName: string): number | null {
	const speed = speeds?.find(s => s.name === speedName);
	// There's a weird quirk of WG that exports all speed types
	// as 5 when the character lacks that speed, so we treat 5 as a sentinel value for "no speed" here
	if (!speed || speed.value?.total === 5) return null;
	const val = speed.value?.total;
	return val && val > 0 ? val : null;
}

export function buildProfStat(
	name: string,
	prof: WgV4Proficiency | undefined,
	ability: AbilityEnum | null
): ProficiencyStat {
	const bonus = parseTotal(prof?.total);
	return {
		name,
		bonus,
		dc: bonus !== null ? bonus + 10 : null,
		proficiency: prof?.parts?.profValue ?? null,
		ability,
		note: null,
	};
}

/**
 * Builds the stats record (saves, skills, perception, class DC) from WG proficiencies.
 */
export function buildStats(
	profs: Record<string, WgV4Proficiency>
): Record<SheetStatKeys, ProficiencyStat> {
	const stats = Object.fromEntries(
		Object.values(SheetStatKeys).map(k => [
			k,
			{ name: k, proficiency: null, dc: null, bonus: null, ability: null, note: null },
		])
	) as Record<SheetStatKeys, ProficiencyStat>;

	// Saves
	stats.fortitude = buildProfStat('fortitude', profs.SAVE_FORT, AbilityEnum.constitution);
	stats.reflex = buildProfStat('reflex', profs.SAVE_REFLEX, AbilityEnum.dexterity);
	stats.will = buildProfStat('will', profs.SAVE_WILL, AbilityEnum.wisdom);

	// Perception
	stats.perception = buildProfStat('perception', profs.PERCEPTION, AbilityEnum.wisdom);

	// Class DC
	stats.class = buildProfStat('class', profs.CLASS_DC, null);

	// Skills
	for (const [wgKey, profData] of Object.entries(profs)) {
		if (!wgKey.startsWith('SKILL_')) continue;
		const skillSuffix = wgKey.replace('SKILL_', '');
		const statKey = WG_SKILL_TO_STAT[skillSuffix];
		if (statKey) {
			stats[statKey] = buildProfStat(statKey, profData, STAT_TO_ABILITY[statKey] ?? null);
		}
	}

	return stats;
}

/**
 * Applies spell tradition stats from WG spell sources.
 */
export function applySpellTraditions(
	stats: Record<SheetStatKeys, ProficiencyStat>,
	spellSources: WgV4SpellSource[]
): void {
	for (const spellSource of spellSources) {
		const tradition = spellSource.source?.tradition;
		if (!tradition) continue;
		const statKey = WG_TRADITION_TO_STAT[tradition];
		if (!statKey) continue;

		const spellAttackBonus = spellSource.stats?.spell_attack?.total?.[0] ?? null;
		const spellDc = spellSource.stats?.spell_dc?.total ?? null;
		const attributeKey = spellSource.source?.attribute;
		const ability = attributeKey ? (WG_ATTRIBUTE_TO_ABILITY[attributeKey] ?? null) : null;

		stats[statKey] = {
			name: statKey,
			bonus: spellAttackBonus,
			dc: typeof spellDc === 'number' ? spellDc : null,
			proficiency: null,
			ability,
			note: null,
		};
	}
}

/**
 * Extracts additional (Lore) skills from WG proficiencies.
 */
export function buildAdditionalSkills(profs: Record<string, WgV4Proficiency>): ProficiencyStat[] {
	const additionalSkills: ProficiencyStat[] = [];
	for (const [wgKey, profData] of Object.entries(profs)) {
		if (!wgKey.startsWith('SKILL_LORE_')) continue;
		const loreSuffix = wgKey.replace('SKILL_LORE_', '').replace(/_+/g, ' ').trim();
		if (!loreSuffix) continue;
		const loreName = `${titleCase(loreSuffix)} Lore`;
		const bonus = parseTotal(profData.total);
		additionalSkills.push({
			name: loreName,
			bonus,
			dc: bonus !== null ? bonus + 10 : null,
			proficiency: profData.parts?.profValue ?? null,
			ability: AbilityEnum.intelligence,
			note: null,
		});
	}
	return additionalSkills;
}

/**
 * Collects senses from WG content.
 */
export function buildSenses(sensesData: WgV4Content['senses']): string[] {
	const senses: string[] = [];
	for (const precise of sensesData?.precise ?? []) {
		if (precise.senseName) senses.push(precise.senseName);
	}
	for (const imprecise of sensesData?.imprecise ?? []) {
		if (imprecise.senseName) senses.push(imprecise.senseName);
	}
	return senses;
}

/**
 * Converts WG weapon data into Kobold attack objects.
 */
export function buildAttacks(weapons: WgV4Weapon[]): Sheet['attacks'] {
	return weapons.map(w => {
		const dmg = w.stats?.damage;
		const diceStr = dmg ? `${dmg.dice}${dmg.die}` : '';
		const bonusVal = dmg?.bonus?.total ?? 0;
		const damageStr =
			bonusVal > 0
				? `${diceStr}+${bonusVal}`
				: bonusVal < 0
					? `${diceStr}${bonusVal}`
					: diceStr;

		return {
			name: w.item?.name ?? 'Unknown',
			toHit: w.stats?.attack_bonus?.total?.[0] ?? null,
			damage: damageStr ? [{ dice: damageStr, type: dmg?.damageType ?? null }] : [],
			effects: [] as string[],
			range: w.item?.meta_data?.range != null ? String(w.item.meta_data.range) : null,
			traits: [] as string[],
			notes: null as string | null,
		};
	});
}

/**
 * Builds the base counters (HP, temp HP, stamina, resolve, focus, hero points).
 */
export function buildBaseCounters(character: WgV4Character, maxHp: number): Sheet['baseCounters'] {
	const counterStyle = CounterStyleEnum.default;
	return {
		hp: {
			style: counterStyle,
			name: 'HP',
			description: null,
			max: maxHp,
			current: character.hp_current ?? maxHp,
			recoverTo: -1,
			recoverable: true,
			text: '',
		},
		tempHp: {
			style: counterStyle,
			name: 'Temp HP',
			description: null,
			current: character.hp_temp ?? 0,
			max: null,
			recoverTo: 0,
			recoverable: false,
			text: '',
		},
		stamina: {
			style: counterStyle,
			name: 'Stamina',
			description: null,
			current: character.stamina_current ?? 0,
			max: null,
			recoverTo: 0,
			recoverable: true,
			text: '',
		},
		resolve: {
			style: counterStyle,
			name: 'Resolve',
			description: null,
			current: character.resolve_current ?? 0,
			max: null,
			recoverTo: 0,
			recoverable: true,
			text: '',
		},
		focusPoints: {
			style: counterStyle,
			name: 'Focus Points',
			description: null,
			current: character.spells?.focus_point_current ?? 0,
			max: null,
			recoverTo: 0,
			recoverable: true,
			text: '',
		},
		heroPoints: {
			style: counterStyle,
			name: 'Hero Points',
			description: null,
			current: character.hero_points ?? 0,
			max: 3,
			recoverTo: 0,
			recoverable: false,
			text: '',
		},
	};
}

/**
 * Converts a Wanderer's Guide v4 JSON export into a Kobold Sheet.
 */
export function convertWgV4ExportToSheet(exportData: WgV4Export): Sheet {
	const { character, content } = exportData;
	const profs = content.proficiencies ?? {};
	const attrs = content.attributes ?? {};

	// ── Static Info ──
	const usesStamina = character.variants?.stamina === true;

	// ── Attributes (modifiers, not scores) ──
	const strMod = attrs.ATTRIBUTE_STR?.value ?? null;
	const dexMod = attrs.ATTRIBUTE_DEX?.value ?? null;
	const conMod = attrs.ATTRIBUTE_CON?.value ?? null;
	const intMod = attrs.ATTRIBUTE_INT?.value ?? null;
	const wisMod = attrs.ATTRIBUTE_WIS?.value ?? null;
	const chaMod = attrs.ATTRIBUTE_CHA?.value ?? null;

	// ── Speeds ──
	const walkSpeed = getSpeed(content.speeds, 'SPEED');
	const flySpeed = getSpeed(content.speeds, 'SPEED_FLY');
	const swimSpeed = getSpeed(content.speeds, 'SPEED_SWIM');
	const climbSpeed = getSpeed(content.speeds, 'SPEED_CLIMB');
	const burrowSpeed = getSpeed(content.speeds, 'SPEED_BURROW');

	// ── Stats ──
	const stats = buildStats(profs);

	// ── Spell Traditions ──
	applySpellTraditions(stats, content.spell_sources ?? []);

	// ── Additional Skills (Lore) ──
	const additionalSkills = buildAdditionalSkills(profs);

	// ── Info ──
	const details = character.details ?? {};
	const charInfo = details.info ?? {};

	// ── Languages ──
	const languages = (content.languages ?? []).map(l => titleCase(l));

	// ── Senses ──
	const senses = buildSenses(content.senses);

	// ── Traits ──
	const traits = (content.character_traits ?? []).map(t => t.name).filter(Boolean);

	// ── Immunities ──
	const immunities = (content.resist_weaks?.immunes ?? []).map(s =>
		typeof s === 'string' ? s.trim() : String(s)
	);

	// ── Weaknesses & Resistances ──
	const resistances = (content.resist_weaks?.resists ?? []).map(parseResistWeakString);
	const weaknesses = (content.resist_weaks?.weaks ?? []).map(parseResistWeakString);

	// ── Attacks ──
	const attacks = buildAttacks(content.weapons ?? []);

	// ── Base Counters ──
	const maxHp = content.max_hp ?? 0;
	const baseCounters = buildBaseCounters(character, maxHp);

	// ── Build the sheet ──
	const sheet: Sheet = {
		staticInfo: {
			name: character.name || 'Unnamed Character',
			level: character.level ?? null,
			keyAbility: null,
			usesStamina,
		},
		info: {
			url: `https://wanderersguide.app/characters/${character.id}`,
			description: null,
			gender: charInfo.gender ?? null,
			age: charInfo.age ?? null,
			alignment: charInfo.alignment ?? null,
			deity: charInfo.beliefs ?? null,
			imageURL: details.image_url ?? null,
			size: content.size ?? null,
			class: details.class?.name ?? null,
			ancestry: details.ancestry?.name ?? null,
			heritage: content.feats_features?.heritages?.[0]?.name ?? null,
			background: details.background?.name ?? null,
		},
		infoLists: {
			traits,
			languages,
			senses,
			immunities,
		},
		weaknessesResistances: {
			resistances,
			weaknesses,
		},
		intProperties: {
			ac: content.ac ?? null,
			strength: strMod,
			dexterity: dexMod,
			constitution: conMod,
			intelligence: intMod,
			wisdom: wisMod,
			charisma: chaMod,
			walkSpeed,
			flySpeed,
			swimSpeed,
			climbSpeed,
			burrowSpeed,
			dimensionalSpeed: null,
			heavyProficiency: profs.HEAVY_ARMOR?.parts?.profValue ?? null,
			mediumProficiency: profs.MEDIUM_ARMOR?.parts?.profValue ?? null,
			lightProficiency: profs.LIGHT_ARMOR?.parts?.profValue ?? null,
			unarmoredProficiency: profs.UNARMORED_DEFENSE?.parts?.profValue ?? null,
			martialProficiency: profs.MARTIAL_WEAPONS?.parts?.profValue ?? null,
			simpleProficiency: profs.SIMPLE_WEAPONS?.parts?.profValue ?? null,
			unarmedProficiency: profs.UNARMED_ATTACKS?.parts?.profValue ?? null,
			advancedProficiency: profs.ADVANCED_WEAPONS?.parts?.profValue ?? null,
		},
		stats,
		baseCounters,
		counterGroups: [],
		countersOutsideGroups: [],
		additionalSkills,
		attacks,
		sourceData: JSON.parse(JSON.stringify(exportData)) as Record<string, any>,
	};

	return sheet;
}
