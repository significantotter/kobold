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
} from '../../services/kobold/index.js';
import { KoboldError } from '../KoboldError.js';
import {
	SheetAdditionalSkillProperties,
	SheetAttackProperties,
	SheetBaseCounterProperties,
	SheetInfoListProperties,
	SheetInfoProperties,
	SheetIntegerProperties,
	SheetProperties,
	SheetStatProperties,
	SheetWeaknessResistanceProperties,
} from './sheet-properties.js';

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

	static validateSheetProperty(property: string): boolean {
		// basic sheet property
		const standardizedProperty = SheetProperties.standardizeProperty(property);
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
		const lowerStandardizedProperty =
			SheetProperties.standardizeProperty(property).toLowerCase();
		if (SheetInfoProperties.aliases[lowerStandardizedProperty])
			return AdjustablePropertyEnum.info;
		else if (SheetInfoListProperties.aliases[lowerStandardizedProperty])
			return AdjustablePropertyEnum.infoList;
		else if (SheetIntegerProperties.aliases[lowerStandardizedProperty])
			return AdjustablePropertyEnum.intProperty;
		else if (SheetBaseCounterProperties.aliases[lowerStandardizedProperty])
			return AdjustablePropertyEnum.baseCounter;
		else if (SheetStatProperties.aliases[lowerStandardizedProperty])
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
	 * @param standardizedProperty A property that has been returned from SheetProperties.standardizeProperty()
	 * @param adjustmentString The adjustment string to validate
	 * @returns
	 */
	public static validateSheetAdjustment(sheetAdjustment: SheetAdjustment): boolean {
		if (sheetAdjustment.propertyType === AdjustablePropertyEnum.none) {
			return false;
		}
		switch (sheetAdjustment.propertyType) {
			case AdjustablePropertyEnum.info:
				const parsedInfo = SheetInfoAdjuster.deserializeAdjustment(sheetAdjustment);
				if (!parsedInfo || SheetInfoAdjuster.discardAdjustment(sheetAdjustment)) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.infoList:
				const parsedInfoList = SheetInfoListAdjuster.deserializeAdjustment(sheetAdjustment);
				if (!parsedInfoList || SheetInfoListAdjuster.discardAdjustment(sheetAdjustment)) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.intProperty:
				const parsedInt = SheetIntegerAdjuster.deserializeAdjustment(sheetAdjustment);
				if (!parsedInt || SheetIntegerAdjuster.discardAdjustment(sheetAdjustment)) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.baseCounter:
				const parsedBaseCounter =
					SheetBaseCounterAdjuster.deserializeAdjustment(sheetAdjustment);
				if (
					!parsedBaseCounter ||
					SheetBaseCounterAdjuster.discardAdjustment(sheetAdjustment)
				) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.stat:
				const parsedStat = SheetStatAdjuster.deserializeAdjustment(sheetAdjustment);
				if (!parsedStat || SheetStatAdjuster.discardAdjustment(sheetAdjustment)) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.weaknessResistance:
				const parsedWeakRes =
					SheetWeaknessResistanceAdjuster.deserializeAdjustment(sheetAdjustment);
				if (
					!parsedWeakRes ||
					SheetWeaknessResistanceAdjuster.discardAdjustment(sheetAdjustment)
				) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.extraSkill:
				const parsedSkill =
					SheetAdditionalSkillAdjuster.deserializeAdjustment(sheetAdjustment);
				if (
					!parsedSkill ||
					SheetAdditionalSkillAdjuster.discardAdjustment(sheetAdjustment)
				) {
					return false;
				}
				break;
			case AdjustablePropertyEnum.attack:
				const parsedAtk = SheetAttackAdjuster.deserializeAdjustment(sheetAdjustment);
				if (!parsedAtk || SheetAttackAdjuster.discardAdjustment(sheetAdjustment)) {
					return false;
				}
				break;
			default:
				throw new KoboldError(
					`Property ${sheetAdjustment.property} is not a valid sheet property`
				);
		}
		return true;
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
		if (!sheetInfoAdjustment || !(prop in this.sheetInfo)) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
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
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return adjustment.operation === '+' || adjustment.operation === '-';
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
		const prop = adjustment.property as SheetInfoListKeys;
		const sheetInfoListAdjustment = SheetInfoListAdjuster.deserializeAdjustment(adjustment);
		if (!sheetInfoListAdjustment || !(prop in this.sheetInfoLists)) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
		}
		const splitValues = sheetInfoListAdjustment.parsed;
		switch (sheetInfoListAdjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
				this.sheetInfoLists[prop].push(...splitValues);
				break;
			case SheetAdjustmentOperationEnum['-']:
				_.remove(this.sheetInfoLists[prop], (value: string) => splitValues.includes(value));
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
			parsed: adjustment.value.split(',').map((value: string) => value.trim()),
		};
	}
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
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
		const value = adjustment.value === '' ? 0 : parseInt(adjustment.value);
		if (isNaN(value)) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
		}
		return {
			..._.omit(adjustment, 'value'),
			parsed: value,
		};
	};
	public adjust(adjustment: SheetAdjustment): void {
		const prop = adjustment.property as keyof SheetIntegers;
		const sheetIntegerAdjustment = SheetIntegerAdjuster.deserializeAdjustment(adjustment);
		if (!sheetIntegerAdjustment || isNaN(sheetIntegerAdjustment.parsed)) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
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
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return (
			(adjustment.value === '' || parseInt(adjustment.value) === 0) &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
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
		if (!sheetIntegerAdjustment || !(prop in this.sheetBaseCounterProperties)) {
			throw new KoboldError(
				'something went wrong parsing the adjustment',
				JSON.stringify(adjustment)
			);
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
	public static discardAdjustment = SheetIntegerAdjuster.discardAdjustment;
}

export type SheetStatAdjustment = ParsedSheetAdjustment<
	| { baseKey: SheetStatKeys; subKey: StatSubGroupEnum.ability; value: AbilityEnum | '' }
	| {
			baseKey: SheetStatKeys;
			subKey: Exclude<StatSubGroupEnum, StatSubGroupEnum.ability>;
			value: number;
	  }
>;

export class SheetStatAdjuster implements SheetPropertyGroupAdjuster<SheetStats> {
	constructor(protected sheetStatProperties: SheetStats) {}
	public static serializeAdjustment(
		adjustment: SheetStatAdjustment | SheetExtraSkillAdjustment
	): SheetAdjustment {
		return {
			..._.omit(adjustment, 'parsed'),
			value: adjustment.parsed.value.toString(),
		};
	}

	public static deserializeAdjustment(adjustment: SheetAdjustment): SheetStatAdjustment | null {
		const nonAliasedProp =
			SheetStatProperties.aliases[SheetProperties.standardizePropKey(adjustment.property)];
		if (!nonAliasedProp) {
			throw new KoboldError(`Property ${adjustment.property} is not a valid stat property`);
		}
		const property = SheetStatProperties.properties[nonAliasedProp];

		let parsedValue: string | number;
		if (property.subKey === StatSubGroupEnum.ability) {
			// Ability property
			if (!SheetProperties.abilityFromAlias[adjustment.value] && adjustment.value !== '') {
				throw new KoboldError(
					`Property ${adjustment.property}'s value ${adjustment.value} is not a valid number`
				);
			}
			return {
				..._.omit(adjustment, 'value'),
				parsed: {
					value: SheetProperties.abilityFromAlias[adjustment.value] ?? '',
					baseKey: property.baseKey,
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
					baseKey: property.baseKey,
					subKey: property.subKey,
				},
			};
		}
	}
	public adjust(adjustment: SheetAdjustment): void {
		const sheetStatAdjustment = SheetStatAdjuster.deserializeAdjustment(adjustment);
		if (!sheetStatAdjustment) {
			throw new KoboldError(
				'something went wrong parsing stat adjustment',
				JSON.stringify(adjustment)
			);
		}
		const parsedAdjustment = sheetStatAdjustment.parsed;
		const baseKey = parsedAdjustment.baseKey;
		// typescript doesn't know how to discriminate between the two types of subKey
		// so we restore the base type and then if/else to delineate
		if (parsedAdjustment.subKey === StatSubGroupEnum.ability) {
			const interpretedSubKey = parsedAdjustment.subKey;
			const currentValue = this.sheetStatProperties[baseKey][interpretedSubKey] ?? 0;
			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['-']:
					if (
						currentValue === this.sheetStatProperties[baseKey][parsedAdjustment.subKey]
					) {
						this.sheetStatProperties[baseKey][parsedAdjustment.subKey] = null;
					}
					break;
				case SheetAdjustmentOperationEnum['=']:
					this.sheetStatProperties[baseKey][parsedAdjustment.subKey] =
						parsedAdjustment.value === '' ? null : parsedAdjustment.value;
					break;
			}
		} else {
			let currentValue = this.sheetStatProperties[baseKey][parsedAdjustment.subKey];
			if (currentValue === null) {
				if (parsedAdjustment.subKey === StatSubGroupEnum.dc) currentValue = 10;
				else currentValue = 0;
			}

			switch (adjustment.operation) {
				case SheetAdjustmentOperationEnum['+']:
					this.sheetStatProperties[baseKey][parsedAdjustment.subKey] =
						currentValue + parsedAdjustment.value;
					break;
				case SheetAdjustmentOperationEnum['-']:
					this.sheetStatProperties[baseKey][parsedAdjustment.subKey] =
						currentValue - parsedAdjustment.value;
					break;
				case SheetAdjustmentOperationEnum['=']:
					this.sheetStatProperties[baseKey][parsedAdjustment.subKey] =
						parsedAdjustment.value;
					break;
			}
		}
	}
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
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
const effectsRegex = /(?:effects?)[\W:]([^\|&]+)/gi;
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
		const effects = adjustment.parsed.effects
			? `effects: ${adjustment.parsed.effects.join(innerSeparator)}`
			: '';
		const notes = adjustment.parsed.notes ? `notes: ${adjustment.parsed.notes}` : '';
		const newValue = [toHit, damage, range, traits, effects, notes]
			.filter(_.identity)
			.join('; ');
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
		let effects: string[] = [];
		let notes = '';

		for (const value of splitValue) {
			let toHitMatch = toHitRegex.exec(value);
			if (toHitMatch && toHitMatch[1].trim()) {
				toHitClause = parseInt(toHitMatch[1].trim());
			}
			let damageMatch = damageRegex.exec(value);
			if (damageMatch && damageMatch[1].trim()) {
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
			let rangeMatch = rangeRegex.exec(value);
			if (rangeMatch && rangeMatch[1].trim()) {
				range = rangeMatch[1].trim();
			}
			let traitsMatch = traitsRegex.exec(value);
			if (traitsMatch && traitsMatch[1].trim()) {
				traits = traitsMatch[1].split(innerSeparator).map(trait => trait.trim());
			}
			let effectsMatch = effectsRegex.exec(value);
			if (effectsMatch && effectsMatch[1].trim()) {
				effects = effectsMatch[1].split(innerSeparator).map(trait => trait.trim());
			}
			let notesMatch = notesRegex.exec(value);
			if (notesMatch && notesMatch[1].trim()) {
				notes = notesMatch[1].trim();
			}
		}

		if (
			!toHitClause &&
			!damageValues.length &&
			!range &&
			!traits.length &&
			!effects.length &&
			!notes &&
			adjustment.operation !== SheetAdjustmentOperationEnum['-']
		) {
			throw new KoboldError(
				"Yip! I couldn't understand the attack adjustment " + JSON.stringify(adjustment)
			);
		}

		for (let i = 0; i < splitValue.length; i++) {}
		return {
			..._.omit(adjustment, 'value'),
			parsed: {
				name: adjustment.property.split(' ').slice(0, -1).join(' '), // remove the attack keyword
				toHit: toHitClause || null,
				damage: damageValues,
				effects,
				range: range || null,
				traits,
				notes: notes || null,
			},
		};
	}
	public adjust(adjustment: SheetAdjustment): void {
		const sheetAttackAdjustment = SheetAttackAdjuster.deserializeAdjustment(adjustment);
		if (!sheetAttackAdjustment) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
		}

		// filter out existing attacks with this name no matter what
		// on +/=, overwrite the new attack which requires removal anyway
		_.remove(
			this.sheetAttacks,
			attack =>
				attack.name.trim().toLowerCase() ===
				sheetAttackAdjustment.parsed.name.trim().toLowerCase()
		);
		switch (adjustment.operation) {
			case SheetAdjustmentOperationEnum['+']:
			case SheetAdjustmentOperationEnum['=']:
				this.sheetAttacks.push(sheetAttackAdjustment.parsed);
				break;
		}
	}
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return adjustment.operation === '+' || adjustment.operation === '-';
	}
}

