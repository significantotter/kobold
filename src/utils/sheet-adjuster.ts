import _ from 'lodash';
import {
	Sheet,
	SheetInfo,
	SheetInfoKeys,
	SheetInfoListKeys,
	SheetInfoLists,
} from '../services/kobold/models/index.js';
import { SheetProperties, SheetInfoProperties } from './sheet-properties.js';
import {
	loreRegex,
	immunityRegex,
	resistanceRegex,
	weaknessRegex,
	languageRegex,
	senseRegex,
	attackRegex,
	sheetPropertyGroups,
	TypedSheetAdjustment,
} from './sheet-utils.js';
import { literalKeys } from './type-guards.js';

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
		if (loreRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (immunityRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (resistanceRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (weaknessRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (languageRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (senseRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;
		if (attackRegex.test(lowerTrimmedProperty)) return lowerTrimmedProperty;

		const withoutSpaces = lowerTrimmedProperty.replaceAll(' ', '');

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

	public static getPropertyType(
		property: string
	):
		| 'info'
		| 'infoList'
		| 'intProperty'
		| 'baseCounter'
		| 'weaknessResistance'
		| 'stat'
		| 'attack'
		| 'extraSkill'
		| null {
		// basic sheet property
		const standardizedProperty = SheetAdjuster.standardizeProperty(property);
		if (SheetInfoProperties.aliases[standardizedProperty]) return 'info';
		// regexes
		if (property.match(loreRegex)) return 'extraSkill';
		else if (
			property.match(immunityRegex) ||
			property.match(languageRegex) ||
			property.match(senseRegex)
		)
			return 'infoList';
		else if (property.match(resistanceRegex) || property.match(weaknessRegex))
			return 'weaknessResistance';
		else if (property.match(attackRegex)) return 'attack';

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
}

// Sheet InfoList Properties

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
}

// protected adjustByNumber<K>(
// 	propName: StringLiteral<K>,
// 	sheetValue: { [P in StringLiteral<K>]: number | null }
// ) {
// 	return (adjustment: typedSheetAdjustment) => {
// 		const currentValue = sheetValue[propName];
// 		const parsedAdjustValue = _.parseInt(adjustment.value);
// 		const defaultedCurrentValue = currentValue ?? 0;
// 		switch (adjustment.operation) {
// 			case '+':
// 				sheetValue[propName] = defaultedCurrentValue + parsedAdjustValue;
// 				break;
// 			case '-':
// 				sheetValue[propName] = defaultedCurrentValue - parsedAdjustValue;
// 				break;
// 			case '=':
// 				sheetValue[propName] = parsedAdjustValue;
// 				break;
// 		}
// 	};
// }
// protected adjustByStringArray<K>(
// 	propName: StringLiteral<K>,
// 	sheetValue: { [P in StringLiteral<K>]: string[] }
// ) {
// 	return (adjustment: typedSheetAdjustment) => {
// 		const currentValue = sheetValue[propName] ?? [];
// 		switch (adjustment.operation) {
// 			case '=':
// 			case '+':
// 				sheetValue[propName] = _.uniq(currentValue.concat(adjustment.value));
// 				break;
// 			case '-':
// 				sheetValue[propName] = currentValue.filter(value => value != adjustment.value);
// 				break;
// 		}
// 	};
// }
// protected adjustByWeakResist<K>(
// 	propName: StringLiteral<K>,
// 	sheetValue: { [P in StringLiteral<K>]: WeaknessOrResistance[] }
// ) {
// 	return (adjustment: typedSheetAdjustment) => {
// 		const [type] = adjustment.property.split(' ');
// 		const parsedAdjustValue = _.parseInt(adjustment.value.trim());
// 		let currentValueIndex = sheetValue[propName].findIndex(value => value.type === type);
// 		let currentValue = sheetValue[propName][currentValueIndex] ?? { type, amount: 0 };
// 		if (currentValueIndex === -1) {
// 			sheetValue[propName].push(currentValue);
// 			currentValueIndex = sheetValue[propName].length - 1;
// 		}
// 		switch (adjustment.operation) {
// 			case '+':
// 				currentValue.amount = currentValue.amount + parsedAdjustValue;
// 			case '-':
// 				currentValue.amount = currentValue.amount - parsedAdjustValue;
// 			case '=':
// 				currentValue.amount = parsedAdjustValue;
// 		}
// 	};
// }
// protected adjustByAttack<K>(
// 	propName: StringLiteral<K>,
// 	sheetValue: { [P in StringLiteral<K>]: SheetAttack[] }
// ) {
// 	return (adjustment: typedSheetAdjustment) => {
// 		const currentValue = sheetValue[propName] ?? '';
// 		switch (adjustment.operation) {
// 			case '+':
// 			case '=':
// 		}
// 	};
// }
// protected adjustBySkill<K>(
// 	propName: StringLiteral<K>,
// 	sheetValue: { [P in StringLiteral<K>]: AdditionalSkill[] }
// ) {
// 	return (adjustment: typedSheetAdjustment) => {
// 		const currentValue = sheetValue[propName] ?? '';
// 		switch (adjustment.operation) {
// 			case '+':
// 			case '=':
// 		}
// 	};
// }
