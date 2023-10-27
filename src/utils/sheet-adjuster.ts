import _ from 'lodash';
import {
	AbilityEnum,
	AdjustablePropertyEnum,
	Damage,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAttack,
	SheetBaseCounterKeys,
	SheetBaseCounters,
	SheetInfo,
	SheetInfoListKeys,
	SheetInfoLists,
	SheetIntegers,
	SheetStatKeys,
	SheetStats,
	StatSubGroupEnum,
} from '../services/kobold/models/index.js';
import {
	SheetProperties,
	SheetInfoProperties,
	SheetInfoListProperties,
	SheetIntegerProperties,
	SheetBaseCounterProperties,
	SheetStatProperties,
	SheetWeaknessResistanceProperties,
	SheetAdditionalSkillProperties,
	SheetAttackProperties,
} from './sheet-properties.js';
import { KoboldError } from './KoboldError.js';

export type ParsedSheetAdjustment<T> = Omit<SheetAdjustment, 'value' | 'parsed'> & {
	parsed: T;
	value?: never;
};

export class SheetAdjuster {
	infoAdjuster: SheetInfoAdjuster;
	infoListAdjuster: SheetInfoListAdjuster;
	intPropertyAdjuster: SheetIntegerAdjuster;
	baseCounterAdjuster: SheetBaseCounterAdjuster;
	statAdjuster: SheetStatAdjuster;
	weaknessResistanceAdjuster: SheetWeaknessResistanceAdjuster;
	extraSkillAdjuster: SheetAdditionalSkillAdjuster;
	attackAdjuster: SheetAttackAdjuster;

	constructor(protected sheet: Sheet) {
		this.infoAdjuster = new SheetInfoAdjuster(sheet.info);
		this.infoListAdjuster = new SheetInfoListAdjuster(sheet.infoLists);
		this.intPropertyAdjuster = new SheetIntegerAdjuster(sheet.intProperties);
		this.baseCounterAdjuster = new SheetBaseCounterAdjuster(sheet.baseCounters);
		this.statAdjuster = new SheetStatAdjuster(sheet.stats);
		this.weaknessResistanceAdjuster = new SheetWeaknessResistanceAdjuster(
			sheet.weaknessesResistances
		);
		this.extraSkillAdjuster = new SheetAdditionalSkillAdjuster(sheet.additionalSkills);
		this.attackAdjuster = new SheetAttackAdjuster(sheet.attacks);
	}
	public static isAdjustableProperty(propName: string) {
		return propName in SheetProperties.adjustableAliases;
	}

	public static standardizeProperty(propertyName: string) {
		const lowerTrimmedProperty = propertyName.toLowerCase().trim().replaceAll(/_|-/g, '');

		// if any property regex matches, then its valid
		if (_.some(SheetProperties.regexes, regex => regex.test(propertyName))) return propertyName;
		if (_.some(SheetProperties.regexes, regex => regex.test(lowerTrimmedProperty)))
			return lowerTrimmedProperty;

		const withoutSpaces = lowerTrimmedProperty.replaceAll(' ', '');

		// if any alias matches without spaces, then its valid
		const sheetProperty = SheetProperties.adjustableAliases[withoutSpaces];
		if (sheetProperty) {
			return sheetProperty;
		}
		// we're not validating yet, so still return the string
		return propertyName.trim();
	}
	static validateSheetProperty(property: string): boolean {
		// basic sheet property
		const standardizedProperty = SheetAdjuster.standardizeProperty(property);
		if (standardizedProperty in SheetProperties.adjustableProperties) return true;
		// property groups
		if (SheetProperties.isPropertyGroup(standardizedProperty)) return true;
		// regexes
		if (_.some(SheetProperties.regexes, regex => regex.test(property))) {
			return true;
		}

		return false;
	}

