import { Character, InitiativeActor, Sheet } from '../services/kobold/models/index.js';
import { PathBuilder } from '../services/pathbuilder/pathbuilder.js';
import { CreatureStatBlock } from '../services/pf2etools/bestiaryType.js';
import { WG } from '../services/wanderers-guide/wanderers-guide.js';
import _, { update } from 'lodash';
import {
	convertBestiaryCreatureToSheet,
	convertPathBuilderToSheet,
	convertWanderersGuideCharToSheet,
} from './sheet-import-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { parseBonusesForTagsFromModifiers } from '../services/kobold/lib/helpers.js';
import { KoboldError } from './KoboldError.js';

const damageTypeShorthands: { [shorthand: string]: string } = {
	piercing: 'p',
	slashing: 's',
	bludgeoning: 'b',
};

export type SettableSheetOption =
	| 'tempHp'
	| 'hp'
	| 'stamina'
	| 'resolve'
	| 'heroPoints'
	| 'focusPoints';

export interface roll {
	name: string;
	type: string;
	bonus: string | number;
	tags: string[];
}

export interface attackRoll {
	name: string;
	type: 'attack';
	toHit: string | number;
	damage: { dice?: string; type?: string }[];
	range?: string;
	traits: string[];
	notes?: string;
	tags: string[];
}

export class Creature {
	constructor(public sheet: Sheet, private _name?: string) {
		const sheetDefaults: Sheet = {
			info: { traits: [] },
			general: { senses: [], languages: [] },
			abilities: {},
			defenses: { resistances: [], immunities: [], weaknesses: [] },
			offense: {},
			castingStats: {},
			saves: {},
			skills: { lores: [] },
			attacks: [],
			rollMacros: [],
			actions: [],
			modifiers: [],
			sourceData: {},
		};
		this.sheet = _.defaultsDeep(this.sheet, sheetDefaults);
	}

	public get name() {
		return this._name ?? this.sheet.info.name;
	}

	public profToLevel(prof: number) {
		if (prof > 0) return prof + this.sheet.info.level;
		else return 0;
	}

