import { Sheet, isSheetStatKeys, AbilityEnum, SheetAttack, Damage } from '@kobold/db';
import _ from 'lodash';
import { Creature, CreatureFluff, Stat } from '@kobold/pf2etools';
import { SheetProperties } from './sheet-properties.js';

function parsePf2eStat(stat: Stat | number | null): { bonus: number | null; note: string } {
	if (stat == null) return { bonus: null, note: '' };
	if (_.isNumber(stat)) return { bonus: stat, note: '' };
	const bonus = parseInt((stat.std ?? stat.default ?? '').toString());
	const note = [stat.note ?? '', stat.notes ?? [], [stat.abilities].flat()]
		.flat()
		.filter(_.identity)
		.join('; ');
	return {
		bonus,
		note,
	};
}

function parseDamageRoll(rollString: string): { type: string | null; dice: string | null }[] {
	const damageTypes: { type: string | null; dice: string | null }[] = [];
	rollString = rollString.replaceAll(/\[|\]|\([^\)]*\)/g, '');

	const damageClauses = rollString.split(/\W*(?:plus|and|,|,\W*and)\W*/g);

	for (const damageClause of damageClauses) {
		const match = damageClause.match(/(\d+\W*d?\W*\d*\W*\+?\W*\d*)?(?:\s*([a-zA-Z\s\.]+))?/);
		if (match) {
			const [, dice, type] = match;
			damageTypes.push({
				type: type ? type.trim() : null,
				dice: dice ? dice.trim() : null,
			});
		}
	}

	return damageTypes;
}