	public adjust(adjustment: SheetAdjustment) {
		switch (adjustment.propertyType) {
			case AdjustablePropertyEnum.info:
				this.infoAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.infoList:
				this.infoListAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.intProperty:
				this.intPropertyAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.baseCounter:
				this.baseCounterAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.stat:
				this.statAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.weaknessResistance:
				this.weaknessResistanceAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.extraSkill:
				this.extraSkillAdjuster.adjust(adjustment);
				break;
			case AdjustablePropertyEnum.attack:
				this.attackAdjuster.adjust(adjustment);
				break;
			default:
				throw new KoboldError(
					`Property ${adjustment.property} is not a valid sheet property`
				);
		}
	}

	public static getPropertyType(property: string): AdjustablePropertyEnum {
		// basic sheet property
		const standardizedProperty = SheetAdjuster.standardizeProperty(property);
		if (SheetInfoProperties.aliases[standardizedProperty]) return AdjustablePropertyEnum.info;
		else if (SheetInfoListProperties.aliases[standardizedProperty])
			return AdjustablePropertyEnum.infoList;
		else if (SheetIntegerProperties.aliases[standardizedProperty])
			return AdjustablePropertyEnum.intProperty;
		else if (SheetBaseCounterProperties.aliases[standardizedProperty])
			return AdjustablePropertyEnum.baseCounter;
		else if (SheetStatProperties.aliases[standardizedProperty])
			return AdjustablePropertyEnum.stat;

		// regexes
		if (property.match(SheetWeaknessResistanceProperties.propertyNameRegex))
			return AdjustablePropertyEnum.weaknessResistance;
		else if (property.match(SheetAdditionalSkillProperties.propertyNameRegex))
			return AdjustablePropertyEnum.extraSkill;
		else if (property.match(SheetAttackProperties.propertyNameRegex))
			return AdjustablePropertyEnum.attack;
		return AdjustablePropertyEnum.none;
	}

	/**
	 * @param standardizedProperty A property that has been returned from SheetAdjuster.standardizeProperty()
	 * @param adjustmentString The adjustment string to validate
	 * @returns
	 */
	public static validateSheetPropertyValue(
		standardizedProperty: string,
		adjustmentString: string
	): boolean {
		// TODO
		if (standardizedProperty in SheetProperties.aliases) {
			return SheetInfoAdjuster.validateAdjustment(adjustmentString);
		}
		return false;
	}
}

export abstract class SheetPropertyGroupAdjuster<T> {
	constructor() {}
	public abstract adjust(adjustment: SheetAdjustment): void;
}

// Sheet Info Properties

export type SheetInfoAdjustment = ParsedSheetAdjustment<string>;

export class SheetInfoAdjuster implements SheetPropertyGroupAdjuster<SheetInfo> {
	constructor(protected sheetInfo: SheetInfo) {}
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as keyof SheetInfo;
		const sheetInfoAdjustment = SheetInfoAdjuster.deserializeAdjustment(adjustment);
		if (!sheetInfoAdjustment) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		const currentValue = this.sheetInfo[prop] ?? '';
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				this.sheetInfo[prop] = currentValue + sheetInfoAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['=']:
				this.sheetInfo[prop] = sheetInfoAdjustment.parsed;
				break;
		}
	}
	public static validateAdjustment(stringAdjustment: string): boolean {
		return _.isString(stringAdjustment);
	}

	public static serializeAdjustment(adjustment: SheetInfoAdjustment): SheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed };
	}
	public static deserializeAdjustment(adjustment: SheetAdjustment): SheetInfoAdjustment | null {
		return { ..._.omit(adjustment, 'value'), parsed: adjustment.value };
	}
}

// Sheet InfoList Properties

