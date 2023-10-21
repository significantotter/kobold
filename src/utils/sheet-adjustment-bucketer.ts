import _ from 'lodash';
import { ProficiencyStat, Sheet } from '../services/kobold/models/index.js';
import {
	AdjustablePropertyEnum,
	SheetAttackAdjuster,
	SheetInfoAdjuster,
	SheetInfoAdjustment,
	SheetInfoListAdjuster,
	SheetInfoListAdjustment,
	SheetIntegerAdjuster,
	SheetIntegerAdjustment,
	SheetStatAdjuster,
	SheetStatAdjustment,
	TypedSheetAdjustment,
} from './sheet-adjuster.js';

export class SheetAdjustmentBucketer {
	protected buckets: Record<
		NonNullable<TypedSheetAdjustment['propertyType']>,
		SheetPropertyGroupBucket<any>
	>;
	constructor(protected sheet: Sheet) {
		this.buckets = {
			info: new SheetInfoBucket(),
			infoList: new SheetInfoListsBucket(),
			intProperty: new SheetIntegerPropertyBucket(),
			weaknessResistance: new WeaknessResistanceBucket(),
			baseCounter: new BaseCounterBucket(),
			stat: new StatBucket(),
			extraSkill: new ExtraSkillBucket(),
			attack: new AttackBucket(),
		};
	}

	addToBucket(adjustment: TypedSheetAdjustment) {
		if (adjustment.propertyType == null) return;
		return this.buckets[adjustment.propertyType].sortToBucket(adjustment);
	}

	reduceBuckets(): TypedSheetAdjustment[] {
		return _.flatMap(this.buckets, bucket => bucket.reduceBuckets());
	}
}

export abstract class SheetPropertyGroupBucket<T> {
	buckets: { [property: string]: { [type: string]: T } } = {};
	constructor() {}
	public abstract serialize(adjustment: T): TypedSheetAdjustment;
	public abstract deserialize(adjustment: TypedSheetAdjustment): T;
	public abstract combine(currentAdjustment: T, newAdjustment: T): T;
	public abstract combineSameType(currentAdjustment: T, newAdjustment: T): T;
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

export class SheetInfoBucket extends SheetPropertyGroupBucket<SheetInfoAdjustment> {
	public serialize = SheetInfoAdjuster.serializeAdjustment;
	public deserialize = SheetInfoAdjuster.deserializeAdjustment;
	public combine(
		currentAdjustment: SheetInfoAdjustment,
		newAdjustment: SheetInfoAdjustment
	): SheetInfoAdjustment {
		return newAdjustment;
	}
	public combineSameType = this.combine.bind(this);
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return adjustment.operation === '+' || adjustment.operation === '-';
	}
}

export class SheetInfoListsBucket extends SheetPropertyGroupBucket<SheetInfoListAdjustment> {
	public serialize = SheetInfoListAdjuster.serializeAdjustment;
	public deserialize = SheetInfoListAdjuster.deserializeAdjustment;
	public combine(
		currentAdjustment: SheetInfoListAdjustment,
		newAdjustment: SheetInfoListAdjustment
	): SheetInfoListAdjustment {
		if (newAdjustment.operation === '=') return newAdjustment;
		else if (newAdjustment.operation === '+') {
			return {
				...currentAdjustment,
				parsed: currentAdjustment.parsed.concat(newAdjustment.parsed),
			};
		} else {
			return {
				...currentAdjustment,
				parsed: currentAdjustment.parsed.filter(
					value => !newAdjustment.parsed.includes(value)
				),
			};
		}
	}
	public combineSameType = this.combine.bind(this);
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			adjustment.value === '' &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
	}
}

export class SheetIntegerPropertyBucket extends SheetPropertyGroupBucket<SheetIntegerAdjustment> {
	public serialize = SheetIntegerAdjuster.serializeAdjustment;
	public deserialize = SheetIntegerAdjuster.deserializeAdjustment;
	protected getBucketKey(adjustment: TypedSheetAdjustment): string {
		return adjustment.property;
	}