export function convertPf2eToolsCreatureToSheet(
	bestiaryEntry: Creature,
	fluffEntry: CreatureFluff | undefined,
	options: { useStamina?: boolean; template?: string; customName?: string }
): Sheet {
	const baseSheet = SheetProperties.defaultSheet;

	const challengeAdjustment =
		0 + (options?.template === 'elite' ? 1 : 0) - (options?.template === 'weak' ? 1 : 0);
	let hpAdjustment = 0;

	if (challengeAdjustment > 0) {
		if (!bestiaryEntry.level || bestiaryEntry.level <= 1) {
			hpAdjustment = 10;
		} else if (bestiaryEntry.level <= 4) {
			hpAdjustment = 15;
		} else if (bestiaryEntry.level <= 19) {
			hpAdjustment = 20;
		} else {
			hpAdjustment = 30;
		}
	} else if (challengeAdjustment < 0) {
		if (!bestiaryEntry.level || bestiaryEntry.level <= 2) {
			hpAdjustment = -10;
		} else if (bestiaryEntry.level <= 5) {
			hpAdjustment = -15;
		} else if (bestiaryEntry.level <= 20) {
			hpAdjustment = -20;
		} else {
			hpAdjustment = -30;
		}
	}
	hpAdjustment *= Math.abs(challengeAdjustment) ?? 0;

	const rollAdjustment = 2 * challengeAdjustment ?? 0;

	const size = (bestiaryEntry.traits || ['medium']).filter(trait => {
		return ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal'].includes(
			trait
		);
	});
	let focusPoints: number | null = 0;
	for (const castingType of bestiaryEntry?.spellcasting || []) {
		if (castingType.fp) {
			focusPoints += castingType.fp;
		}
		if (focusPoints > 3) focusPoints = 3;
	}
	if (focusPoints === 0) focusPoints = null;

	for (const spellcasting of bestiaryEntry?.spellcasting || []) {
		if (spellcasting.tradition === 'occult') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.occult.bonus =
					Math.max(baseSheet.stats.occult.bonus ?? 0, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.occult.dc =
					Math.max(baseSheet.stats.occult.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'divine') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.divine.bonus =
					Math.max(baseSheet.stats.divine.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.divine.dc =
					Math.max(baseSheet.stats.divine.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'arcane') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.arcane.bonus =
					Math.max(baseSheet.stats.arcane.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.arcane.dc =
					Math.max(baseSheet.stats.arcane.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'primal') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.primal.bonus =
					Math.max(baseSheet.stats.primal.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.primal.dc =
					Math.max(baseSheet.stats.primal.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
	}

	for (const skillName in bestiaryEntry.skills) {
		const skill = bestiaryEntry.skills[skillName];
		let { bonus, note } = parsePf2eStat(skill);
		if (bonus && rollAdjustment) {
			bonus += rollAdjustment;
		}
		let dc = bonus !== null ? 10 + bonus : null;

		if (isSheetStatKeys(skillName)) {
			baseSheet.stats[skillName] = {
				...baseSheet.stats[skillName],
				bonus,
				dc,
				note,
			};
		} else {
			baseSheet.additionalSkills.push({
				name: skillName,
				proficiency: null,
				bonus,
				dc,
				note,
				ability: AbilityEnum.intelligence,
			});
		}
	}
	const { bonus: perceptionBonus, note: perceptionNote } = parsePf2eStat(
		bestiaryEntry.perception ?? null
	);
	baseSheet.stats.perception = {
		...baseSheet.stats.perception,
		bonus: perceptionBonus ? perceptionBonus + rollAdjustment : null,
		dc: perceptionBonus ? perceptionBonus + rollAdjustment + 10 : null,
		note: perceptionNote,
	};

	let { bonus: fortBonus, note: fortNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.fort ?? null
	);
	let { bonus: refBonus, note: refNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.ref ?? null
	);
	let { bonus: willBonus, note: willNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.will ?? null
	);
	if (rollAdjustment) {
		if (fortBonus) fortBonus += rollAdjustment;
		if (refBonus) refBonus += rollAdjustment;
		if (willBonus) willBonus += rollAdjustment;
	}
	baseSheet.stats.fortitude = {
		...baseSheet.stats.fortitude,
		bonus: fortBonus,
		dc: fortBonus ? fortBonus + 10 : null,
	};
	baseSheet.stats.reflex = {
		...baseSheet.stats.reflex,
		bonus: refBonus,
		dc: refBonus ? refBonus + 10 : null,
	};
	baseSheet.stats.will = {
		...baseSheet.stats.will,
		bonus: willBonus,
		dc: willBonus ? willBonus + 10 : null,
	};

	let attacks: SheetAttack[] = [];

	for (const attack of bestiaryEntry?.attacks || []) {
		let damageResult: { type: null | string; dice: null | string }[] = [];

		if (attack.damageType && _.isString(attack.damage)) {
			damageResult.push({
				dice: attack.damage,
				type: attack.damageType,
			});
			if (attack.damageType2 && attack.damage2) {
				damageResult.push({
					dice: attack.damage2,
					type: attack.damageType2,
				});
			}
		} else {
			for (const damage of [attack.damage].flat()) {
				if (damage) damageResult = parseDamageRoll(damage);
			}
		}

		for (const effect of attack.effects || []) {
			if (effect.toString()) {
				damageResult.push({ dice: null, type: effect.toString() });
			}
		}

		const damageRolls: Damage[] = damageResult.filter(
			(result): result is Damage => result.dice != null
		);
		const effects: string[] = _.uniq(
			damageResult
				.filter(
					(result): result is { dice: null; type: string } =>
						result.dice == null && result.type != null
				)
				.map(result => result.type)
		);

		let damageChallengeAdjustment = challengeAdjustment * 2;
		let damageChallengeText = '';

		if (damageChallengeAdjustment !== 0 && damageChallengeAdjustment != null) {
			if (damageChallengeAdjustment > 0) {
				damageChallengeText = `+${damageChallengeAdjustment}`;
			} else {
				damageChallengeText = `${damageChallengeAdjustment}`;
			}
		}

		damageChallengeAdjustment !== 0 && damageChallengeAdjustment != null
			? `${damageChallengeAdjustment}`
			: '';
		if (damageRolls.length > 0 && damageRolls[0].dice) {
			damageRolls[0].dice += damageChallengeText;
		}

		attacks.push({
			name: attack.name,
			range: attack.range ? attack.range.toString() : null,
			toHit: attack.attack ? attack.attack + rollAdjustment : null,
			damage: damageRolls,
			effects,
			traits: attack.traits ?? [],
			notes: null,
		});
	}

	let hpValue: null | number = 0;
	const bestiaryHp = bestiaryEntry.defenses?.hp;
	if (_.isArray(bestiaryHp)) {
		for (const hp of bestiaryHp) {
			hpValue += hp.hp;
		}
	} else if (_.isUndefined(bestiaryHp)) {
		hpValue = null;
	} else if (_.isNumber(bestiaryHp)) {
		hpValue = bestiaryHp;
	} else if (_.isString(bestiaryHp)) {
		hpValue = parseInt(bestiaryHp);
		if (isNaN(hpValue)) hpValue = null;
	} else {
		for (const value of Object.values(bestiaryHp)) {
			if (_.isNumber(value)) {
				hpValue += value;
			} else if (_.isString(value)) {
				const parsed = parseInt(value);
				if (!isNaN(parsed)) {
					hpValue += parsed;
				}
			} else {
				for (const subValue of Object.values(value)) {
					if (_.isNumber(subValue)) {
						hpValue += subValue;
					} else {
						const parsed = parseInt(subValue);
						if (!isNaN(parsed)) {
							hpValue += parsed;
						}
					}
				}
			}
		}
	}
	if (hpValue !== null) hpValue += hpAdjustment;

	let ac = parsePf2eStat(bestiaryEntry.defenses?.ac ?? null).bonus;
	if (ac !== null) ac += rollAdjustment;

	const sheet: Sheet = {
		staticInfo: {
			name:
				options?.customName ??
				(options?.template ? `${_.capitalize(options.template)} ` : '') +
					bestiaryEntry.name,
			usesStamina: options.useStamina ?? false,
			level: (bestiaryEntry.level ?? 0) + challengeAdjustment,
			keyAbility: null,
		},
		info: {
			description: bestiaryEntry.description ?? null,
			url: `https://pf2etools.com/bestiary.html#${bestiaryEntry.name.replaceAll(
				' ',
				'%20'
			)}_${bestiaryEntry.source}`,
			gender: null,
			age: null,
			alignment: null,
			deity: null,
			imageURL: fluffEntry?.images?.[0] ?? null,
			size: size?.[0] ?? 'medium',
			class: null,
			ancestry: null,
			heritage: null,
			background: null,
		},
		infoLists: {
			traits: bestiaryEntry.traits || [],
			senses: (bestiaryEntry.senses || [])
				.map(sense => sense?.name)
				.filter(name => name && name?.length),
			languages: bestiaryEntry.languages?.languages || [],
			immunities: bestiaryEntry.defenses?.immunities ?? [],
		},
		intProperties: {
			ac: ac,
			strength: bestiaryEntry.abilityMods?.str ?? null,
			dexterity: bestiaryEntry.abilityMods?.dex ?? null,
			constitution: bestiaryEntry.abilityMods?.con ?? null,
			intelligence: bestiaryEntry.abilityMods?.int ?? null,
			wisdom: bestiaryEntry.abilityMods?.wis ? bestiaryEntry.abilityMods.wis : null,
			charisma: bestiaryEntry.abilityMods?.cha ?? null,

			walkSpeed: bestiaryEntry.speed?.walk ?? null,
			flySpeed: bestiaryEntry.speed?.fly ?? null,
			swimSpeed: bestiaryEntry.speed?.swim ?? null,
			climbSpeed: bestiaryEntry.speed?.climb ?? null,
			burrowSpeed: bestiaryEntry.speed?.burrow ?? null,
			dimensionalSpeed: bestiaryEntry.speed?.dimensional ?? null,

			unarmoredProficiency: null,
			lightProficiency: null,
			mediumProficiency: null,
			heavyProficiency: null,

			unarmedProficiency: null,
			simpleProficiency: null,
			martialProficiency: null,
			advancedProficiency: null,
		},
		baseCounters: {
			hp: {
				...baseSheet.baseCounters.hp,
				current: hpValue ?? 0,
				max: hpValue,
			},
			tempHp: {
				...baseSheet.baseCounters.tempHp,
				current: 0,
				max: 0,
			},
			stamina: {
				...baseSheet.baseCounters.stamina,
				current: 0,
				max: 0,
			},
			resolve: {
				...baseSheet.baseCounters.resolve,
				current: 0,
				max: 0,
			},
			heroPoints: {
				...baseSheet.baseCounters.heroPoints,
				current: 0,
				max: 0,
			},
			focusPoints: {
				...baseSheet.baseCounters.focusPoints,
				current: focusPoints ?? 0,
				max: focusPoints,
			},
		},
		counterGroups: baseSheet.counterGroups,
		countersOutsideGroups: baseSheet.countersOutsideGroups,
		weaknessesResistances: {
			resistances: (bestiaryEntry.defenses?.resistances || []).map(res =>
				_.isString(res)
					? {
							type: res,
							amount: 0,
						}
					: {
							type: res.name,
							amount: res.amount ?? 0,
						}
			),
			weaknesses: (bestiaryEntry.defenses?.weaknesses || []).map(weak =>
				_.isString(weak)
					? {
							type: weak,
							amount: 0,
						}
					: {
							type: weak.name,
							amount: weak.amount ?? 0,
						}
			),
		},
		stats: baseSheet.stats,
		additionalSkills: baseSheet.additionalSkills,
		attacks,
		sourceData: { data: bestiaryEntry, fluff: fluffEntry },
	};

	return sheet;
}