export type SheetInfoListAdjustment = ParsedSheetAdjustment<string[]>;
export class SheetInfoListAdjuster implements SheetPropertyGroupAdjuster<SheetInfoLists> {
	constructor(protected sheetInfoLists: SheetInfoLists) {}
	public isSheetInfoListsProperty(propName: string): propName is SheetInfoListKeys {
		return propName in this.sheetInfoLists;
	}
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as keyof SheetInfoLists;
		const sheetInfoListAdjustment = SheetInfoListAdjuster.deserializeAdjustment(adjustment);
		if (!sheetInfoListAdjustment) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		const splitValues = sheetInfoListAdjustment.parsed;
		switch (sheetInfoListAdjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				this.sheetInfoLists[prop].push(...splitValues);
				break;
			case SheetAdjustmentOperationEnum['-']:
				_.remove(this.sheetInfoLists[prop], value => splitValues.includes(value));
				break;
			case SheetAdjustmentOperationEnum['=']:
				this.sheetInfoLists[prop] = splitValues;
				break;
		}
	}
	public static validateAdjustment(stringAdjustment: string): boolean {
		return stringAdjustment.split(',').every(value => _.isString(value.trim()));
	}

	public static serializeAdjustment(adjustment: SheetInfoListAdjustment): SheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed.join(', ') };
	}
	public static deserializeAdjustment(
		adjustment: SheetAdjustment
	): SheetInfoListAdjustment | null {
		return {
			..._.omit(adjustment, 'value'),
			parsed: adjustment.value.split(',').map(value => value.trim()),
		};
	}
}

export type SheetIntegerAdjustment = ParsedSheetAdjustment<number>;
export class SheetIntegerAdjuster implements SheetPropertyGroupAdjuster<SheetIntegers> {
	constructor(protected sheetIntegerProperties: SheetIntegers) {}

	public static serializeAdjustment = function (
		adjustment: SheetIntegerAdjustment
	): SheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed.toString() };
	};
	public static deserializeAdjustment = function (
		adjustment: SheetAdjustment
	): SheetIntegerAdjustment | null {
		return {
			..._.omit(adjustment, 'value'),
			parsed: adjustment.value === '' ? 0 : parseInt(adjustment.value),
		};
	};
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as keyof SheetIntegers;
		const sheetIntegerAdjustment = SheetIntegerAdjuster.deserializeAdjustment(adjustment);
		if (!sheetIntegerAdjustment || isNaN(sheetIntegerAdjustment.parsed)) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		const currentValue = this.sheetIntegerProperties[prop] ?? 0;
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				this.sheetIntegerProperties[prop] = currentValue + sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['-']:
				this.sheetIntegerProperties[prop] = currentValue - sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['=']:
				this.sheetIntegerProperties[prop] = sheetIntegerAdjustment.parsed;
				break;
		}
	}
}

export type SheetBaseCounterAdjustment = ParsedSheetAdjustment<number>;
export class SheetBaseCounterAdjuster implements SheetPropertyGroupAdjuster<SheetBaseCounters> {
	constructor(protected sheetBaseCounterProperties: SheetBaseCounters) {}
	public static serializeAdjustment = SheetIntegerAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetIntegerAdjuster.deserializeAdjustment;
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as SheetBaseCounterKeys;
		const sheetIntegerAdjustment = SheetIntegerAdjuster.deserializeAdjustment(adjustment);
		if (
			!sheetIntegerAdjustment ||
			isNaN(sheetIntegerAdjustment.parsed) ||
			!(prop in this.sheetBaseCounterProperties)
		) {
			console.warn('something went wrong parsing the adjustment', adjustment);
			return;
		}
		const currentValue = this.sheetBaseCounterProperties[prop].max ?? 0;
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				this.sheetBaseCounterProperties[prop].max =
					currentValue + sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['-']:
				this.sheetBaseCounterProperties[prop].max =
					currentValue - sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['=']:
				this.sheetBaseCounterProperties[prop].max = sheetIntegerAdjustment.parsed;
				break;
		}
	}
}

export type SheetStatAdjustment = ParsedSheetAdjustment<
	| { subKey: StatSubGroupEnum.ability; value: AbilityEnum | '' }
	| { subKey: Exclude<StatSubGroupEnum, StatSubGroupEnum.ability>; value: number }
>;

