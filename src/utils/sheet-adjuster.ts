import _ from 'lodash';
import {
	Damage,
	ProficiencyStat,
	Sheet,
	SheetAdjustment,
	SheetAttack,
	SheetInfo,
	SheetInfoKeys,
	SheetInfoListKeys,
	SheetInfoLists,
} from '../services/kobold/models/index.js';
import {
	SheetProperties,
	SheetInfoProperties,
	SheetInfoListProperties,
	SheetIntegerProperties,
	SheetBaseCounterProperties,
	SheetStatProperties,
	SheetWeaknessProperties,
	SheetResistanceProperties,
	SheetAdditionalSkillProperties,
	SheetAttackProperties,
} from './sheet-properties.js';
import {
	loreRegex,
	immunityRegex,
	resistanceRegex,
	weaknessRegex,
	languageRegex,
	senseRegex,
	attackRegex,
	sheetPropertyGroups,
} from './sheet-utils.js';

export type AdjustablePropertyEnum =
	| 'info'
	| 'infoList'
	| 'intProperty'
	| 'baseCounter'
	| 'weaknessResistance'
	| 'stat'
	| 'attack'
	| 'extraSkill'
	| null;

export type TypedSheetAdjustment = SheetAdjustment & {
	type: 'untyped' | 'status' | 'circumstance' | 'item';
	propertyType: AdjustablePropertyEnum;
	parsed?: never;
};

export type ParsedSheetAdjustment<T> = Omit<TypedSheetAdjustment, 'value' | 'parsed'> & {
	parsed: T;
	value?: never;
};

export class SheetAdjuster {
	infoAdjuster: SheetInfoAdjuster;
	constructor(protected sheet: Sheet) {
		this.infoAdjuster = new SheetInfoAdjuster(sheet.info);
	}
	public static isAdjustableProperty(propName: string) {
		return propName in SheetProperties.aliases;
	}

	public static standardizeProperty(propertyName: string) {
		const lowerTrimmedProperty = propertyName
			.toLowerCase()
			.trim()
			.replaceAll('_', '')
			.replaceAll('-', '');

		// if any property regex matches, then its valid
		if (_.some(SheetProperties.regexes, regex => regex.test(lowerTrimmedProperty)))
			return lowerTrimmedProperty;

		const withoutSpaces = lowerTrimmedProperty.replaceAll(' ', '');

		// if any alias matches without spaces, then its valid
		const sheetProperty = SheetProperties.aliases[withoutSpaces];
		if (sheetProperty) {
			return sheetProperty;
		}
		// we're not validating yet, so still return the string
		return propertyName.trim();
	}
	static validateSheetProperty(property: string): boolean {
		// basic sheet property
		const standardizedProperty = SheetAdjuster.standardizeProperty(property);
		if (standardizedProperty in SheetProperties.properties) return true;
		// property groups
		if (sheetPropertyGroups.includes(_.camelCase(property))) return true;
		// regexes
		if (
			property.match(loreRegex) ||
			property.match(immunityRegex) ||
			property.match(resistanceRegex) ||
			property.match(weaknessRegex) ||
			property.match(languageRegex) ||
			property.match(senseRegex) ||
			property.match(attackRegex)
		) {
			return true;
		}

		return false;
	}

	public adjust(adjustment: TypedSheetAdjustment) {
		const propertyInInfo = SheetInfoProperties.aliases[adjustment.property];
		if (propertyInInfo) {
			this.infoAdjuster.adjust(propertyInInfo, adjustment);
			return;
		}
	}

	public static getPropertyType(property: string): AdjustablePropertyEnum {
		// basic sheet property
		const standardizedProperty = SheetAdjuster.standardizeProperty(property);
		if (SheetInfoProperties.aliases[standardizedProperty]) return 'info';
		else if (SheetInfoListProperties.aliases[standardizedProperty]) return 'infoList';
		else if (SheetIntegerProperties.aliases[standardizedProperty]) return 'intProperty';
		else if (SheetBaseCounterProperties.aliases[standardizedProperty]) return 'baseCounter';
		else if (SheetStatProperties.aliases[standardizedProperty]) return 'stat';

		// regexes
		if (property.match(SheetWeaknessProperties.propertyNameRegex)) return 'weaknessResistance';
		else if (property.match(SheetResistanceProperties.propertyNameRegex))
			return 'weaknessResistance';
		else if (property.match(SheetAdditionalSkillProperties.propertyNameRegex))
			return 'extraSkill';
		else if (property.match(SheetAttackProperties.propertyNameRegex)) return 'attack';
		return null;
	}

