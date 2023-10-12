import _ from 'lodash';
import { ProficiencyStat, Sheet } from '../services/kobold/models/index.js';
import { TypedSheetAdjustment } from './sheet-utils.js';

export class SheetAdjustmentBucketer {
	protected sheetInfoBucket: SheetInfoBucket;
	protected sheetInfoListsBucket: SheetInfoListsBucket;
	protected intPropertyBucket: IntPropertyBucket;
	constructor(protected sheet: Sheet) {
		this.sheetInfoBucket = new SheetInfoBucket();
		this.sheetInfoListsBucket = new SheetInfoListsBucket();
		this.intPropertyBucket = new IntPropertyBucket();
	}

	addToBucket(adjustment: TypedSheetAdjustment) {
		if (adjustment.propertyType === 'info') {
			this.sheetInfoBucket.sortToBucket(adjustment);
		}
		if (adjustment.propertyType === 'infoList') {
			this.sheetInfoListsBucket.sortToBucket(adjustment);
		}
		if (
			adjustment.propertyType === 'intProperty' ||
			adjustment.propertyType === 'baseCounter'
		) {
			this.intPropertyBucket.sortToBucket(adjustment);
		}
	}

	reduceBuckets(): TypedSheetAdjustment[] {
		const buckets = [this.sheetInfoBucket];
		return buckets.map(bucket => bucket.reduceBuckets()).flat(1);
	}
}

export abstract class SheetPropertyGroupBucket<T> {
	buckets: { [property: string]: { [type: string]: T } } = {};
	constructor() {}
	public abstract serialize(adjustment: T): TypedSheetAdjustment;
	public abstract deserialize(adjustment: TypedSheetAdjustment): T;
	public abstract combine(currentAdjustment: T, newAdjustment: T): T;
	public abstract discardAdjustment(adjustment: TypedSheetAdjustment): boolean;
	public sortToBucket(adjustment: TypedSheetAdjustment): void {
		if (this.discardAdjustment(adjustment)) return;
		if (!this.buckets[adjustment.property]) this.buckets[adjustment.property] = {};
		const currentValue = this.buckets[adjustment.property][adjustment.type];
		if (currentValue == null) {
			this.buckets[adjustment.property][adjustment.type] = this.deserialize(adjustment);
		} else {
			this.buckets[adjustment.property][adjustment.type] = this.combine(
				currentValue,
				this.deserialize(adjustment)
			);
		}
	}
	public reduceBuckets(): TypedSheetAdjustment[] {
		const finalAdjustments: TypedSheetAdjustment[] = [];
		for (const propertyAdjustments of _.keys(this.buckets)) {
			const reducedAdjustment = Object.values(this.buckets[propertyAdjustments]).reduce(
				(a: T | null, b: T | null): T | null => {
					if (a == null) return b;
					if (b == null) return a;
					return this.combine(a, b);
				},
				null
			);
			if (reducedAdjustment) {
				const serializedAdjustment = this.serialize(reducedAdjustment);
				if (!this.discardAdjustment(serializedAdjustment))
					finalAdjustments.push(serializedAdjustment);
			}
		}
		return finalAdjustments;
	}
}

export class SheetInfoBucket extends SheetPropertyGroupBucket<TypedSheetAdjustment> {
	public serialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public deserialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public combine(
		currentAdjustment: TypedSheetAdjustment,
		newAdjustment: TypedSheetAdjustment
	): TypedSheetAdjustment {
		return newAdjustment;
	}
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return adjustment.operation === '+' || adjustment.operation === '-';
	}
}

export class SheetInfoListsBucket extends SheetPropertyGroupBucket<TypedSheetAdjustment> {
	public serialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public deserialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public combine(
		currentAdjustment: TypedSheetAdjustment,
		newAdjustment: TypedSheetAdjustment
	): TypedSheetAdjustment {
		if (newAdjustment.operation === '=') return newAdjustment;
		else if (newAdjustment.operation === '+') {
			return {
				...newAdjustment,
				value: currentAdjustment.value
					.split(',')
					.concat(newAdjustment.value.split(','))
					.join(','),
			};
		} else {
			return {
				...newAdjustment,
				value: currentAdjustment.value
					.split(',')
					.filter(value => !newAdjustment.value.split(',').includes(value))
					.join(','),
			};
		}
	}
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
	}
}

export class IntPropertyBucket extends SheetPropertyGroupBucket<TypedSheetAdjustment> {
	public serialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	public deserialize(adjustment: TypedSheetAdjustment): TypedSheetAdjustment {
		return adjustment;
	}
	protected getBucketKey(adjustment: TypedSheetAdjustment): string {
		return adjustment.property;
	}

	public combine(
		currentAdjustment: TypedSheetAdjustment,
		newAdjustment: TypedSheetAdjustment
	): TypedSheetAdjustment {
		if (newAdjustment.operation === '=') return newAdjustment;
		else if (newAdjustment.operation === '+') {
			const currentValue =
				currentAdjustment.value === '' ? 0 : parseInt(currentAdjustment.value, 10);
			const newValue = newAdjustment.value === '' ? 0 : parseInt(newAdjustment.value, 10);
			const combinedValue = currentValue + newValue;
			return {
				...currentAdjustment,
				value: combinedValue.toString(),
			};
		} else {
			// operation is -
			const currentValue =
				currentAdjustment.value === '' ? 0 : parseInt(currentAdjustment.value, 10);
			const newValue = newAdjustment.value === '' ? 0 : parseInt(newAdjustment.value, 10);
			const combinedValue = currentValue - newValue;
			return {
				...currentAdjustment,
				value: combinedValue.toString(),
			};
		}
	}

	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			(adjustment.value === '' || isNaN(parseInt(adjustment.value))) &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
	}
}