	public compileSheetEmbed(): KoboldEmbed {
		const sheetEmbed = new KoboldEmbed();

		// sheet metadata
		sheetEmbed.setTitle(this.name);
		if (this.sheet.url) sheetEmbed.setURL(this.sheet.url);
		if (this.sheet.info.imageURL) sheetEmbed.setThumbnail(this.sheet.info.imageURL);

		// general section
		let generalText = '';
		if (this.sheet.defenses?.maxHp) {
			generalText += `HP: \`${this.sheet.defenses.currentHp}\`/\`${this.sheet.defenses.maxHp}\`\n`;
		}
		if (this.sheet.info.usesStamina) {
			generalText += `Stamina: \`${this.sheet.defenses.currentStamina}/${this.sheet.defenses.maxStamina}\`\n`;
			generalText += `Resolve: \`${this.sheet.defenses.currentResolve}/${this.sheet.defenses.maxResolve}\`\n`;
		}
		if (this.sheet.defenses.ac != null) generalText += `AC \`${this.sheet.defenses.ac}\`\n`;
		if (this.sheet.defenses.resistances?.length)
			generalText += `Resistances: ${this.sheet.defenses.resistances
				.map(r => `${r.type} ${r.amount}`)
				.join(', ')}\n`;
		if (this.sheet.defenses.weaknesses?.length)
			generalText += `Resistances: ${this.sheet.defenses.weaknesses
				.map(w => `${w.type} ${w.amount}`)
				.join(', ')}\n`;
		if (this.sheet.defenses.immunities?.length)
			generalText += `Immunities: ${this.sheet.defenses.immunities.join(', ')}\n`;
		if (this.sheet.general.perception != null)
			generalText += `Perception \`${this.sheet.general.perception}\` (DC ${
				10 + this.sheet.general.perception
			})\n`;
		if (this.sheet.general.classDC != null)
			generalText += `Class DC \`${this.sheet.general.classDC}\`\n`;

		const hasASpeed =
			this.sheet.general.speed != null ||
			this.sheet.general.flySpeed != null ||
			this.sheet.general.climbSpeed != null ||
			this.sheet.general.swimSpeed != null;
		if (hasASpeed) generalText += `Speed:`;
		if (this.sheet.general.speed != null)
			generalText += ` Walk \`${this.sheet.general.speed}\`ft`;
		if (this.sheet.general.flySpeed != null)
			generalText += ` Fly \`${this.sheet.general.flySpeed}\`ft`;
		if (this.sheet.general.climbSpeed != null)
			generalText += ` Climb \`${this.sheet.general.climbSpeed}\`ft`;
		if (this.sheet.general.swimSpeed)
			generalText += ` Swim \`${this.sheet.general.swimSpeed}\`ft`;
		if (this.sheet.info.traits?.length)
			generalText += `\nTraits: ${this.sheet.info.traits.join(', ')}`;
		if (hasASpeed) generalText += '\n';
		if (this.sheet.info.background)
			generalText += `\nBackground: ${this.sheet.info.background}`;

		let generalTitleText = '';
		if (this.sheet.info.level) generalTitleText = `Level ${this.sheet.info.level ?? 'unknown'}`;
		if (this.sheet.info.heritage) generalTitleText += ` ${this.sheet.info.heritage}`;
		if (this.sheet.info.ancestry) generalTitleText += ` ${this.sheet.info.ancestry}`;
		if (this.sheet.info.class) generalTitleText += ` ${this.sheet.info.class}`;
		if (generalTitleText.length) {
			sheetEmbed.addFields([
				{
					name: generalTitleText,
					value: generalText,
				},
			]);
		}

		// Abilities
		let abilityTexts = [];
		for (const ability in this.sheet.abilities) {
			if (this.sheet.abilities[ability] != null)
				abilityTexts.push(
					`${_.capitalize(ability.slice(0, 3))} \`${this.sheet.abilities[ability]}\``
				);
		}
		if (abilityTexts.length)
			sheetEmbed.addFields([{ name: 'Abilities', value: abilityTexts.join(', ') }]);

		// Saves
		let saveTexts = [];
		for (const save in this.sheet.saves) {
			if (save.includes('ProfMod') || this.sheet.saves[save] == null) continue;
			saveTexts.push(
				`${save} \`${this.sheet.saves[save] >= 0 ? '+' : ''}${
					this.sheet.saves[save]
				}\` (DC ${10 + this.sheet.saves[save]})`
			);
		}
		if (saveTexts.length)
			sheetEmbed.addFields([{ name: 'Saves', value: saveTexts.join(', ') }]);

		if (
			this.sheet.castingStats.arcaneAttack != null ||
			this.sheet.castingStats.divineAttack != null ||
			this.sheet.castingStats.primalAttack != null ||
			this.sheet.castingStats.occultAttack != null ||
			this.sheet.castingStats.arcaneDC != null ||
			this.sheet.castingStats.divineDC != null ||
			this.sheet.castingStats.primalDC != null ||
			this.sheet.castingStats.occultDC != null
		) {
			let castingStats = '';
			if (this.sheet.castingStats.arcaneAttack || this.sheet.castingStats.arcaneDC) {
				castingStats += `Arcane: `;
				if (this.sheet.castingStats.arcaneAttack)
					castingStats += ` \`+${this.sheet.castingStats.arcaneAttack}\``;
				if (this.sheet.castingStats.arcaneDC)
					castingStats += ` (DC ${this.sheet.castingStats.arcaneDC})`;
				castingStats += '\n';
			}
			if (this.sheet.castingStats.divineAttack || this.sheet.castingStats.divineDC) {
				castingStats += `Divine: `;
				if (this.sheet.castingStats.divineAttack)
					castingStats += ` \`+${this.sheet.castingStats.divineAttack}\``;
				if (this.sheet.castingStats.divineDC)
					castingStats += ` (DC ${this.sheet.castingStats.divineDC})`;
				castingStats += '\n';
			}
			if (this.sheet.castingStats.occultAttack || this.sheet.castingStats.occultDC) {
				castingStats += `Occult: `;
				if (this.sheet.castingStats.occultAttack)
					castingStats += ` \`+${this.sheet.castingStats.occultAttack}\``;
				if (this.sheet.castingStats.occultDC)
					castingStats += ` (DC ${this.sheet.castingStats.occultDC})`;
				castingStats += '\n';
			}
			if (this.sheet.castingStats.primalAttack || this.sheet.castingStats.primalDC) {
				castingStats += `Primal: `;
				if (this.sheet.castingStats.primalAttack)
					castingStats += ` \`+${this.sheet.castingStats.primalAttack}\``;
				if (this.sheet.castingStats.primalDC)
					castingStats += ` (DC ${this.sheet.castingStats.primalDC})`;
				castingStats += '\n';
			}
			sheetEmbed.addFields([{ name: 'Spellcasting', value: castingStats }]);
		}
		if (
			this.sheet.offense.simpleProfMod ||
			this.sheet.offense.martialProfMod ||
			this.sheet.offense.unarmedProfMod ||
			this.sheet.offense.advancedProfMod ||
			this.sheet.attacks?.length
		) {
			const maxWeaponMod = Math.max(
				this.sheet.offense.simpleProfMod ?? -99,
				this.sheet.offense.martialProfMod ?? -99,
				this.sheet.offense.unarmedProfMod ?? -99,
				this.sheet.offense.advancedProfMod ?? -99
			);
			let attacks = '';
			if (maxWeaponMod !== -99) {
				attacks = `**Melee** (strength, best proficiency): \`+${
					maxWeaponMod + this.sheet.info.level + this.mods.str
				}\`\n`;
				attacks += `**Ranged/Finesse** (dexterity, best proficiency): \`+${
					maxWeaponMod + this.sheet.info.level + this.mods.dex
				}\``;
			}
			for (const attack of _.values(this.attackRolls)) {
				let builtAttack = `**${_.capitalize(attack.name)}**`;
				if (attack.toHit) builtAttack += ` \`+${attack.toHit}\``;
				if (attack.traits?.length) builtAttack += ` (${attack.traits.join(', ')})`;
				builtAttack += `,`;
				if (attack.damage?.length) {
					builtAttack += ` **Damage:** ${attack.damage
						.map(d => `\`${d.dice}${d.type ? ` ${d.type}` : ''}\``)
						.join(', ')}`;
				}
				if (attacks.length) attacks += '\n';
				attacks += builtAttack;
			}
			sheetEmbed.addFields([{ name: 'Attacks', value: attacks }]);
		}

		// Skills
		let skillTexts = [];
		let skillTotals = this.skillTotals;
		for (const skill of _.keys(skillTotals).sort((a, b) => a.localeCompare(b))) {
			if (skillTotals[skill] == null) continue;
			//avoid null values
			skillTexts.push(
				`${skill} \`${skillTotals[skill] >= 0 ? '+' : ''}${skillTotals[skill]}\``
			);
		}
		const skillBatches = _.chunk(skillTexts, 7);
		for (const skillGroup of skillBatches) {
			sheetEmbed.addFields([{ name: 'Skills', value: skillGroup.join('\n'), inline: true }]);
		}