export class SheetStatAdjuster implements SheetPropertyGroupAdjuster<SheetStats> {
	constructor(protected sheetStatProperties: SheetStats) {}
	public static serializeAdjustment(adjustment: SheetStatAdjustment): SheetAdjustment {
		return {
			..._.omit(adjustment, 'parsed'),
			propertyType: AdjustablePropertyEnum.stat,
			value: adjustment.parsed.value.toString(),
		};
	}

	public static deserializeAdjustment(adjustment: SheetAdjustment): SheetStatAdjustment | null {
		const nonAliasedProp =
			SheetStatProperties.aliases[SheetProperties.standardizePropKey(adjustment.property)];
		if (!nonAliasedProp)
			throw new KoboldError(`Property ${adjustment.property} is not a valid stat property`);
		const property = SheetStatProperties.properties[nonAliasedProp];

		let parsedValue: string | number;
		if (property.subKey === StatSubGroupEnum.ability) {
			if (adjustment.value !== '' && !(adjustment.value in AbilityEnum)) {
				return null;
			}
			// string property
			return {
				..._.omit(adjustment, 'value'),
				parsed: {
					value: (adjustment.value as AbilityEnum) || '',
					subKey: property.subKey,
				},
			};
		} else {
			parsedValue = adjustment.value === '' ? 0 : parseInt(adjustment.value);
			if (isNaN(parsedValue)) {
				throw new KoboldError(
					`Property ${adjustment.property}'s value ${adjustment.value} is not a valid number`
				);
			}
			return {
				..._.omit(adjustment, 'value'),
				parsed: {
					value: parsedValue,
					subKey: property.subKey,
				},
			};
		}
	}
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as SheetStatKeys;
		const sheetStatAdjustment = SheetStatAdjuster.deserializeAdjustment(adjustment);
		if (!sheetStatAdjustment) {
			console.warn('something went wrong parsing stat adjustment', adjustment);
			return;
		}
		// typescript doesn't know how to discriminate between the two types of subKey
		// so we restore the base type and then if/else to delineate
		const parsedAdjustment = sheetStatAdjustment.parsed;
		if (parsedAdjustment.subKey === StatSubGroupEnum.ability) {
			const interpretedSubKey = parsedAdjustment.subKey;
			const currentValue = this.sheetStatProperties[prop][interpretedSubKey] ?? 0;
			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['-']:
					if (currentValue === this.sheetStatProperties[prop][parsedAdjustment.subKey]) {
						this.sheetStatProperties[prop][parsedAdjustment.subKey] = null;
					}
					break;
				case SheetAdjustmentOperationEnum['=']:
					this.sheetStatProperties[prop][parsedAdjustment.subKey] =
						parsedAdjustment.value === '' ? null : parsedAdjustment.value;
					break;
			}
		} else {
			const currentValue = this.sheetStatProperties[prop][parsedAdjustment.subKey] ?? 0;
			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['+']:
					this.sheetStatProperties[prop][parsedAdjustment.subKey] =
						currentValue + parsedAdjustment.value;
					break;
				case SheetAdjustmentOperationEnum['-']:
					this.sheetStatProperties[prop][parsedAdjustment.subKey] =
						currentValue - parsedAdjustment.value;
					break;
				case SheetAdjustmentOperationEnum['=']:
					this.sheetStatProperties[prop][parsedAdjustment.subKey] =
						parsedAdjustment.value;
					break;
			}
		}
	}
}

export type SheetAttackAdjustment = ParsedSheetAdjustment<SheetAttack>;

const separatorRegex = /[\|&]/gi;
const innerSeparator = ',';
const toHitRegex = /(?:to hit|tohit|hit|attack|atk)[\W:]([^\|&]+)/gi;
const damageRegex = /(?:damage|dmg)[\W:]([^\|&]+)/gi;
const damageTypeRegex = / ((?:[ A-Za-z_-])+)\W*$/gi;
const rangeRegex = /(?:range)[\W:]([^\|&]+)/gi;
const traitsRegex = /(?:traits?)[\W:]([^\|&]+)/gi;
const notesRegex = /(?:notes?)[\W:]([^\|&]+)/gi;