export type SheetPropertyGroupAdjustment = {
	type: TypedSheetAdjustment['type'];
	operation: TypedSheetAdjustment['operation'];
	property: string;
	stat: Partial<ProficiencyStat>;
};
const statPropTotalValueRegex = /(?:total|bonus)\W*:\W*([0-9]+)/gi;
const statPropProficiencyValueRegex = /(?:proficiency|prof)\W*:\W*([0-9]+)/gi;
const statPropTotalDCRegex = /(?:totalDC|DC)\W*:\W*([0-9]+)/gi;
const abilityPropRegex =
	/ability\W*:\W*(strength|str|dexterity|dex|constitution|con|intelligence|int|wisdom|wis|charisma|cha){1}/gi;

export class StatBucket extends SheetPropertyGroupBucket<SheetPropertyGroupAdjustment> {
	public serialize(adjustment: SheetPropertyGroupAdjustment): TypedSheetAdjustment {
		const total = adjustment.stat.total ? `total:${adjustment.stat.total}` : '';
		const proficiency = adjustment.stat.proficiency
			? `proficiency:${adjustment.stat.proficiency}`
			: '';
		const totalDC = adjustment.stat.totalDC ? `totalDC:${adjustment.stat.totalDC}` : '';
		const ability = adjustment.stat.ability ? `ability:${adjustment.stat.ability}` : '';
		const value = [total, proficiency, totalDC, ability].filter(_.identity).join(',');

		return {
			..._.omit(adjustment, 'stat'),
			propertyType: 'stat',
			value,
		};
	}

	public deserialize(adjustment: TypedSheetAdjustment): SheetPropertyGroupAdjustment {
		const totalMatch = statPropTotalValueRegex.exec(adjustment.value);
		const proficiencyMatch = statPropProficiencyValueRegex.exec(adjustment.value);
		const totalDCMatch = statPropTotalDCRegex.exec(adjustment.value);
		const abilityMatch = abilityPropRegex.exec(adjustment.value);

		if (!totalMatch && !proficiencyMatch && !totalDCMatch && !abilityMatch) {
			// parse as a number, and the total value
			const numericResult = parseInt(adjustment.value);
			return {
				..._.omit(adjustment, 'value'),
				stat: {
					total: numericResult,
				},
			};
		} else {
			const stat: SheetPropertyGroupAdjustment['stat'] = {};
			if (totalMatch) stat.total = parseInt(totalMatch[1]);
			if (proficiencyMatch) stat.proficiency = parseInt(proficiencyMatch[1]);
			if (totalDCMatch) stat.totalDC = parseInt(totalDCMatch[1]);
			if (abilityMatch)
				stat.ability = abilityMatch
					? (abilityMatch[1] as ProficiencyStat['ability'])
					: undefined;
			return {
				..._.omit(adjustment, 'value'),
				stat,
			};
		}
	}
	protected getBucketKey(adjustment: TypedSheetAdjustment): string {
		return adjustment.property;
	}

	public combine(
		currentAdjustment: SheetPropertyGroupAdjustment,
		newAdjustment: SheetPropertyGroupAdjustment
	): SheetPropertyGroupAdjustment {
		let newStat: Partial<ProficiencyStat> = {};
		if (newAdjustment.operation === '=') {
			return { ...newAdjustment, stat: _.merge(currentAdjustment.stat, newAdjustment.stat) };
		} else if (newAdjustment.operation === '+') {
			if (newAdjustment.stat.total != undefined) {
				newStat.total = currentAdjustment.stat.total
					? currentAdjustment.stat.total + newAdjustment.stat.total
					: newAdjustment.stat.total;
			}
			if (newAdjustment.stat.totalDC != undefined) {
				newStat.totalDC = currentAdjustment.stat.totalDC
					? currentAdjustment.stat.totalDC + newAdjustment.stat.totalDC
					: newAdjustment.stat.totalDC;
			}
			if (newAdjustment.stat.proficiency != undefined) {
				newStat.proficiency = currentAdjustment.stat.proficiency
					? currentAdjustment.stat.proficiency + newAdjustment.stat.proficiency
					: newAdjustment.stat.proficiency;
			}
			if (
				newAdjustment.stat.ability != undefined &&
				currentAdjustment.stat.ability == undefined
			) {
				newStat.ability = newAdjustment.stat.ability;
			}
			return {
				...currentAdjustment,
				stat: _.merge(currentAdjustment.stat, newStat),
			};
		} else {
			if (newAdjustment.stat.total != undefined) {
				newStat.total = currentAdjustment.stat.total
					? currentAdjustment.stat.total - newAdjustment.stat.total
					: newAdjustment.stat.total;
			}
			if (newAdjustment.stat.totalDC != undefined) {
				newStat.totalDC = currentAdjustment.stat.totalDC
					? currentAdjustment.stat.totalDC - newAdjustment.stat.totalDC
					: newAdjustment.stat.totalDC;
			}
			if (newAdjustment.stat.proficiency != undefined) {
				newStat.proficiency = currentAdjustment.stat.proficiency
					? currentAdjustment.stat.proficiency - newAdjustment.stat.proficiency
					: newAdjustment.stat.proficiency;
			}
			if (newAdjustment.stat.ability === currentAdjustment.stat.ability) {
				newStat.ability = null;
			}
			return {
				...currentAdjustment,
				stat: _.merge(currentAdjustment.stat, newStat),
			};
		}
	}

	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
	}
}

class ExtraSkillBucket extends StatBucket {}