	public combine(
		currentAdjustment: SheetIntegerAdjustment,
		newAdjustment: SheetIntegerAdjustment
	): SheetIntegerAdjustment {
		if (newAdjustment.operation === '=') return newAdjustment;
		else if (newAdjustment.operation === '+') {
			const combinedValue = currentAdjustment.parsed + newAdjustment.parsed;
			return {
				...currentAdjustment,
				parsed: combinedValue,
			};
		} else {
			// operation is -
			const combinedValue = currentAdjustment.parsed - newAdjustment.parsed;
			return {
				...currentAdjustment,
				parsed: combinedValue,
			};
		}
	}
	public combineSameType(
		currentAdjustment: SheetIntegerAdjustment,
		newAdjustment: SheetIntegerAdjustment
	): SheetIntegerAdjustment {
		if (newAdjustment.operation === '+') {
			const max = _.maxBy(
				[currentAdjustment, newAdjustment],
				(adjustment: SheetIntegerAdjustment) => adjustment.parsed
			);
			if (max) return max;
		} else if (newAdjustment.operation === '-') {
			// operation is -
			const min = _.minBy(
				[currentAdjustment, newAdjustment],
				(adjustment: SheetIntegerAdjustment) => adjustment.parsed
			);
			if (min) return min;
		} // otherwise (newAdjustment.operation === '=')
		// or maxBy/minBy returned null, which is impossible because the array is non-empty
		// and the adjustments are non-nullable
		return newAdjustment;
	}

	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			(adjustment.value === '' || isNaN(parseInt(adjustment.value))) &&
			(adjustment.operation === '+' || adjustment.operation === '-')
		);
	}
}

// You can only adjust the max of a counter, so treat it as a number
export class BaseCounterBucket extends SheetIntegerPropertyBucket {}
// you can only adjust the amount of a weakness/resistance, so treat it as a number
export class WeaknessResistanceBucket extends SheetIntegerPropertyBucket {
	// however, you always discard values of 0. They're not meaningful like
	// for other numeric values
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return (
			((adjustment.value === '' || isNaN(parseInt(adjustment.value))) &&
				(adjustment.operation === '+' || adjustment.operation === '-')) ||
			parseInt(adjustment.value) === 0
		);
	}
}
export class StatBucket extends SheetPropertyGroupBucket<SheetStatAdjustment> {
	public serialize = SheetStatAdjuster.serializeAdjustment;
	public deserialize = SheetStatAdjuster.deserializeAdjustment;

	protected getBucketKey(adjustment: TypedSheetAdjustment): string {
		return adjustment.property;
	}