export class SheetAttackAdjuster implements SheetPropertyGroupAdjuster<Sheet['attacks']> {
	constructor(protected sheetAttacks: Sheet['attacks']) {}
	public static serializeAdjustment(adjustment: SheetAttackAdjustment): SheetAdjustment {
		const toHit = adjustment.parsed.toHit ? `to hit: ${adjustment.parsed.toHit}` : '';
		const damage = adjustment.parsed.damage
			? `damage: ${adjustment.parsed.damage
					.map(damage => `${damage.dice} ${damage.type}`)
					.join(innerSeparator)}`
			: '';
		const range = adjustment.parsed.range ? `range: ${adjustment.parsed.range}` : '';
		const traits = adjustment.parsed.traits
			? `traits: ${adjustment.parsed.traits.join(innerSeparator)}`
			: '';
		const notes = adjustment.parsed.notes ? `notes: ${adjustment.parsed.notes}` : '';
		const newValue = [toHit, damage, range, traits, notes].filter(_.identity).join('; ');
		let newAdjustment: SheetAdjustment = {
			..._.omit(adjustment, 'parsed'),
			value: newValue,
		};
		return newAdjustment;
	}
	public static deserializeAdjustment(adjustment: SheetAdjustment): SheetAttackAdjustment | null {
		const splitValue = adjustment.value.split(/[|;]/gi);
		let toHitClause: number = 0;
		let damageValues: Damage[] = [];
		let range = '';
		let traits: string[] = [];
		let notes = '';

		let toHitMatch = toHitRegex.exec(adjustment.value);
		if (toHitMatch) {
			toHitClause = parseInt(toHitMatch[1]);
		}
		let damageMatch = damageRegex.exec(adjustment.value);
		if (damageMatch) {
			damageValues = damageMatch[1]
				.split(innerSeparator)
				.map(damage => damage.trim())
				.map(damage => {
					const typeMatch = damageTypeRegex.exec(damage);
					const type = typeMatch ? typeMatch[1].trim() : '';
					const dice = damage.replaceAll(damageTypeRegex, '').trim();
					return { dice, type };
				});
		}
		let rangeMatch = rangeRegex.exec(adjustment.value);
		if (rangeMatch) {
			range = rangeMatch[1].trim();
		}
		let traitsMatch = traitsRegex.exec(adjustment.value);
		if (traitsMatch) {
			traits = traitsMatch[1].split(innerSeparator).map(trait => trait.trim());
		}
		let notesMatch = notesRegex.exec(adjustment.value);
		if (notesMatch) {
			notes = notesMatch[1].trim();
		}

		for (let i = 0; i < splitValue.length; i++) {}
		return {
			..._.omit(adjustment, 'value'),
			parsed: {
				name: adjustment.property.split(' ').slice(0, -1).join(' '), // remove the attack keyword
				toHit: toHitClause,
				damage: damageValues,
				range,
				traits,
				notes,
			},
		};
	}
	public adjust(adjustment: SheetAdjustment): void {
		const sheetAttackAdjustment = SheetAttackAdjuster.deserializeAdjustment(adjustment);
		if (!sheetAttackAdjustment) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		const currentValue = this.sheetAttacks;

		// filter out existing attacks with this name no matter what
		// on +/=, overwrite the new attack which requires removal anyway
		_.remove(this.sheetAttacks, attack => attack.name === sheetAttackAdjustment.parsed.name);
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
			case SheetAdjustmentOperationEnum['=']:
				this.sheetAttacks.push(sheetAttackAdjustment.parsed);
				break;
		}
	}
}

