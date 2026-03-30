import _ from 'lodash';
import {
	isSheetIntegerKeys,
	type Attribute,
	StatSubGroupEnum,
	isStatSubGroupEnum,
	SheetIntegerKeys,
	SheetBaseCounterKeys,
	Sheet,
} from '@kobold/db';
import type { Creature } from './creature.js';
import {
	SheetAdditionalSkillProperties,
	SheetBaseCounterProperties,
	SheetIntegerProperties,
	SheetProperties,
	SheetStatProperties,
	SheetStatPropertyKey,
	SheetWeaknessResistanceProperties,
} from './sheet/sheet-properties.js';
import { staticAttributes, attributeShorthands } from '../constants/attributes.js';

export class AttributeUtils {
	/**
	 * Gets computed sheet properties (proficiencies with level) from a Sheet.
	 * This is the core logic that works with just Sheet data.
	 */
	public static computedSheetPropertiesFromSheet(sheet: Sheet): Attribute[] {
		const attributes: Attribute[] = [];
		// attack proficiencies with level
		attributes.push(
			...['unarmed', 'simple', 'martial', 'advanced'].map(name => {
				let proficiency = 0;
				switch (name) {
					case 'unarmed':
						proficiency = sheet.intProperties.unarmedProficiency ?? 0;
						break;
					case 'simple':
						proficiency = sheet.intProperties.simpleProficiency ?? 0;
						break;
					case 'martial':
						proficiency = sheet.intProperties.martialProficiency ?? 0;
						break;
					case 'advanced':
						proficiency = sheet.intProperties.advancedProficiency ?? 0;
						break;
				}
				return {
					name,
					aliases: [
						name,
						name + 'weapon',
						name + 'attack',
						name + 'proficiency',
						name + 'prof',
						name + 'profmod',
						name + 'weaponprof',
						name + 'attackprof',
						name + 'weaponprofmod',
						name + 'attackprofmod',
						name + 'weaponproficiency',
						name + 'attackproficiency',
					],
					type: 'attack',
					value: (sheet.staticInfo.level ?? 0) + proficiency,
					tags: [],
				};
			})
		);
		// armor proficiencies with level
		attributes.push(
			...['unarmored', 'light', 'medium', 'heavy'].map(name => {
				let proficiency = 0;
				switch (name) {
					case 'unarmored':
						proficiency = sheet.intProperties.unarmoredProficiency ?? 0;
						break;
					case 'light':
						proficiency = sheet.intProperties.lightProficiency ?? 0;
						break;
					case 'medium':
						proficiency = sheet.intProperties.mediumProficiency ?? 0;
						break;
					case 'heavy':
						proficiency = sheet.intProperties.heavyProficiency ?? 0;
						break;
				}
				return {
					name,
					aliases: [
						name,
						name + 'armor',
						name + 'defense',
						name + 'proficiency',
						name + 'armorprof',
						name + 'defenseprof',
						name + 'armorproficiency',
						name + 'defenseproficiency',
					],
					type: 'armor',
					value: (sheet.staticInfo.level ?? 0) + proficiency,
					tags: [],
				};
			})
		);
		// general trained/legendary/master/untrained proficiencies with level
		attributes.push(
			...['trained', 'expert', 'master', 'legendary'].map(name => {
				let proficiency = 0;
				switch (name) {
					case 'trained':
						proficiency = 2;
						break;
					case 'expert':
						proficiency = 4;
						break;
					case 'master':
						proficiency = 6;
						break;
					case 'legendary':
						proficiency = 8;
						break;
				}
				return {
					name,
					aliases: [
						name,
						name + 'total',
						name + 'bonus',
						name + 'mod',
						name + 'modifier',
					],
					type: 'proficiency',
					value: (sheet.staticInfo.level ?? 0) + proficiency,
					tags: [],
				};
			})
		);
		return attributes;
	}

	/**
	 * @deprecated Use computedSheetPropertiesFromSheet instead when you only have a Sheet
	 */
	public static computedSheetProperties(creature: Creature): Attribute[] {
		return this.computedSheetPropertiesFromSheet(creature.sheet);
	}