	public combine(
		currentAdjustment: SheetStatAdjustment,
		newAdjustment: SheetStatAdjustment
	): SheetStatAdjustment {
		let newStat: Partial<ProficiencyStat> = {};
		if (newAdjustment.operation === '=') {
			return {
				...newAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newAdjustment.parsed),
			};
		} else if (newAdjustment.operation === '+') {
			if (newAdjustment.parsed.total != undefined) {
				newStat.total = currentAdjustment.parsed.total
					? currentAdjustment.parsed.total + newAdjustment.parsed.total
					: newAdjustment.parsed.total;
			}
			if (newAdjustment.parsed.totalDC != undefined) {
				newStat.totalDC = currentAdjustment.parsed.totalDC
					? currentAdjustment.parsed.totalDC + newAdjustment.parsed.totalDC
					: newAdjustment.parsed.totalDC;
			}
			if (newAdjustment.parsed.proficiency != undefined) {
				newStat.proficiency = currentAdjustment.parsed.proficiency
					? currentAdjustment.parsed.proficiency + newAdjustment.parsed.proficiency
					: newAdjustment.parsed.proficiency;
			}
			if (
				newAdjustment.parsed.ability != undefined &&
				currentAdjustment.parsed.ability == undefined
			) {
				newStat.ability = newAdjustment.parsed.ability;
			}
			return {
				...currentAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newStat),
			};
		} else {
			if (newAdjustment.parsed.total != undefined) {
				newStat.total = currentAdjustment.parsed.total
					? currentAdjustment.parsed.total - newAdjustment.parsed.total
					: newAdjustment.parsed.total;
			}
			if (newAdjustment.parsed.totalDC != undefined) {
				newStat.totalDC = currentAdjustment.parsed.totalDC
					? currentAdjustment.parsed.totalDC - newAdjustment.parsed.totalDC
					: newAdjustment.parsed.totalDC;
			}
			if (newAdjustment.parsed.proficiency != undefined) {
				newStat.proficiency = currentAdjustment.parsed.proficiency
					? currentAdjustment.parsed.proficiency - newAdjustment.parsed.proficiency
					: newAdjustment.parsed.proficiency;
			}
			if (newAdjustment.parsed.ability === currentAdjustment.parsed.ability) {
				newStat.ability = null;
			}
			return {
				...currentAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newStat),
			};
		}
	}
	public combineSameType(
		currentAdjustment: SheetStatAdjustment,
		newAdjustment: SheetStatAdjustment
	): SheetStatAdjustment {
		let newStat: Partial<ProficiencyStat> = {};
		if (newAdjustment.operation === '=') {
			return {
				...newAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newAdjustment.parsed),
			};
		} else if (newAdjustment.operation === '+') {
			if (newAdjustment.parsed.total != undefined) {
				newStat.total = Math.max(
					currentAdjustment.parsed.total ?? 0,
					newAdjustment.parsed.total
				);
			}
			if (newAdjustment.parsed.totalDC != undefined) {
				newStat.totalDC = Math.max(
					currentAdjustment.parsed.totalDC ?? 0,
					newAdjustment.parsed.totalDC
				);
			}
			if (newAdjustment.parsed.proficiency != undefined) {
				newStat.proficiency = Math.max(
					currentAdjustment.parsed.proficiency ?? 0,
					newAdjustment.parsed.proficiency
				);
			}
			if (
				newAdjustment.parsed.ability != undefined &&
				currentAdjustment.parsed.ability == undefined
			) {
				newStat.ability = newAdjustment.parsed.ability;
			}
			return {
				...currentAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newStat),
			};
		} else {
			if (newAdjustment.parsed.total != undefined) {
				newStat.total = Math.min(
					currentAdjustment.parsed.total ?? 0,
					newAdjustment.parsed.total
				);
			}
			if (newAdjustment.parsed.totalDC != undefined) {
				newStat.totalDC = Math.min(
					currentAdjustment.parsed.totalDC ?? 0,
					newAdjustment.parsed.totalDC
				);
			}
			if (newAdjustment.parsed.proficiency != undefined) {
				newStat.proficiency = Math.min(
					currentAdjustment.parsed.proficiency ?? 0,
					newAdjustment.parsed.proficiency
				);
			}
			if (newAdjustment.parsed.ability === currentAdjustment.parsed.ability) {
				newStat.ability = null;
			}
			return {
				...currentAdjustment,
				parsed: _.merge(currentAdjustment.parsed, newStat),
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

// Extra skills are just stats, but in a list instead of with a string literal index
// We handle that on parse, so we don't need to do anything extra here
export class ExtraSkillBucket extends StatBucket {}

// Attacks all overwrite each other, so we don't need to combine them
// We don't care about the contents until we parse
export class AttackBucket extends SheetPropertyGroupBucket<SheetAttackAdjuster> {
	public discardAdjustment(adjustment: TypedSheetAdjustment): boolean {
		return adjustment.operation === '+' || adjustment.operation === '-';
	}
	public serialize = SheetAttackAdjuster.serializeAdjustment;
	public deserialize = SheetAttackAdjuster.deserializeAdjustment;
	public combine(
		currentAdjustment: SheetAttackAdjuster,
		newAdjustment: SheetAttackAdjuster
	): SheetAttackAdjuster {
		return newAdjustment;
	}
	public combineSameType = this.combine.bind(this);
}

// Type check object to make sure that all buckets are accounted for
const allBuckets: {
	[k in NonNullable<AdjustablePropertyEnum>]: typeof SheetPropertyGroupBucket<any>;
} = {
	info: SheetInfoBucket,
	infoList: SheetInfoListsBucket,
	intProperty: SheetIntegerPropertyBucket,
	baseCounter: BaseCounterBucket,
	weaknessResistance: WeaknessResistanceBucket,
	stat: StatBucket,
	extraSkill: ExtraSkillBucket,
	attack: AttackBucket,
};
