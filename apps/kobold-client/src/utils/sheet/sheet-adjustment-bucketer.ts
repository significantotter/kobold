import _ from 'lodash';
import { AdjustablePropertyEnum, Sheet, SheetAdjustment, StatSubGroupEnum } from 'kobold-db';
import { KoboldError } from '../KoboldError.js';
import {
	SheetAdditionalSkillAdjuster,
	SheetAttackAdjuster,
	SheetAttackAdjustment,
	SheetExtraSkillAdjustment,
	SheetInfoAdjuster,
	SheetInfoAdjustment,
	SheetInfoListAdjuster,
	SheetInfoListAdjustment,
	SheetIntegerAdjuster,
	SheetIntegerAdjustment,
	SheetStatAdjuster,
	SheetStatAdjustment,
	SheetWeaknessResistanceAdjuster,
} from './sheet-adjuster.js';
import { SheetProperties } from './sheet-properties.js';

export class SheetAdjustmentBucketer {
	protected buckets: Record<
		Exclude<SheetAdjustment['propertyType'], '' | 'statGroup'>,
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

	addToBucket(adjustment: SheetAdjustment) {
		let adjustments = [adjustment];
		if (adjustment.propertyType == '') return;
		else if (adjustment.propertyType === AdjustablePropertyEnum.statGroup) {
			// spread the adjustment

			// split the adjustment into many property adjustments if it's a group
			const properties = SheetProperties.propertyGroupToSheetProperties(
				adjustment.property,
				this.sheet
			);

			const spreadAdjustments = properties.map(property => ({
				...adjustment,
				propertyType: AdjustablePropertyEnum.stat,
				property,
			}));

			adjustments = spreadAdjustments;
			// add each adjustment to the bucketer
			for (const spreadAdjustment of spreadAdjustments) {
				this.addToBucket(spreadAdjustment);
			}
		} else {
			this.buckets[adjustment.propertyType].sortToBucket(adjustment);
		}
	}

	reduceBuckets(): SheetAdjustment[] {
		return _.flatMap(this.buckets, bucket => bucket.reduceBuckets());
	}
}