	/**
	 * Gets an attribute from a Sheet by name.
	 * This is the core lookup logic that works with just Sheet data.
	 * Handles name normalization (brackets, underscores, shorthands).
	 * Returns null if the attribute is not found.
	 */
	public static getAttributeFromSheet(sheet: Sheet, name: string): Attribute | null {
		const trimRegex = /[\[\]\\_\-]/g;
		const trimmedName = name.replace(trimRegex, '').trim().toLowerCase();
		const attributeName = attributeShorthands[trimmedName] || trimmedName;
		const standardizedName = SheetProperties.standardizeProperty(attributeName);
		// Use original name with only brackets removed for custom prop matching (preserves camelCase)
		const nameWithoutBrackets = name.replace(/[\[\]]/g, '').trim();
		const standardizedCustomPropName =
			SheetProperties.standardizeCustomPropName(nameWithoutBrackets);

		// Check static attributes (level, trained, etc.)
		const staticAttribute = staticAttributes(sheet).find(
			attr => attr.name.replace(trimRegex, '').toLowerCase() === attributeName
		);
		if (staticAttribute?.value !== undefined) {
			return {
				aliases: [staticAttribute.name],
				name: staticAttribute.name,
				type: 'base',
				value: staticAttribute.value,
				tags: [],
			};
		}

		// Check computed sheet properties (proficiencies)
		for (const attribute of this.computedSheetPropertiesFromSheet(sheet)) {
			if (attribute.aliases.includes(standardizedName.toLowerCase())) {
				return attribute;
			}
		}

		// Check integer properties (strength, constitution, etc.)
		if (isSheetIntegerKeys(standardizedName) && sheet.intProperties[standardizedName] != null) {
			const property = SheetIntegerProperties.properties[standardizedName];
			return {
				aliases: property.aliases,
				type: property.type,
				value: sheet.intProperties[standardizedName] ?? 0,
				name: standardizedName,
				tags: property.tags,
			};
		}

		// Check stat properties (arcana bonus, will dc, etc.)
		if (SheetStatProperties.isSheetStatPropertyName(standardizedName)) {
			const property = SheetStatProperties.properties[standardizedName];
			if (property.subKey === StatSubGroupEnum.ability) return null;
			return {
				aliases: property.aliases,
				type: property.type,
				value: sheet.stats[property.baseKey][property.subKey] ?? 0,
				name: standardizedName,
				tags: property.tags,
			};
		}

		// Check base counters (hp, temphp, etc.) using unified readAliases
		// This properly handles maxHp, currentHp, hp (defaults to max), etc.
		const counterNameWithoutSpaces = trimmedName.replaceAll(' ', '');
		const counterReadAlias = SheetBaseCounterProperties.readAliases[counterNameWithoutSpaces];
		if (counterReadAlias) {
			const property = SheetProperties.properties[counterReadAlias.key];
			const sheetValue = sheet.baseCounters[counterReadAlias.key];
			const value = counterReadAlias.variant === 'max' ? sheetValue.max : sheetValue.current;
			return {
				aliases: property.aliases,
				type: property.type,
				value: value ?? 0,
				name:
					(counterReadAlias.variant === 'max' ? 'max' : 'current') +
					_.capitalize(counterReadAlias.key),
				tags: property.tags,
			};
		}

		// Check additional skills (lores)
		const propertyMatch = SheetAdditionalSkillProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const additionalSkill = sheet.additionalSkills.find(
			skill => skill.name === propertyMatch?.[1]
		);
		const additionalSkillSubKey = propertyMatch?.[2] ?? 'bonus';
		if (additionalSkill && isStatSubGroupEnum(additionalSkillSubKey)) {
			if (additionalSkillSubKey === StatSubGroupEnum.ability) return null;
			return {
				aliases: [],
				type: 'skill',
				value: additionalSkill[additionalSkillSubKey] ?? 0,
				name: additionalSkill.name,
				tags: ['skill', 'intelligence', 'lore'],
			};
		}

		// Check weaknesses/resistances
		const weakResMatch = SheetWeaknessResistanceProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const weakness = sheet.weaknessesResistances.weaknesses.find(
			w => w.type === weakResMatch?.[1]
		);
		const resistance = sheet.weaknessesResistances.resistances.find(
			r => r.type === weakResMatch?.[1]
		);
		const weaknessResistance = weakness ?? resistance;
		if (weaknessResistance) {
			const type = weakness ? 'weakness' : 'resistance';
			return {
				aliases: [],
				type: type,
				value: weaknessResistance.amount,
				name: weaknessResistance.type + ' ' + type,
				tags: [],
			};
		}

		return null;
	}