	/**
	 * @param standardizedProperty A property that has been returned from SheetAdjuster.standardizeProperty()
	 * @param adjustmentString The adjustment string to validate
	 * @returns
	 */
	static validateSheetPropertyValue(
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
	public abstract adjust(k: keyof T, adjustment: TypedSheetAdjustment): void;
}

// Sheet Info Properties

export type SheetInfoAdjustment = ParsedSheetAdjustment<string>;

export class SheetInfoAdjuster implements SheetPropertyGroupAdjuster<SheetInfo> {
	constructor(protected sheetInfo: SheetInfo) {}
	public isSheetInfoProperty(propName: string): propName is SheetInfoKeys {
		return propName in this.sheetInfo;
	}
	public adjust(k: keyof SheetInfo, adjustment: TypedSheetAdjustment): void {
		const currentValue = this.sheetInfo[k] ?? '';
		switch (adjustment.operation) {
			case '+':
				this.sheetInfo[k] = currentValue + adjustment.value;
				break;
			case '=':
				this.sheetInfo[k] = adjustment.value;
				break;
		}
	}
	public static validateAdjustment(stringAdjustment: string): boolean {
		return _.isString(stringAdjustment);
	}
	public static validOperations = ['+', '='] as const;

	public static serializeAdjustment(adjustment: SheetInfoAdjustment): TypedSheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed };
	}
	public static deserializeAdjustment(adjustment: TypedSheetAdjustment): SheetInfoAdjustment {
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
	public adjust(k: keyof SheetInfoLists, adjustment: TypedSheetAdjustment): void {
		const splitValues = adjustment.value.split(',').map(value => value.trim());
		switch (adjustment.operation) {
			case '+':
				this.sheetInfoLists[k].push(...splitValues);
				break;
			case '-':
				this.sheetInfoLists[k].filter(value => !splitValues.includes(value));
				break;
			case '=':
				this.sheetInfoLists[k] = splitValues;
				break;
		}
	}
	public static validateAdjustment(stringAdjustment: string): boolean {
		return stringAdjustment.split(',').every(value => _.isString(value.trim()));
	}
	public static validOperations = ['+', '='] as const;

	public static serializeAdjustment(adjustment: SheetInfoListAdjustment): TypedSheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed.join(', ') };
	}
	public static deserializeAdjustment(adjustment: TypedSheetAdjustment): SheetInfoListAdjustment {
		return {
			..._.omit(adjustment, 'value'),
			parsed: adjustment.value.split(',').map(value => value.trim()),
		};
	}
}

export type SheetIntegerAdjustment = ParsedSheetAdjustment<number>;
export class SheetIntegerAdjuster {
	public static serializeAdjustment = function (
		adjustment: SheetIntegerAdjustment
	): TypedSheetAdjustment {
		return { ..._.omit(adjustment, 'parsed'), value: adjustment.parsed.toString() };
	};
	public static deserializeAdjustment = function (
		adjustment: TypedSheetAdjustment
	): SheetIntegerAdjustment {
		return {
			..._.omit(adjustment, 'value'),
			parsed: adjustment.value === '' ? 0 : parseInt(adjustment.value),
		};
	};
}

export type SheetBaseCounterAdjustment = ParsedSheetAdjustment<number>;
export class SheetBaseCounterAdjuster {
	public static serializeAdjustment = SheetIntegerAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetIntegerAdjuster.deserializeAdjustment;
}

export type SheetStatAdjustment = ParsedSheetAdjustment<Partial<ProficiencyStat>>;
const statPropTotalValueRegex = /(?:total|bonus)\W*:\W*([0-9]+)/gi;
const statPropProficiencyValueRegex = /(?:proficiency|prof)\W*:\W*([0-9]+)/gi;
const statPropTotalDCRegex = /(?:totalDC|DC)\W*:\W*([0-9]+)/gi;
const abilityPropRegex =
	/ability\W*:\W*(strength|str|dexterity|dex|constitution|con|intelligence|int|wisdom|wis|charisma|cha){1}/gi;

