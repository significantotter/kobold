import _ from 'lodash';
import { Attribute, Counter, ProficiencyStat } from '../services/kobold/index.js';
import { Creature } from './creature.js';
import { SheetProperties } from './sheet/sheet-properties.js';

export class AttributeUtils {
	public static statToAttributes(
		creature: Creature,
		stat: ProficiencyStat,
		attrType: string,
		aliasTerm?: string
	): Attribute[] {
		if (aliasTerm == undefined) aliasTerm = attrType;
		const name = SheetProperties.standardizeCustomPropName(stat.name);
		const aliasableName = name.replaceAll(' ', '');
		return [
			{
				name: name,
				aliases: _.uniq([
					aliasableName + attrType + 'bonus',
					aliasableName + attrType + 'attack',
					aliasableName + 'bonus',
					aliasableName + 'attack',
					aliasableName,
				]),
				type: 'attr',
				value: creature.interpretBonus(stat),
				tags: ['attr', attrType, name, stat.ability ?? ''].filter(_.identity),
			},
			{
				name: name + 'Dc',
				type: 'attr',
				aliases: _.uniq([
					aliasableName + attrType + 'dc',
					aliasableName + attrType + 'defense',
					aliasableName + 'dc',
					aliasableName + 'defense',
				]),
				value: creature.interpretDc(stat),
				tags: ['attr', attrType, name, stat.ability ?? ''].filter(_.identity),
			},
			{
				name: name + 'Proficiency',
				type: 'attr',
				aliases: _.uniq([
					aliasableName + attrType + 'proficiency',
					aliasableName + attrType + 'proficiencymodifier',
					aliasableName + attrType + 'proficiencymod',
					aliasableName + attrType + 'prof',
					aliasableName + attrType + 'profmod',
					aliasableName + 'proficiency',
					aliasableName + 'proficiencymodifier',
					aliasableName + 'proficiencymod',
					aliasableName + 'profmod',
				]),
				value: stat.proficiency ?? 0,
				tags: ['attr', attrType, name, stat.ability ?? ''].filter(_.identity),
			},
		];
	}

	public static counterToAttributes(counter: Counter): Attribute[] {
		const name = SheetProperties.standardizeCustomPropName(counter.name);
		const aliasableName = name.replaceAll(' ', '');
		const attributes = [];
		if (counter.max != null) {
			attributes.push({
				name: 'max' + name,
				aliases: ['max' + aliasableName, aliasableName],
				type: 'counter',
				value: counter.max ?? 0,
				tags: ['attr', name].filter(_.identity),
			});
		}
		if ('current' in counter) {
			attributes.push({
				name: 'current' + name,
				type: 'counter',
				aliases: ['current' + aliasableName],
				value: counter.current,
				tags: ['attr', name].filter(_.identity),
			});
		} else {
			attributes.push({
				name: 'current' + name,
				type: 'counter',
				aliases: ['current' + aliasableName],
				value: counter.active.filter(_.identity).length,
				tags: ['attr', name].filter(_.identity),
			});
		}
		return attributes;
	}

	public static intPropertyToAttribute(
		intProperty: { name: string; value: number | null },
		attrType: string,
		aliasTerm?: string
	): Attribute {
		if (aliasTerm == undefined) aliasTerm = attrType;
		const aliasableName = SheetProperties.standardizeCustomPropName(
			intProperty.name.replaceAll(' ', '')
		);
		return {
			name: intProperty.name,
			aliases: _.uniq([aliasableName, aliasableName + aliasTerm]),
			type: 'attr',
			value: intProperty.value ?? 0,
			tags: ['attr', intProperty.name].filter(_.identity),
		};
	}

	public static intWeaponProfPropertyToAttribute(intProperty: {
		name: string;
		value: number | null;
	}): Attribute {
		const name = intProperty.name;
		return {
			name: name,
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
			type: 'attr',
			value: intProperty.value ?? 0,
			tags: ['attr', name].filter(_.identity),
		};
	}

	public static intArmorProfPropertyToAttribute(intProperty: {
		name: string;
		value: number | null;
	}): Attribute {
		const name = intProperty.name;
		return {
			name: name,
			aliases: [
				name,
				name + 'armor',
				name + 'defense',
				name + 'proficiency',
				name + 'prof',
				name + 'profmod',
				name + 'armorprof',
				name + 'defenseprof',
				name + 'armorprofmod',
				name + 'defenseprofmod',
				name + 'armorproficiency',
				name + 'defenseproficiency',
			],
			type: 'attr',
			value: intProperty.value ?? 0,
			tags: ['attr', name].filter(_.identity),
		};
	}

	public static getAttributes(creature: Creature): Attribute[] {
		const baseAttributes: Attribute[] = [];

		baseAttributes.push({
			aliases: ['level'],
			name: 'level',
			type: 'base',
			value: creature.sheet.staticInfo.level ?? 0,
			tags: ['level'],
		});

		baseAttributes.push(
			...creature.saves.map(save => this.statToAttributes(creature, save, 'save')).flat()
		);
		baseAttributes.push(
			...creature.skills.map(skill => this.statToAttributes(creature, skill, 'skill')).flat()
		);
		baseAttributes.push(
			...creature.castingStats
				.map(spell => this.statToAttributes(creature, spell, 'casting', 'spell'))
				.flat()
		);
		baseAttributes.push(
			...this.statToAttributes(creature, creature.sheet.stats.class, 'class', '')
		);
		baseAttributes.push(
			...this.statToAttributes(creature, creature.sheet.stats.perception, 'perception', '')
		);

		baseAttributes.push(
			...creature.counters.map(counter => this.counterToAttributes(counter)).flat()
		);

		baseAttributes.push({
			name: 'ac',
			aliases: ['ac', 'armorclass', 'armor'],
			type: 'attr',
			value: creature.ac,
			tags: ['attr', 'ac'].filter(_.identity),
		});

		baseAttributes.push(
			...creature.abilityList.map(ability => this.intPropertyToAttribute(ability, 'ability'))
		);
		baseAttributes.push(
			...creature.speeds.map(ability => this.intPropertyToAttribute(ability, 'speed'))
		);
		baseAttributes.push(
			...creature.weaponProficiencies.map(ability =>
				this.intWeaponProfPropertyToAttribute(ability)
			)
		);
		baseAttributes.push(
			...creature.armorProficiencies.map(ability =>
				this.intArmorProfPropertyToAttribute(ability)
			)
		);

		return baseAttributes;
	}
}
