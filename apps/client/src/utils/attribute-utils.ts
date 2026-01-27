import _ from 'lodash';
import {
	isSheetIntegerKeys,
	type Attribute,
	StatSubGroupEnum,
	isStatSubGroupEnum,
	isSheetBaseCounterKeys,
	SheetIntegerKeys,
	SheetBaseCounterKeys,
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

export class AttributeUtils {
	public static computedSheetProperties(creature: Creature): Attribute[] {
		const attributes: Attribute[] = [];
		// attack proficiencies with level
		attributes.push(
			...['unarmed', 'simple', 'martial', 'advanced'].map(name => {
				let proficiency = 0;
				switch (name) {
					case 'unarmed':
						proficiency = creature.sheet.intProperties.unarmedProficiency ?? 0;
						break;
					case 'simple':
						proficiency = creature.sheet.intProperties.simpleProficiency ?? 0;
						break;
					case 'martial':
						proficiency = creature.sheet.intProperties.martialProficiency ?? 0;
						break;
					case 'advanced':
						proficiency = creature.sheet.intProperties.advancedProficiency ?? 0;
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
					value: (creature.sheet.staticInfo.level ?? 0) + proficiency,
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
						proficiency = creature.sheet.intProperties.unarmoredProficiency ?? 0;
						break;
					case 'light':
						proficiency = creature.sheet.intProperties.lightProficiency ?? 0;
						break;
					case 'medium':
						proficiency = creature.sheet.intProperties.mediumProficiency ?? 0;
						break;
					case 'heavy':
						proficiency = creature.sheet.intProperties.heavyProficiency ?? 0;
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
					value: (creature.sheet.staticInfo.level ?? 0) + proficiency,
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
					value: (creature.sheet.staticInfo.level ?? 0) + proficiency,
					tags: [],
				};
			})
		);
		return attributes;
	}

	public static getAttributeByName(creature: Creature, name: string): Attribute | null {
		const standardizedName = SheetProperties.standardizeProperty(name);
		const standardizedCustomPropName = SheetProperties.standardizeCustomPropName(name);
		for (const attribute of this.computedSheetProperties(creature)) {
			if (attribute.aliases.includes(standardizedName.toLowerCase())) {
				return attribute;
			}
		}

		if (
			isSheetIntegerKeys(standardizedName) &&
			creature.sheet.intProperties[standardizedName]
		) {
			const property = SheetIntegerProperties.properties[standardizedName];
			return {
				aliases: property.aliases,
				type: property.type,
				value: creature.sheet.intProperties[standardizedName] ?? 0,
				name: standardizedName,
				tags: property.tags,
			};
		}
		if (SheetStatProperties.isSheetStatPropertyName(standardizedName)) {
			const property = SheetStatProperties.properties[standardizedName];
			if (property.subKey === StatSubGroupEnum.ability) return null;
			return {
				aliases: property.aliases,
				type: property.type,
				value: creature.sheet.stats[property.baseKey][property.subKey] ?? 0,
				name: standardizedName,
				tags: property.tags,
			};
		}
		const standardizedCounterName = standardizedName
			.replaceAll('current', '')
			.replaceAll('Current', '')
			.trim();
		if (isSheetBaseCounterKeys(standardizedCounterName)) {
			const property = SheetProperties.properties[standardizedCounterName];
			const sheetValue = creature.sheet.baseCounters[standardizedCounterName];
			const currentValue = standardizedName.includes('current');
			return {
				aliases: property.aliases,
				type: property.type,
				value: (currentValue ? sheetValue.current : sheetValue.max) ?? 0,
				name: (currentValue ? 'current' : 'max') + _.capitalize(standardizedCounterName),
				tags: property.tags,
			};
		}

		const propertyMatch = SheetAdditionalSkillProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const additionalSkill = creature.sheet.additionalSkills.find(
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

		const weakResMatch = SheetWeaknessResistanceProperties.propertyNameRegex.exec(
			standardizedCustomPropName
		);
		const weakness = creature.sheet.weaknessesResistances.weaknesses.find(
			weakness => weakness.type === weakResMatch?.[1]
		);
		const resistance = creature.sheet.weaknessesResistances.resistances.find(
			resistance => resistance.type === weakResMatch?.[1]
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

		if (standardizedName === 'level') {
			return {
				aliases: ['level'],
				name: 'level',
				type: 'base',
				value: creature.sheet.staticInfo.level ?? 0,
				tags: ['level'],
			};
		}
		return null;
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
