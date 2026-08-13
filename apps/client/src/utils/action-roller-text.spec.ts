import _ from 'lodash';
import { describe, expect, it } from 'vitest';
import {
	ActionTypeEnum,
	RollTypeEnum,
	SheetAdjustmentTypeEnum,
	type Action,
	type Condition,
} from '@kobold/db';
import { SheetProperties } from '@kobold/sheet';
import { ActionRoller } from './action-roller.js';
import { Creature } from './creature.js';

function textModifier(): Condition {
	return {
		name: 'Text modifier',
		isActive: true,
		description: null,
		note: null,
		rollAdjustment: '1',
		rollTargetTags: 'text',
		severity: null,
		sheetAdjustments: [],
		type: SheetAdjustmentTypeEnum.untyped,
	};
}

function creatureWithModifier() {
	return new Creature({
		sheet: _.cloneDeep(SheetProperties.defaultSheet),
		actions: [],
		modifiers: [],
		rollMacros: [],
		conditions: [textModifier()],
	});
}

function textAction(allowRollModifiers?: boolean): Action {
	return {
		id: 1,
		userId: 'user',
		sheetRecordId: 1,
		name: 'Test Spell',
		description: '',
		type: ActionTypeEnum.spell,
		actionCost: null,
		baseLevel: 6,
		autoHeighten: false,
		tags: [],
		rolls: [
			{
				name: 'Effect',
				type: RollTypeEnum.text,
				defaultText: '{{[spellLevel]}}d6 fire damage',
				criticalSuccessText: null,
				successText: null,
				failureText: null,
				criticalFailureText: null,
				extraTags: [],
				allowRollModifiers: allowRollModifiers as boolean,
			},
		],
	};
}

describe('ActionRoller text stages', () => {
	it.each([
		['disabled', false],
		['unspecified', undefined],
	] as const)('does not apply modifiers when they are %s', (_label, allowRollModifiers) => {
		const actionRoller = new ActionRoller(
			null,
			textAction(allowRollModifiers),
			creatureWithModifier()
		);

		const result = actionRoller.buildRoll('', '', {});

		expect(result.rollResults).toContainEqual({
			name: 'Effect',
			type: 'text',
			value: '`6`d6 fire damage',
		});
	});

	it('applies modifiers when explicitly enabled', () => {
		const actionRoller = new ActionRoller(null, textAction(true), creatureWithModifier());

		const result = actionRoller.buildRoll('', '', {});

		expect(result.rollResults).toContainEqual({
			name: 'Effect',
			type: 'text',
			value: '`7="6 + 1"`d6 fire damage',
		});
	});
});