	/**
	 * Gets the numeric value of an attribute from a Sheet by name.
	 * Use this when you only need the value and don't have a full Creature object.
	 * Returns null if the attribute is not found.
	 */
	public static getAttributeValueFromSheet(sheet: Sheet, name: string): number | null {
		const attribute = this.getAttributeFromSheet(sheet, name);
		return attribute?.value ?? null;
	}

	public static getAttributeByName(creature: Creature, name: string): Attribute | null {
		return this.getAttributeFromSheet(creature.sheet, name);
	}

	public static getAttributes(creature: Creature): Attribute[] {
		const attributes: Attribute[] = [];

		attributes.push({
			aliases: ['level'],
			name: 'level',
			type: 'base',
			value: creature.sheet.staticInfo.level ?? 0,
			tags: ['level'],
		});

		attributes.push(...this.computedSheetProperties(creature));

		let intKey: SheetIntegerKeys;
		for (intKey in SheetIntegerProperties.properties) {
			const property = SheetIntegerProperties.properties[intKey];
			if (property) {
				attributes.push({
					aliases: property.aliases,
					type: property.type,
					value: creature.sheet.intProperties[intKey] ?? 0,
					name: intKey,
					tags: property.tags,
				});
			}
		}

		let statKey: SheetStatPropertyKey;
		for (statKey in SheetStatProperties.properties) {
			const property = SheetStatProperties.properties[statKey];
			if (property.subKey === StatSubGroupEnum.ability) continue;

			attributes.push({
				aliases: property.aliases,
				type: property.type,
				value: creature.sheet.stats[property.baseKey][property.subKey] ?? 0,
				name: statKey,
				tags: property.tags,
			});
		}

		let counterKey: SheetBaseCounterKeys;
		for (counterKey in SheetBaseCounterProperties.properties) {
			const property = SheetBaseCounterProperties.properties[counterKey];
			attributes.push({
				aliases: [],
				type: property.type,
				value: creature.sheet.baseCounters[counterKey].max ?? 0,
				name: 'max' + _.capitalize(counterKey),
				tags: property.tags,
			});
			attributes.push({
				aliases: property.aliases,
				type: property.type,
				value: creature.sheet.baseCounters[counterKey].current ?? 0,
				name: 'current' + _.capitalize(counterKey),
				tags: property.tags,
			});
		}

		for (const skill of creature.sheet.additionalSkills) {
			attributes.push({
				aliases: [skill.name + ' attack', skill.name],
				type: 'skill',
				value: skill.bonus ?? 0,
				name: skill.name + 'bonus',
				tags: ['skill', 'intelligence', 'lore'],
			});
			attributes.push({
				aliases: [],
				type: 'skill',
				value: skill.dc ?? 0,
				name: skill.name + ' dc',
				tags: ['skill', 'intelligence', 'lore'],
			});
			attributes.push({
				aliases: [],
				type: 'skill',
				value: skill.proficiency ?? 0,
				name: skill.name + ' proficiency',
				tags: ['skill', 'intelligence', 'lore'],
			});
		}

		for (const weakness of creature.sheet.weaknessesResistances.weaknesses) {
			attributes.push({
				aliases: [],
				type: 'weakness',
				value: weakness.amount,
				name: weakness.type + ' weakness',
				tags: [],
			});
		}

		for (const resistance of creature.sheet.weaknessesResistances.resistances) {
			attributes.push({
				aliases: [],
				type: 'resistance',
				value: resistance.amount,
				name: resistance.type + ' resistance',
				tags: [],
			});
		}

		return attributes;
	}
}