export class SheetStatAdjuster {
	public static serializeAdjustment(adjustment: SheetStatAdjustment): TypedSheetAdjustment {
		const total = adjustment.parsed.total ? `total:${adjustment.parsed.total}` : '';
		const proficiency = adjustment.parsed.proficiency
			? `proficiency:${adjustment.parsed.proficiency}`
			: '';
		const totalDC = adjustment.parsed.totalDC ? `totalDC:${adjustment.parsed.totalDC}` : '';
		const ability = adjustment.parsed.ability ? `ability:${adjustment.parsed.ability}` : '';
		const value = [total, proficiency, totalDC, ability].filter(_.identity).join(',');

		return {
			..._.omit(adjustment, 'parsed'),
			propertyType: 'stat',
			value,
		};
	}

	public static deserializeAdjustment(adjustment: TypedSheetAdjustment): SheetStatAdjustment {
		const totalMatch = statPropTotalValueRegex.exec(adjustment.value);
		const proficiencyMatch = statPropProficiencyValueRegex.exec(adjustment.value);
		const totalDCMatch = statPropTotalDCRegex.exec(adjustment.value);
		const abilityMatch = abilityPropRegex.exec(adjustment.value);

		if (!totalMatch && !proficiencyMatch && !totalDCMatch && !abilityMatch) {
			// parse as a number, and the total value
			const numericResult = parseInt(adjustment.value);
			return {
				..._.omit(adjustment, 'value'),
				parsed: {
					total: numericResult,
				},
			};
		} else {
			const stat: SheetStatAdjustment['parsed'] = {};
			if (totalMatch) stat.total = parseInt(totalMatch[1]);
			if (proficiencyMatch) stat.proficiency = parseInt(proficiencyMatch[1]);
			if (totalDCMatch) stat.totalDC = parseInt(totalDCMatch[1]);
			if (abilityMatch)
				stat.ability = abilityMatch
					? (abilityMatch[1] as ProficiencyStat['ability'])
					: undefined;
			return {
				..._.omit(adjustment, 'value'),
				parsed: stat,
			};
		}
	}
}

export type SheetAttackAdjustment = ParsedSheetAdjustment<SheetAttack>;

const separatorRegex = /[\|;]/gi;
const innerSeparator = ',';
const toHitRegex = /(?:to hit|tohit|hit|attack|atk)[\W:]([^\|;]+)/gi;
const damageRegex = /(?:damage|dmg)[\W:]([^\|;]+)/gi;
const damageTypeRegex = / ((?:[ A-Za-z_-])+)\W*$/gi;
const rangeRegex = /(?:range)[\W:]([^\|;]+)/gi;
const traitsRegex = /(?:traits?)[\W:]([^\|;]+)/gi;
const notesRegex = /(?:notes?)[\W:]([^\|;]+)/gi;

export class SheetAttackAdjuster {
	public static serializeAdjustment(adjustment: SheetAttackAdjustment): TypedSheetAdjustment {
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
		let newAdjustment: TypedSheetAdjustment = {
			..._.omit(adjustment, 'parsed'),
			value: newValue,
		};
		return newAdjustment;
	}
	public static deserializeAdjustment(adjustment: TypedSheetAdjustment): SheetAttackAdjustment {
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
}

export class SheetAdditionalSkillAdjuster {
	public static serializeAdjustment = SheetStatAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetStatAdjuster.deserializeAdjustment;
}

export class SheetWeaknessResistanceAdjuster {
	public static serializeAdjustment = SheetIntegerAdjuster.serializeAdjustment;
	public static deserializeAdjustment = SheetIntegerAdjuster.deserializeAdjustment;
}

// Type check object to make sure that all adjusters are accounted for
const allBuckets: {
	[k in NonNullable<AdjustablePropertyEnum>]: Object;
} = {
	info: SheetInfoAdjuster,
	infoList: SheetInfoListAdjuster,
	intProperty: SheetIntegerAdjuster,
	baseCounter: SheetBaseCounterAdjuster,
	weaknessResistance: SheetWeaknessResistanceAdjuster,
	stat: SheetStatAdjuster,
	extraSkill: SheetAdditionalSkillAdjuster,
	attack: SheetAttackAdjuster,
};