export abstract class SheetPropertyGroupBucket<T> {
	buckets: {
		[property: string]: {
			[type: string]: { [operation: string]: T };
		};
	} = {};
	constructor() {}
	public abstract serialize(adjustment: T): SheetAdjustment;
	public abstract deserialize(adjustment: SheetAdjustment): T | null;
	public abstract combine(currentAdjustment: T, newAdjustment: T): T;
	public abstract combineSameType(currentAdjustment: T, newAdjustment: T): T;
	public abstract discardAdjustment(adjustment: SheetAdjustment): boolean;
	public sortToBucket(adjustment: SheetAdjustment): void {
		if (this.discardAdjustment(adjustment)) return;
		const deserializedAdjustment = this.deserialize(adjustment);
		if (!deserializedAdjustment) {
			throw new KoboldError(
				`Discarding adjustment because it failed to deserialize`,
				JSON.stringify(adjustment)
			);
		}
		if (!this.buckets[adjustment.property]) this.buckets[adjustment.property] = {};
		if (!this.buckets[adjustment.property][adjustment.type])
			this.buckets[adjustment.property][adjustment.type] = {};

		const currentValue =
			this.buckets[adjustment.property][adjustment.type][adjustment.operation];

		if (currentValue == null) {
			this.buckets[adjustment.property][adjustment.type][adjustment.operation] =
				deserializedAdjustment;
		} else {
			this.buckets[adjustment.property][adjustment.type][adjustment.operation] =
				this.combineSameType(currentValue, deserializedAdjustment);
		}
	}
	public reduceBuckets(): SheetAdjustment[] {
		const finalAdjustments: SheetAdjustment[] = [];
		for (const propertyAdjustment of _.keys(this.buckets)) {
			// collect all of the T values in the bucket for this property, and combine them
			const allPropertyAdjustments: T[] = [];
			for (const typeAdjustments of Object.values(this.buckets[propertyAdjustment])) {
				for (const operationAdjustments of Object.values(typeAdjustments)) {
					allPropertyAdjustments.push(operationAdjustments);
				}
			}
			const reducedAdjustment = allPropertyAdjustments.reduce(
				(currentAdjustment, newAdjustment) => this.combine(currentAdjustment, newAdjustment)
			);

			const serializedAdjustment = this.serialize(reducedAdjustment);
			// if the result isn't an empty state (i.e. operation: '+' value: '0)
			if (!this.discardAdjustment(serializedAdjustment))
				finalAdjustments.push(serializedAdjustment);
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
	public discardAdjustment = SheetInfoAdjuster.discardAdjustment;
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
	public discardAdjustment = SheetInfoListAdjuster.discardAdjustment;
}

export class SheetIntegerPropertyBucket extends SheetPropertyGroupBucket<SheetIntegerAdjustment> {
	public serialize = SheetIntegerAdjuster.serializeAdjustment;
	public deserialize = SheetIntegerAdjuster.deserializeAdjustment;
	protected getBucketKey(adjustment: SheetAdjustment): string {
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

	public discardAdjustment = SheetIntegerAdjuster.discardAdjustment;
}

// You can only adjust the max of a counter, so treat it as a number
export class BaseCounterBucket extends SheetIntegerPropertyBucket {}
// you can only adjust the amount of a weakness/resistance, so treat it as a number
export class WeaknessResistanceBucket extends SheetIntegerPropertyBucket {
	// however, you always discard values of 0. They're not meaningful like
	// for other numeric values
	public discardAdjustment = SheetWeaknessResistanceAdjuster.discardAdjustment;
}
export class StatBucket extends SheetPropertyGroupBucket<SheetStatAdjustment> {
	public serialize = SheetStatAdjuster.serializeAdjustment;
	public deserialize = SheetStatAdjuster.deserializeAdjustment;

	public combine(
		currentAdjustment: SheetStatAdjustment,
		newAdjustment: SheetStatAdjustment
	): SheetStatAdjustment {
		if (
			typeof currentAdjustment.parsed.value === 'number' &&
			typeof newAdjustment.parsed.value === 'number'
		) {
			if (newAdjustment.operation === '=') return newAdjustment;
			else if (newAdjustment.operation === '+') {
				const combinedValue = currentAdjustment.parsed.value + newAdjustment.parsed.value;
				return {
					...currentAdjustment,
					parsed: {
						baseKey: currentAdjustment.parsed.baseKey,
						subKey: currentAdjustment.parsed.subKey,
						value: combinedValue,
					},
				};
			} else {
				// operation is -
				const combinedValue = currentAdjustment.parsed.value - newAdjustment.parsed.value;
				return {
					...currentAdjustment,
					parsed: {
						baseKey: currentAdjustment.parsed.baseKey,
						subKey: currentAdjustment.parsed.subKey,
						value: combinedValue,
					},
				};
			}
		} else {
			if (newAdjustment.operation === '=' || newAdjustment.operation === '+') {
				return newAdjustment;
			} else {
				// operation is -
				// if they're the same ability, remove the ability
				if (currentAdjustment.parsed.value === newAdjustment.parsed.value) {
					return {
						...currentAdjustment,
						parsed: {
							baseKey: currentAdjustment.parsed.baseKey,
							value: '',
							subKey: StatSubGroupEnum.ability,
						},
					};
				}
			}
		}
		return currentAdjustment;
	}
	public combineSameType(
		currentAdjustment: SheetStatAdjustment,
		newAdjustment: SheetStatAdjustment
	): SheetStatAdjustment {
		if (
			typeof currentAdjustment.parsed.value === 'number' &&
			typeof newAdjustment.parsed.value === 'number'
		) {
			if (newAdjustment.operation === '+') {
				const max = _.maxBy(
					[currentAdjustment, newAdjustment],
					(adjustment: SheetStatAdjustment) => adjustment.parsed.value
				);
				if (max) return max;
			} else if (newAdjustment.operation === '-') {
				// operation is -
				const min = _.minBy(
					[currentAdjustment, newAdjustment],
					(adjustment: SheetStatAdjustment) => adjustment.parsed.value
				);
				if (min) return min;
			} // otherwise (newAdjustment.operation === '=')
			// or maxBy/minBy returned null, which is impossible because the array is non-empty
			// and the adjustments are non-nullable
			return newAdjustment;
		} else if (
			typeof currentAdjustment.parsed.value === 'string' &&
			typeof newAdjustment.parsed.value === 'string'
		) {
			return this.combine(currentAdjustment, newAdjustment);
		}
		return currentAdjustment;
	}

	public discardAdjustment = SheetStatAdjuster.discardAdjustment;
}

// Extra skills are just stats, but in a list instead of with a string literal index
// We handle that on parse, so we don't need to do anything extra here
export class ExtraSkillBucket extends SheetPropertyGroupBucket<SheetExtraSkillAdjustment> {
	public serialize = SheetAdditionalSkillAdjuster.serializeAdjustment;
	public deserialize = SheetAdditionalSkillAdjuster.deserializeAdjustment;

	public combine(
		currentAdjustment: SheetExtraSkillAdjustment,
		newAdjustment: SheetExtraSkillAdjustment
	): SheetExtraSkillAdjustment {
		if (
			typeof currentAdjustment.parsed.value === 'number' &&
			typeof newAdjustment.parsed.value === 'number'
		) {
			if (newAdjustment.operation === '=') return newAdjustment;
			else if (newAdjustment.operation === '+') {
				const combinedValue = currentAdjustment.parsed.value + newAdjustment.parsed.value;
				return {
					...currentAdjustment,
					parsed: {
						baseKey: currentAdjustment.parsed.baseKey,
						subKey: currentAdjustment.parsed.subKey,
						value: combinedValue,
					},
				};
			} else {
				// operation is -
				const combinedValue = currentAdjustment.parsed.value - newAdjustment.parsed.value;
				return {
					...currentAdjustment,
					parsed: {
						baseKey: currentAdjustment.parsed.baseKey,
						subKey: currentAdjustment.parsed.subKey,
						value: combinedValue,
					},
				};
			}
		} else {
			if (newAdjustment.operation === '=' || newAdjustment.operation === '+') {
				return newAdjustment;
			} else {
				// operation is -
				// if they're the same ability, remove the ability
				if (currentAdjustment.parsed.value === newAdjustment.parsed.value) {
					return {
						...currentAdjustment,
						parsed: {
							baseKey: currentAdjustment.parsed.baseKey,
							value: '',
							subKey: StatSubGroupEnum.ability,
						},
					};
				}
			}
		}
		return currentAdjustment;
	}
	public combineSameType(
		currentAdjustment: SheetExtraSkillAdjustment,
		newAdjustment: SheetExtraSkillAdjustment
	): SheetExtraSkillAdjustment {
		if (
			typeof currentAdjustment.parsed.value === 'number' &&
			typeof newAdjustment.parsed.value === 'number'
		) {
			if (newAdjustment.operation === '+') {
				const max = _.maxBy(
					[currentAdjustment, newAdjustment],
					(adjustment: SheetExtraSkillAdjustment) => adjustment.parsed.value
				);
				if (max) return max;
			} else if (newAdjustment.operation === '-') {
				// operation is -
				const min = _.minBy(
					[currentAdjustment, newAdjustment],
					(adjustment: SheetExtraSkillAdjustment) => adjustment.parsed.value
				);
				if (min) return min;
			} // otherwise (newAdjustment.operation === '=')
			// or maxBy/minBy returned null, which is impossible because the array is non-empty
			// and the adjustments are non-nullable
			return newAdjustment;
		} else if (
			typeof currentAdjustment.parsed.value === 'string' &&
			typeof newAdjustment.parsed.value === 'string'
		) {
			return this.combine(currentAdjustment, newAdjustment);
		}
		return currentAdjustment;
	}
	public discardAdjustment = SheetAdditionalSkillAdjuster.discardAdjustment;
}

// Attacks all overwrite each other, so we don't need to combine them
// We don't care about the contents until we parse
export class AttackBucket extends SheetPropertyGroupBucket<SheetAttackAdjustment> {
	public serialize = SheetAttackAdjuster.serializeAdjustment;
	public deserialize = SheetAttackAdjuster.deserializeAdjustment;
	public combine(
		currentAdjustment: SheetAttackAdjustment,
		newAdjustment: SheetAttackAdjustment
	): SheetAttackAdjustment {
		return newAdjustment;
	}
	public combineSameType = this.combine.bind(this);
	public discardAdjustment = SheetAttackAdjuster.discardAdjustment;
}

// Type check object to make sure that all buckets are accounted for
const allBuckets: {
	[k in Exclude<AdjustablePropertyEnum, '' | 'statGroup'>]: typeof SheetPropertyGroupBucket<any>;
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
