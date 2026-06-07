import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import {
	ActionEffectTriggerEnum,
	ActionTypeEnum,
	RollTypeEnum,
	SheetAdjustmentTypeEnum,
	type Action,
	type Condition,
	type Roll,
} from '@kobold/db';
import { SheetProperties } from '@kobold/sheet';
import { ActionRoller } from './action-roller.js';
import { Creature } from './creature.js';

function condition(overrides: Partial<Condition> = {}): Condition {
	return {
		name: 'frightened',
		isActive: true,
		description: null,
		note: null,
		rollAdjustment: null,
		rollTargetTags: null,
		severity: 1,
		sheetAdjustments: [],
		type: SheetAdjustmentTypeEnum.status,
		...overrides,
	};
}

function creatureWithConditions(conditions: Condition[] = []) {
	return new Creature({
		sheet: _.cloneDeep(SheetProperties.defaultSheet),
		actions: [],
		modifiers: [],
		rollMacros: [],
		conditions,
	});
}

function action(trigger: ActionEffectTriggerEnum, effects: Condition[] = [condition()]): Action {
	return {
		id: 1,
		userId: 'user',
		sheetRecordId: 1,
		name: 'Test Effect Action',
		description: '',
		type: ActionTypeEnum.attack,
		actionCost: null,
		baseLevel: null,
		autoHeighten: false,
		tags: [],
		rolls: [
			{
				name: 'Attack',
				type: RollTypeEnum.attack,
				roll: '20',
				targetDC: '10',
				allowRollModifiers: false,
			},
			...effects.map(
				(effect, index): Roll => ({
					name: `Effect ${index + 1}`,
					type: RollTypeEnum.effect,
					trigger,
					condition: effect,
					allowRollModifiers: false,
				})
			),
		],
	};
}

describe('ActionRoller condition effects', () => {
	it('applies an effect when the prior roll degree matches', () => {
		const target = creatureWithConditions();
		const actionRoller = new ActionRoller(
			null,
			action(ActionEffectTriggerEnum.successOrBetter),
			creatureWithConditions(),
			target
		);

		actionRoller.buildRoll('', '', { targetDC: 10 });

		expect(target.conditions).toHaveLength(1);
		expect(target.conditions[0]).toMatchObject({ name: 'frightened', severity: 1 });
		expect(actionRoller.shouldPersistConditionEffects()).toBe(true);
		expect(actionRoller.buildEffectResultText()).toBe('Applied: frightened 1');
	});

	it('does not apply an effect when the prior roll degree misses the trigger', () => {
		const target = creatureWithConditions();
		const actionRoller = new ActionRoller(
			null,
			action(ActionEffectTriggerEnum.failure),
			creatureWithConditions(),
			target
		);

		actionRoller.buildRoll('', '', { targetDC: 10 });

		expect(target.conditions).toHaveLength(0);
		expect(actionRoller.shouldPersistConditionEffects()).toBe(false);
		expect(actionRoller.shouldDisplayEffectText()).toBe(false);
	});

	it('does not stack an already active condition with the same name', () => {
		const existingCondition = condition({ severity: 2 });
		const target = creatureWithConditions([existingCondition]);
		const actionRoller = new ActionRoller(
			null,
			action(ActionEffectTriggerEnum.successOrBetter),
			creatureWithConditions(),
			target
		);

		actionRoller.buildRoll('', '', { targetDC: 10 });

		expect(target.conditions).toEqual([existingCondition]);
		expect(actionRoller.shouldPersistConditionEffects()).toBe(false);
		expect(actionRoller.buildEffectResultText()).toBe('Already active: frightened 2');
	});

	it('does not stack duplicate effects from the same action roll', () => {
		const target = creatureWithConditions();
		const actionRoller = new ActionRoller(
			null,
			action(ActionEffectTriggerEnum.successOrBetter, [condition(), condition()]),
			creatureWithConditions(),
			target
		);

		actionRoller.buildRoll('', '', { targetDC: 10 });

		expect(target.conditions).toHaveLength(1);
		expect(actionRoller.shouldPersistConditionEffects()).toBe(true);
		expect(actionRoller.buildEffectResultText()).toBe(
			'Applied: frightened 1\nAlready active: frightened 1'
		);
	});
});