		return sheetEmbed;
	}

	// Gameplay Options

	public recover() {
		const updates: { name: string; initialValue: number; updatedValue: number }[] = [];
		if (this.sheet.defenses.tempHp > 0) {
			updates.push({
				name: 'Temp HP',
				initialValue: this.sheet.defenses.tempHp,
				updatedValue: 0,
			});
			this.sheet.defenses.tempHp = 0;
		}
		if (this.sheet.defenses.currentHp < this.sheet.defenses.maxHp) {
			updates.push({
				name: 'HP',
				initialValue: this.sheet.defenses.currentHp,
				updatedValue: this.sheet.defenses.maxHp,
			});
			this.sheet.defenses.currentHp = this.sheet.defenses.maxHp;
		}
		if (this.sheet.defenses.currentStamina < this.sheet.defenses.maxStamina) {
			updates.push({
				name: 'Stamina',
				initialValue: this.sheet.defenses.currentStamina,
				updatedValue: this.sheet.defenses.maxStamina,
			});
			this.sheet.defenses.currentStamina = this.sheet.defenses.maxStamina;
		}
		if (this.sheet.defenses.currentResolve < this.sheet.defenses.maxResolve) {
			updates.push({
				name: 'Resolve',
				initialValue: this.sheet.defenses.currentResolve,
				updatedValue: this.sheet.defenses.maxResolve,
			});
			this.sheet.defenses.currentResolve = this.sheet.defenses.maxResolve;
		}
		return updates;
	}

	/**
	 *
	 * @param option One of the settable sheet values
	 * @param value A string representing the value to update the sheet with
	 *  			A numeric string that can start with "+" or "-" to indicate a relative change
	 * @returns An object with the initial and updated values
	 */
	public updateValue(option: SettableSheetOption, value: string) {
		const computeNewValue = (
			currentValue: number,
			update: string,
			min?: number,
			max?: number
		) => {
			let finalValue: number;
			if (update.trim().startsWith('+')) {
				finalValue = currentValue + parseInt(update.trim().substring(1));
			} else if (update.trim().startsWith('-')) {
				finalValue = currentValue - parseInt(update.trim().substring(1));
			} else {
				finalValue = parseInt(update);
			}
			if (isNaN(finalValue)) throw new KoboldError(`Yip! I didn\'t understand "${value}"!`);
			if (min != null && finalValue < min) finalValue = min;
			if (max != null && finalValue > max) finalValue = max;
			return finalValue;
		};
		let initialValue;
		let updatedValue;

		if (option === 'hp') {
			initialValue = this.sheet.defenses.currentHp;
			updatedValue = computeNewValue(initialValue, value, 0, this.sheet.defenses.maxHp);
			this.sheet.defenses.currentHp = updatedValue;
		} else if (option === 'tempHp') {
			initialValue = this.sheet.defenses.tempHp;
			updatedValue = computeNewValue(initialValue, value, 0);
			this.sheet.defenses.tempHp = updatedValue;
		} else if (option === 'stamina') {
			initialValue = this.sheet.defenses.currentStamina;
			updatedValue = computeNewValue(initialValue, value, 0, this.sheet.defenses.maxStamina);
			this.sheet.defenses.currentStamina = updatedValue;
		} else if (option === 'resolve') {
			initialValue = this.sheet.defenses.currentResolve;
			updatedValue = computeNewValue(initialValue, value, 0, this.sheet.defenses.maxResolve);
			this.sheet.defenses.currentResolve = updatedValue;
		} else if (option === 'heroPoints') {
			initialValue = this.sheet.general.currentHeroPoints;
			updatedValue = computeNewValue(initialValue, value, 0, 3);
			this.sheet.general.currentHeroPoints = updatedValue;
		} else if (option === 'focusPoints') {
			initialValue = this.sheet.general.currentFocusPoints;
			updatedValue = computeNewValue(initialValue, value, 0, 3);
			this.sheet.general.currentFocusPoints = updatedValue;
		}
		return { initialValue, updatedValue };
	}

	public matchingWeakness(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return null;
		for (const weakness of this.sheet.defenses.weaknesses) {
			const shorthandWeaknessType = damageTypeShorthands[weakness.type];
			if (
				weakness.type.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === weakness.type.toLowerCase()) ||
				(shorthandWeaknessType && shorthandWeaknessType === damageType.toLowerCase())
			)
				return weakness;
		}
	}

	public matchingResistance(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return null;
		for (const resistance of this.sheet.defenses.resistances) {
			const shorthandResistanceType = damageTypeShorthands[resistance.type];
			if (
				resistance.type.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === resistance.type.toLowerCase()) ||
				(shorthandResistanceType && shorthandResistanceType === damageType.toLowerCase())
			)
				return resistance;
		}
	}

	public matchingImmunities(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return [];
		for (const immunity of this.sheet.defenses.immunities) {
			const shorthandImmunityType = damageTypeShorthands[immunity];
			if (
				immunity.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === immunity.toLowerCase()) ||
				(shorthandImmunityType && shorthandImmunityType === damageType.toLowerCase())
			)
				return [immunity];
		}
	}

	public heal(amount: number) {
		const currentHp = this.sheet.defenses.currentHp;
		this.sheet.defenses.currentHp = Math.min(this.sheet.defenses.maxHp, currentHp + amount);
		return { totalHealed: this.sheet.defenses.currentHp - currentHp };
	}

	/**
	 * Takes typed damage, applies any weaknesses or resistances, alters the sheet, and returns the actual damage taken
	 */
	public applyDamage(damage: number, damageType?: string) {
		let finalDamage = damage;
		let appliedWeakness;
		let appliedResistance;
		let appliedImmunity;
		if (damageType) {
			// we import damage types that end up containing effects sentences, so split
			// up the sentences into word tokens, then check each word against our weaknesses/resistances
			const damageTypeWords = damageType.split(/\W+/);
			const weakness = _.maxBy(
				damageTypeWords
					.map(word => this.matchingWeakness(word))
					.filter(weakness => weakness != null),
				weakness => weakness?.amount ?? 0
			);
			const resistance = _.maxBy(
				damageTypeWords
					.map(word => this.matchingResistance(word))
					.filter(resistance => resistance != null),
				resistances => resistances?.amount ?? 0
			);
			const immunities = damageTypeWords
				.map(word => this.matchingImmunities(word))
				.filter(immunity => !!immunity)
				.flat();

			if (weakness?.type) {
				finalDamage = finalDamage + (weakness?.amount ?? 0);
				appliedWeakness = weakness;
			}
			if (resistance?.type) {
				finalDamage = Math.max(0, finalDamage - (resistance?.amount ?? 0));
				appliedResistance = resistance;
			}
			if (immunities.length) {
				finalDamage = 0;
				appliedImmunity = immunities[0];
			}
		}
		let initialTempHp = this.sheet.defenses.tempHp;
		let initialStamina = this.sheet.defenses.currentStamina;
		let initialHp = this.sheet.defenses.currentHp;
		let unappliedDamage = finalDamage;

		// apply damage to temp hp first, then stamina, then hp
		if (initialTempHp > 0) {
			this.sheet.defenses.tempHp = Math.max(0, initialTempHp - unappliedDamage);
			unappliedDamage -= Math.min(initialTempHp, unappliedDamage);
		}
		if (unappliedDamage > 0 && this.sheet.info.usesStamina && initialStamina > 0) {
			this.sheet.defenses.currentStamina = Math.max(0, initialStamina - unappliedDamage);
			unappliedDamage -= Math.min(initialStamina, unappliedDamage);
		}
		if (unappliedDamage > 0 && initialHp > 0) {
			this.sheet.defenses.currentHp = Math.max(0, initialHp - unappliedDamage);
			unappliedDamage -= Math.min(initialHp, unappliedDamage);
		}

		return {
			totalDamage: finalDamage,
			appliedWeakness,
			appliedResistance,
			appliedImmunity,
			appliedDamage: finalDamage - unappliedDamage,
		};
	}

	getDC(dcName: string): number | null {
		const trimmedLowerDCName = dcName.toLowerCase().replace(/[^_\[\]a-zA-Z-0-9]+/g, '');

		if (['ac', 'armorclass', 'armor'].includes(trimmedLowerDCName))
			return this.sheet.defenses.ac ?? 10;
		if (['fort', 'fortitude'].includes(trimmedLowerDCName))
			return this.sheet.saves.fortitude ?? 10;
		if (['ref', 'reflex'].includes(trimmedLowerDCName)) return this.sheet.saves.reflex ?? 10;
		if (['will'].includes(trimmedLowerDCName)) return this.sheet.saves.will ?? 10;
		if (['perception', 'perceptiondc'].includes(trimmedLowerDCName))
			return this.sheet.general.perception ?? 10;
		if (['classdc', 'class'].includes(trimmedLowerDCName))
			return this.sheet.general.classDC ?? 10;
		for (const skill of _.keys(this.sheet.skills)) {
			if (skill === 'lores') continue;
			if (
				skill.toLowerCase() === trimmedLowerDCName ||
				skill.toLowerCase() + 'dc' === trimmedLowerDCName
			)
				return 10 + (this.sheet.skills[skill] ?? 0);
		}
		for (const skill of this.sheet.skills.lores) {
			if (
				skill.name.toLowerCase() === trimmedLowerDCName ||
				skill.name.toLowerCase() + 'dc' === trimmedLowerDCName
			)
				return 10 + (skill.bonus ?? 0);
		}
		if (['arcane', 'arcanedc', 'arcanespelldc'].includes(trimmedLowerDCName))
			return this.sheet.castingStats.arcaneDC ?? 10;
		if (['divine', 'divinedc', 'divinespelldc'].includes(trimmedLowerDCName))
			return this.sheet.castingStats.divineDC ?? 10;
		if (['occult', 'occultdc', 'occultspelldc'].includes(trimmedLowerDCName))
			return this.sheet.castingStats.occultDC ?? 10;
		if (['primal', 'primaldc', 'primalspelldc'].includes(trimmedLowerDCName))
			return this.sheet.castingStats.primalDC ?? 10;
		if (['spell', 'spelldc'].includes(trimmedLowerDCName)) {
			return Math.max(
				this.sheet.castingStats.arcaneDC ?? 10,
				this.sheet.castingStats.divineDC ?? 10,
				this.sheet.castingStats.occultDC ?? 10,
				this.sheet.castingStats.primalDC ?? 10
			);
		}
		return null;
	}

	// Roll Options

	public get attackRolls(): {
		[rollName: string]: attackRoll;
	} {
		const rolls: {
			[rollName: string]: attackRoll;
		} = {};

		if (this.sheet.castingStats.arcaneAttack != null) {
			rolls['arcane spell attack'] = {
				name: 'Arcane Spell Attack',
				type: 'attack',
				toHit: this.sheet.castingStats.arcaneAttack,
				damage: [],
				traits: [],
				tags: ['attack', 'spell', 'arcane'],
			};
		}

		if (this.sheet.castingStats.divineAttack != null) {
			rolls['divine spell attack'] = {
				name: 'Divine Spell Attack',
				type: 'attack',
				toHit: this.sheet.castingStats.divineAttack,
				damage: [],
				traits: [],
				tags: ['attack', 'spell', 'divine'],
			};
		}

		if (this.sheet.castingStats.occultAttack != null) {
			rolls['occult spell attack'] = {
				name: 'Occult Spell Attack',
				type: 'attack',
				toHit: this.sheet.castingStats.occultAttack,
				damage: [],
				traits: [],
				tags: ['attack', 'spell', 'occult'],
			};
		}

		if (this.sheet.castingStats.primalAttack != null) {
			rolls['primal spell attack'] = {
				name: 'Primal Spell Attack',
				type: 'attack',
				toHit: this.sheet.castingStats.primalAttack,
				damage: [],
				traits: [],
				tags: ['attack', 'spell', 'primal'],
			};
		}

		for (const attack of this.sheet.attacks) {
			rolls[attack.name.toLowerCase()] = {
				name: attack.name,
				type: 'attack',
				toHit: attack.toHit,
				damage: attack.damage,
				range: attack.range,
				traits: attack.traits ?? [],
				notes: attack.notes,
				tags: _.uniq(['attack', ...(attack.traits ?? [])]),
			};
		}
		return rolls;
	}

	public get keyedActions() {
		return _.keyBy(this.sheet.actions, action => action.name);
	}

	public get abilityRolls(): {
		[rollName: string]: roll;
	} {
		const rolls: {
			[rollName: string]: roll;
		} = {};

		for (const ability in this.sheet.abilities) {
			rolls[ability] = {
				name: ability.toLowerCase(),
				type: 'ability',
				bonus: this.mods[ability],
				tags: ['ability', ability],
			};
		}
		return rolls;
	}
	public get skillRolls(): {
		[rollName: string]: roll;
	} {
		const rolls: {
			[rollName: string]: roll;
		} = {};

		rolls.perception = {
			name: 'perception',
			type: 'skill',
			bonus: this.sheet.general.perception,
			tags: ['skill', 'perception', 'wisdom'],
		};

		for (const skill in this.sheet.skills) {
			if (skill.includes('ProfMod')) continue;
			rolls[skill] = {
				name: skill.toLowerCase(),
				type: 'skill',
				bonus: this.sheet.skills[skill],
				tags: ['skill', skill, Creature.attributeAbilityMap[skill]].filter(t => t != null),
			};
		}
		delete rolls.lores;
		for (const lore of this.sheet.skills.lores || []) {
			rolls[lore.name.toLocaleLowerCase() + ' lore'] = {
				name: lore.name + ' lore',
				type: 'skill',
				bonus: lore.bonus,
				tags: ['skill', lore.name, 'intelligence'],
			};
		}
		return rolls;
	}

	public get savingThrowRolls(): {
		[rollName: string]: roll;
	} {
		return {
			fortitude: {
				name: 'fortitude',
				type: 'save',
				bonus: this.sheet.saves.fortitude,
				tags: ['save', 'fortitude', 'constitution'],
			},
			reflex: {
				name: 'reflex',
				type: 'save',
				bonus: this.sheet.saves.reflex,
				tags: ['save', 'reflex', 'dexterity'],
			},
			will: {
				name: 'will',
				type: 'save',
				bonus: this.sheet.saves.will,
				tags: ['save', 'will', 'wisdom'],
			},
		};
	}

	public get rolls(): {
		[rollName: string]: roll;
	} {
		return {
			...this.savingThrowRolls,
			...this.abilityRolls,
			...this.skillRolls,
		};
	}

	public getRollNames() {
		return _.keys(this.rolls);
	}

	public get mods() {
		const parseMod = (score: number) => Math.floor((score - 10) / 2);
		return {
			str: parseMod(this.sheet.abilities.strength),
			strength: parseMod(this.sheet.abilities.strength),
			dex: parseMod(this.sheet.abilities.dexterity),
			dexterity: parseMod(this.sheet.abilities.dexterity),
			con: parseMod(this.sheet.abilities.constitution),
			constitution: parseMod(this.sheet.abilities.constitution),
			int: parseMod(this.sheet.abilities.intelligence),
			intelligence: parseMod(this.sheet.abilities.intelligence),
			wis: parseMod(this.sheet.abilities.wisdom),
			wisdom: parseMod(this.sheet.abilities.wisdom),
			cha: parseMod(this.sheet.abilities.charisma),
			charisma: parseMod(this.sheet.abilities.charisma),
		};
	}

	public get skillTotals() {
		const keyedLores = _.keyBy(this.sheet.skills.lores, lore => lore.name + ' lore');
		const lores = _.mapValues(keyedLores, lore => lore.bonus);
		const filteredSkills = _.pickBy(this.sheet.skills, (skillValue, skill) => {
			return (
				!skill.includes('lore') && !skill.includes('ProfMod') && skillValue !== undefined
			);
		});

		return { ...filteredSkills, ...lores };
	}

	public get actions() {
		return this.sheet?.actions;
	}
	public get modifiers() {
		return this.sheet?.modifiers;
	}
	public get rollMacros() {
		return this.sheet?.rollMacros;
	}

	public get attributes() {
		const baseAttributes = [
			{ name: 'level', type: 'base', value: this.sheet.general.level, tags: ['level'] },
			{ name: 'maxHp', type: 'base', value: this.sheet.defenses.maxHP, tags: ['maxHp'] },
			{
				name: 'hp',
				type: 'base',
				value: this.sheet.defenses.currentHp,
				tags: ['hp'],
			},
			{
				name: 'tempHp',
				type: 'base',
				value: this.sheet.defenses.tempHp || 0,
				tags: ['tempHp'],
			},
			{ name: 'ac', type: 'base', value: this.sheet.defenses.ac, tags: ['ac'] },
			{
				name: 'heroPoints',
				type: 'base',
				value: this.sheet.general.currentHeroPoints || 0,
				tags: ['heroPoints'],
			},

			{ name: 'speed', type: 'base', value: this.sheet.general.speed || 0, tags: ['speed'] },
			{
				name: 'classDc',
				type: 'base',
				value: this.sheet.general.classDC || 0,
				tags: ['classDc'],
			},
			{
				name: 'perception',
				type: 'skill',
				value: this.sheet.general.perception || 0,
				tags: ['skill', 'perception', 'wisdom'],
			},
		];
		if (this.sheet.info.usesStamina) {
			baseAttributes.push(
				{
					name: 'maxStamina',
					type: 'base',
					value: this.sheet.defenses.maxStamina || 0,
					tags: ['maxStamina'],
				},
				{
					name: 'maxResolve',
					type: 'base',
					value: this.sheet.defenses.maxResolve || 0,
					tags: ['maxResolve'],
				},
				{
					name: 'stamina',
					type: 'base',
					value: this.sheet.defenses.currentStamina || 0,
					tags: ['stamina'],
				},
				{
					name: 'resolve',
					type: 'base',
					value: this.sheet.defenses.currentResolve || 0,
					tags: ['resolve'],
				}
			);
		}
		if (this.sheet.castingStats.arcaneAttack != null) {
			baseAttributes.push(
				{
					name: 'arcane',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.arcaneAttack || 0),
					tags: ['arcane'],
				},
				{
					name: 'arcaneAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.arcaneAttack || 0),
					tags: ['arcaneAttack'],
				},
				{
					name: 'arcaneSpellAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.arcaneAttack || 0),
					tags: ['arcaneSpellAttack'],
				}
			);
		}
		if (this.sheet.castingStats.divineAttack != null) {
			baseAttributes.push(
				{
					name: 'divine',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.divineAttack || 0),
					tags: ['divine'],
				},
				{
					name: 'divineAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.divineAttack || 0),
					tags: ['divineAttack'],
				},
				{
					name: 'divineSpellAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.divineAttack || 0),
					tags: ['divineSpellAttack'],
				}
			);
		}
		if (this.sheet.castingStats.primalAttack != null) {
			baseAttributes.push(
				{
					name: 'primal',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.primalAttack || 0),
					tags: ['primal'],
				},
				{
					name: 'primalAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.primalAttack || 0),
					tags: ['primalAttack'],
				},
				{
					name: 'primalSpellAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.primalAttack || 0),
					tags: ['primalSpellAttack'],
				}
			);
		}
		if (this.sheet.castingStats.occultAttack != null) {
			baseAttributes.push(
				{
					name: 'occult',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.occultAttack || 0),
					tags: ['occult'],
				},
				{
					name: 'occultAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.occultAttack || 0),
					tags: ['occultAttack'],
				},
				{
					name: 'occultSpellAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.occultAttack || 0),
					tags: ['occultSpellAttack'],
				}
			);
		}
		if (this.sheet.castingStats.arcaneDC != null) {
			baseAttributes.push(
				{
					name: 'arcaneDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.arcaneDC || 0),
					tags: ['arcaneDC'],
				},
				{
					name: 'arcaneSpellDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.arcaneDC || 0),
					tags: ['arcaneSpellDC'],
				}
			);
		}
		if (this.sheet.castingStats.divineDC != null) {
			baseAttributes.push(
				{
					name: 'divineDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.divineDC || 0),
					tags: ['divineDC'],
				},
				{
					name: 'divineSpellDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.divineDC || 0),
					tags: ['divineSpellDC'],
				}
			);
		}
		if (this.sheet.castingStats.primalDC != null) {
			baseAttributes.push(
				{
					name: 'primalDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.primalDC || 0),
					tags: ['primalDC'],
				},
				{
					name: 'primalSpellDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.primalDC || 0),
					tags: ['primalSpellDC'],
				}
			);
		}
		if (this.sheet.castingStats.occultDC != null) {
			baseAttributes.push(
				{
					name: 'occultDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.occultDC || 0),
					tags: ['occultDC'],
				},
				{
					name: 'occultSpellDC',
					type: 'base',
					value: this.profToLevel(this.sheet.castingStats.occultDC || 0),
					tags: ['occultSpellDC'],
				}
			);
		}
		if (this.sheet.offense.simpleProfMod) {
			baseAttributes.push(
				{
					name: 'simpleProfMod',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.simpleProfMod || 0),
					tags: ['simpleProfMod'],
				},
				{
					name: 'simple',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.simpleProfMod || 0),
					tags: ['simple'],
				},
				{
					name: 'simpleWeapon',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.simpleProfMod || 0),
					tags: ['simpleWeapon'],
				},
				{
					name: 'simpleAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.simpleProfMod || 0),
					tags: ['simpleAttack'],
				}
			);
		}
		if (this.sheet.offense.martialProfMod) {
			baseAttributes.push(
				{
					name: 'martialProfMod',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.martialProfMod || 0),
					tags: ['martialProfMod'],
				},
				{
					name: 'martial',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.martialProfMod || 0),
					tags: ['martial'],
				},
				{
					name: 'martialWeapon',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.martialProfMod || 0),
					tags: ['martialWeapon'],
				},
				{
					name: 'martialAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.martialProfMod || 0),
					tags: ['martialAttack'],
				}
			);
		}
		if (this.sheet.offense.unarmedProfMod) {
			baseAttributes.push(
				{
					name: 'unarmedProfMod',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.unarmedProfMod || 0),
					tags: ['unarmedProfMod'],
				},
				{
					name: 'unarmed',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.unarmedProfMod || 0),
					tags: ['unarmed'],
				},
				{
					name: 'unarmedWeapon',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.unarmedProfMod || 0),
					tags: ['unarmedWeapon'],
				},
				{
					name: 'unarmedAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.unarmedProfMod || 0),
					tags: ['unarmedAttack'],
				}
			);
		}
		if (this.sheet.offense.advancedProfMod) {
			baseAttributes.push(
				{
					name: 'advancedProfMod',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.advancedProfMod || 0),
					tags: ['advancedProfMod'],
				},
				{
					name: 'advanced',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.advancedProfMod || 0),
					tags: ['advanced'],
				},
				{
					name: 'advancedWeapon',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.advancedProfMod || 0),
					tags: ['advancedWeapon'],
				},
				{
					name: 'advancedAttack',
					type: 'base',
					value: this.profToLevel(this.sheet.offense.advancedProfMod || 0),
					tags: ['advancedAttack'],
				}
			);
		}

		const lores = this.sheet.skills.lores.map(lore => ({
			name: lore.name + ' lore',
			value: lore.bonus,
			tags: ['skill', lore.name, 'intelligence'],
		}));
		const nonLoreSkills: Character['attributes'] = [];
		for (const skillName in this.sheet.skills) {
			nonLoreSkills.push({
				name: skillName,
				type: 'skill',
				value: this.sheet.skills[skillName],
				tags: ['skill', skillName, Creature.attributeAbilityMap[skillName]],
			});
		}
		const abilities: Character['attributes'] = [];
		for (const abilityName in this.sheet.abilities) {
			abilities.push({
				name: abilityName,
				type: 'ability',
				value: this.mods[abilityName],
				tags: ['ability', abilityName],
			});
			abilities.push({
				name: abilityName.slice(0, 3),
				type: 'ability',
				value: this.mods[abilityName],
				tags: ['ability', abilityName],
			});
		}
		const saves: Character['attributes'] = [];
		for (const saveName in this.sheet.saves) {
			saves.push({
				name: saveName,
				type: 'save',
				value: this.sheet.saves[saveName],
				tags: ['save', saveName],
			});
		}
		saves.push(
			{
				name: 'fort',
				type: 'save',
				value: this.sheet.saves.fortitude,
				tags: ['save', 'fortitude', 'constitution'],
			},
			{
				name: 'ref',
				type: 'save',
				value: this.sheet.saves.reflex,
				tags: ['save', 'reflex', 'dexterity'],
			}
		);
		return [...baseAttributes, ...lores, ...nonLoreSkills, ...abilities];
	}

	public static preserveSheetTrackerValues(sheet: Sheet, updateFrom?: Sheet): Sheet {
		if (updateFrom) {
			sheet.general.currentHeroPoints =
				updateFrom?.general?.currentHeroPoints ?? sheet.general.currentHeroPoints;
			sheet.general.currentFocusPoints =
				updateFrom?.general?.currentFocusPoints ?? sheet.general.currentFocusPoints;

			sheet.defenses.currentHp = updateFrom?.defenses?.currentHp ?? sheet.defenses.currentHp;
			sheet.defenses.currentResolve =
				updateFrom?.defenses?.currentResolve ?? sheet.defenses.currentResolve;
			sheet.defenses.currentStamina =
				updateFrom?.defenses?.currentStamina ?? sheet.defenses.currentStamina;
			sheet.defenses.tempHp = updateFrom?.defenses?.tempHp ?? sheet.defenses.tempHp;
		}
		return sheet;
	}

	public static attributeAbilityMap(): { [skillName: string]: string } {
		return {
			acrobatics: 'dexterity',
			arcana: 'intelligence',
			athletics: 'strength',
			crafting: 'intelligence',
			deception: 'charisma',
			diplomacy: 'charisma',
			intimidation: 'charisma',
			medicine: 'wisdom',
			nature: 'wisdom',
			occultism: 'intelligence',
			performance: 'charisma',
			religion: 'wisdom',
			society: 'intelligence',
			stealth: 'dexterity',
			survival: 'wisdom',
			thievery: 'dexterity',
			perception: 'wisdom',

			fortitude: 'constitution',
			reflex: 'dexterity',
			will: 'wisdom',

			strength: 'strength',
			dexterity: 'dexterity',
			constitution: 'constitution',
			intelligence: 'intelligence',
			wisdom: 'wisdom',
			charisma: 'charisma',
		};
	}

	public static fromInitActor(initActor: InitiativeActor): Creature {
		return new Creature(initActor.sheet);
	}

	public static fromCharacter(character: Character): Creature {
		let sheet = { ...character.sheet };
		sheet.actions = [...(sheet.actions ?? []), ...character.actions];
		sheet.modifiers = [...(sheet.modifiers ?? []), ...character.modifiers];
		sheet.rollMacros = [...(sheet.rollMacros ?? []), ...character.rollMacros];
		return new Creature(sheet);
	}

	public static fromBestiaryEntry(
		bestiaryEntry: CreatureStatBlock,
		fluffEntry,
		options: { useStamina?: boolean; template?: string; customName?: string } = {
			useStamina: false,
			template: '',
			customName: '',
		}
	): Creature {
		const sheet = convertBestiaryCreatureToSheet(bestiaryEntry, fluffEntry, options);

		return new Creature(sheet);
	}
	public static fromWandererersGuide(
		calculatedStats: WG.CharacterCalculatedStatsApiResponse,
		characterData: WG.CharacterApiResponse,
		updateFrom?: Sheet
	): Creature {
		let sheet = convertWanderersGuideCharToSheet(calculatedStats, characterData);
		sheet = Creature.preserveSheetTrackerValues(sheet, updateFrom);
		return new Creature(sheet);
	}

	public static fromPathBuilder(
		pathBuilderSheet: PathBuilder.Character,
		updateFrom?: Sheet,
		options: {
			useStamina: boolean;
		} = { useStamina: false }
	): Creature {
		let sheet = convertPathBuilderToSheet(pathBuilderSheet, options);
		if (updateFrom) {
			sheet.info.imageURL = updateFrom.info.imageURL ?? sheet.info.imageURL;
		}
		sheet = Creature.preserveSheetTrackerValues(sheet, updateFrom);
		return new Creature(sheet);
	}

	//roll helpers

	/**
	 * Gets a list of the applicable modifiers for any set of tags
	 * @param tags the tags to check against a character's modifiers
	 * @returns modifier[]
	 */
	public getModifiersFromTags(
		tags: string[],
		extraAttributes?: {
			name: string;
			value: number;
			tags?: string[];
		}[]
	): Sheet['modifiers'] {
		const { untyped, bonuses, penalties } = parseBonusesForTagsFromModifiers(
			this.modifiers,
			[
				...(this.attributes as {
					name: string;
					value: number;
					tags?: string[];
				}[]),
				...(extraAttributes || []),
			],
			tags,
			this
		);
		return untyped.concat(_.values(bonuses), _.values(penalties));
	}

	/**
	 * Uses a creature's roll macros to expand a roll
	 */
	public expandRollWithMacros(rollExpression: string): string {
		const creatureRollMacros = this.rollMacros || [];
		const maxDepth = 10;
		let resultRollExpression = rollExpression.toLocaleLowerCase();
		for (let i = 0; i < maxDepth; i++) {
			let rollExpressionBeforeExpanding = resultRollExpression;
			// replace every instance of each macro in the rollExpression with the macro's value
			for (const macro of creatureRollMacros) {
				resultRollExpression = resultRollExpression.replaceAll(
					`[${macro.name.toLocaleLowerCase()}]`,
					macro.macro
				);
			}
			// if we haven't changed the roll expression, then we're done checking macros
			if (rollExpressionBeforeExpanding === resultRollExpression) break;
		}
		return resultRollExpression;
	}
}