export type SheetExtraSkillAdjustment = ParsedSheetAdjustment<
	| { baseKey: string; subKey: StatSubGroupEnum.ability; value: AbilityEnum | '' }
	| {
			baseKey: string;
			subKey: Exclude<StatSubGroupEnum, StatSubGroupEnum.ability>;
			value: number;
	  }
>;

export class SheetAdditionalSkillAdjuster
	implements SheetPropertyGroupAdjuster<Sheet['additionalSkills']>
{
	constructor(protected sheetAdditionalSkills: Sheet['additionalSkills']) {}
	public static serializeAdjustment = SheetStatAdjuster.serializeAdjustment;
	public static deserializeAdjustment(
		adjustment: SheetAdjustment
	): SheetExtraSkillAdjustment | null {
		const propertyMatch = SheetAdditionalSkillProperties.propertyNameRegex.exec(
			adjustment.property
		);
		if (!propertyMatch) {
			throw new KoboldError(
				`Property ${adjustment.property} is not a valid additional skill property`
			);
		}
		const propertyName = SheetProperties.standardizeCustomPropName(propertyMatch[1]);
		let subKey = StatSubGroupEnum.bonus;
		if (propertyMatch[2]) {
			const subProperty = propertyMatch[2].trim().toLowerCase();
			if (subProperty.startsWith('prof')) {
				subKey = StatSubGroupEnum.proficiency;
			} else if (subProperty.startsWith('dc')) {
				subKey = StatSubGroupEnum.dc;
			} else if (subProperty.startsWith('ability')) {
				subKey = StatSubGroupEnum.ability;
			}
		}

		let parsedValue: string | number;
		if (subKey === StatSubGroupEnum.ability) {
			// Ability property
			if (!SheetProperties.abilityFromAlias[adjustment.value] && adjustment.value !== '') {
				throw new KoboldError(
					`Property ${adjustment.property}'s value ${adjustment.value} is not a valid number`
				);
			}
			return {
				..._.omit(adjustment, 'value'),
				parsed: {
					value: SheetProperties.abilityFromAlias[adjustment.value] ?? '',
					baseKey: propertyName,
					subKey: subKey,
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
					baseKey: propertyName,
					subKey: subKey,
				},
			};
		}
	}
	public adjust(adjustment: SheetAdjustment): void {
		const sheetStatAdjustment = SheetAdditionalSkillAdjuster.deserializeAdjustment(adjustment);
		if (!sheetStatAdjustment) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
		}
		// filter out existing additional skills with this name no matter what
		// on +/=, overwrite the new additional skill which requires removal anyway
		const targetStat: Sheet['additionalSkills'][number] = this.sheetAdditionalSkills.find(
			skill =>
				SheetProperties.standardizeCustomPropName(skill.name) ===
				sheetStatAdjustment.parsed.baseKey
		) ?? {
			name: sheetStatAdjustment.parsed.baseKey,
			dc:
				sheetStatAdjustment.parsed.subKey === StatSubGroupEnum.bonus
					? 10 + sheetStatAdjustment.parsed.value
					: 10,
			proficiency: null,
			bonus:
				sheetStatAdjustment.parsed.subKey === StatSubGroupEnum.dc
					? sheetStatAdjustment.parsed.value - 10
					: 0,
			ability: AbilityEnum.intelligence,
			note: null,
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
			let currentValue = targetStat[sheetStatAdjustment.parsed.subKey];
			if (currentValue === null) {
				if (sheetStatAdjustment.parsed.subKey === StatSubGroupEnum.dc) currentValue = 10;
				else currentValue = 0;
			}
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

		_.remove(
			this.sheetAdditionalSkills,
			skill => SheetProperties.standardizeCustomPropName(skill.name) === targetStat.name
		);
		this.sheetAdditionalSkills.push(targetStat);
	}
	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
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
		let weaknessResistanceName = SheetWeaknessResistanceProperties.propertyNameRegex
			.exec(adjustment.property)?.[1]
			?.trim()
			?.toLowerCase();
		if (!sheetIntegerAdjustment || !weaknessResistanceName) {
			throw new KoboldError(
				'something went wrong parsing adjustment',
				JSON.stringify(adjustment)
			);
		}
		weaknessResistanceName = SheetProperties.standardizeCustomPropName(weaknessResistanceName);

		const isWeakness = SheetWeaknessResistanceProperties.isWeakness(adjustment.property);
		const targetList = isWeakness
			? this.sheetWeaknessResistance.weaknesses
			: this.sheetWeaknessResistance.resistances;

		const currentValue = targetList.find(
			entry =>
				SheetProperties.standardizeCustomPropName(entry.type) === weaknessResistanceName
		) ?? {
			type: weaknessResistanceName,
			amount: 0,
		};
		_.remove(
			targetList,
			entry =>
				SheetProperties.standardizeCustomPropName(entry.type) === weaknessResistanceName
		);
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

	public static discardAdjustment(adjustment: SheetAdjustment): boolean {
		return (
			(adjustment.value === '' || parseInt(adjustment.value) === 0) &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
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