export class SheetAdditionalSkillAdjuster
	implements SheetPropertyGroupAdjuster<Sheet['additionalSkills']>
{
	constructor(protected sheetAdditionalSkills: Sheet['additionalSkills']) {}
	public static serializeAdjustment = SheetStatAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetStatAdjuster.deserializeAdjustment;
	public adjust(adjustment: SheetAdjustment): void {
		const sheetStatAdjustment = SheetStatAdjuster.deserializeAdjustment(adjustment);
		if (!sheetStatAdjustment) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		// filter out existing additional skills with this name no matter what
		// on +/=, overwrite the new additional skill which requires removal anyway
		const targetStat: Sheet['additionalSkills'][number] = this.sheetAdditionalSkills.find(
			skill => skill.name === sheetStatAdjustment.property
		) ?? {
			name: sheetStatAdjustment.property,
			dc: 10,
			proficiency: 0,
			bonus: 0,
			ability: null,
		};

		if (sheetStatAdjustment.parsed.subKey === StatSubGroupEnum.ability) {
			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['-']:
					if (targetStat.ability === sheetStatAdjustment.parsed.value) {
						targetStat.ability === null;
					}
					break;
				case SheetAdjustmentOperationEnum['=']:
					targetStat.ability = sheetStatAdjustment.parsed.value || null;
					break;
			}
			return;
		} else {
			const currentValue = targetStat[sheetStatAdjustment.parsed.subKey] ?? 0;
			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['+']:
					targetStat[sheetStatAdjustment.parsed.subKey] =
						currentValue + sheetStatAdjustment.parsed.value;
					break;
				case SheetAdjustmentOperationEnum['-']:
					targetStat[sheetStatAdjustment.parsed.subKey] =
						currentValue - sheetStatAdjustment.parsed.value;
					break;
				case SheetAdjustmentOperationEnum['=']:
					targetStat[sheetStatAdjustment.parsed.subKey] =
						sheetStatAdjustment.parsed.value;
					break;
			}
		}

		_.remove(this.sheetAdditionalSkills, skill => skill.name === targetStat.name);
		this.sheetAdditionalSkills.push(targetStat);
	}
}

export class SheetWeaknessResistanceAdjuster
	implements SheetPropertyGroupAdjuster<Sheet['weaknessesResistances']>
{
	constructor(protected sheetWeaknessResistance: Sheet['weaknessesResistances']) {}
	public static serializeAdjustment = SheetIntegerAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetIntegerAdjuster.deserializeAdjustment;
	public adjust(adjustment: SheetAdjustment): void {
		const sheetIntegerAdjustment = SheetIntegerAdjuster.deserializeAdjustment(adjustment);
		const weaknessResistanceName = SheetWeaknessResistanceProperties.propertyNameRegex
			.exec(adjustment.property)?.[1]
			?.trim()
			?.toLowerCase();
		if (!sheetIntegerAdjustment || !weaknessResistanceName) {
			console.warn('something went wrong parsing adjustment', adjustment);
			return;
		}
		const isWeakness = SheetWeaknessResistanceProperties.isWeakness(adjustment.property);
		const targetList = isWeakness
			? this.sheetWeaknessResistance.weaknesses
			: this.sheetWeaknessResistance.resistances;

		const currentValue = targetList.find(entry => entry.type === weaknessResistanceName) ?? {
			type: weaknessResistanceName,
			amount: 0,
		};
		_.remove(targetList, entry => entry.type === weaknessResistanceName);
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				currentValue.amount += sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['-']:
				currentValue.amount -= sheetIntegerAdjustment.parsed;
				break;
			case SheetAdjustmentOperationEnum['=']:
				currentValue.amount = sheetIntegerAdjustment.parsed;
				break;
		}
		targetList.push(currentValue);
	}
}

// Type check object to make sure that all adjusters are accounted for
const allBuckets: {
	[k in Exclude<AdjustablePropertyEnum, ''>]: Object;
} = {
	info: SheetInfoAdjuster,
	infoList: SheetInfoListAdjuster,
	intProperty: SheetIntegerAdjuster,
	baseCounter: SheetBaseCounterAdjuster,
	stat: SheetStatAdjuster,
	extraSkill: SheetAdditionalSkillAdjuster,
	weaknessResistance: SheetWeaknessResistanceAdjuster,
	attack: SheetAttackAdjuster,
};
