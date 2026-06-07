import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import { Config } from '@kobold/config';
import {
	ActionCostEnum,
	ActionEffectTriggerEnum,
	ActionTypeEnum,
	AdjustablePropertyEnum,
	RollTypeEnum,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	type Condition,
	type EffectRoll,
} from '@kobold/db';
import {
	E2E_CHARACTER_NAME,
	cleanupConditionsByName,
	getE2ECharacter,
	getFullSheetRecord,
	signed,
	waitForSheetRecord,
} from '../helpers/adjusted-sheet.js';
import { kobold } from '../db.js';

async function createPersistedEffectAction({
	actionName,
	conditionName,
	condition,
	trigger = ActionEffectTriggerEnum.successOrBetter,
}: {
	actionName: string;
	conditionName: string;
	condition: Omit<Condition, 'name' | 'isActive'> & Partial<Pick<Condition, 'isActive'>>;
	trigger?: ActionEffectTriggerEnum;
}) {
	const character = await getE2ECharacter();

	return kobold.action.create({
		userId: Config.e2e?.userId ?? '',
		sheetRecordId: character.sheetRecordId,
		name: actionName,
		description: 'E2E effect stage coverage action',
		type: ActionTypeEnum.other,
		actionCost: ActionCostEnum.oneAction,
		baseLevel: null,
		autoHeighten: false,
		tags: [],
		rolls: [
			{
				name: 'Trigger Roll',
				type: RollTypeEnum.attack,
				allowRollModifiers: false,
				roll: '20',
				targetDC: '10',
			},
			{
				name: 'Effect',
				type: RollTypeEnum.effect,
				allowRollModifiers: false,
				trigger,
				condition: {
					...condition,
					name: conditionName,
					isActive: true,
				},
			},
		],
	});
}

async function rollAction({
	discordChannel,
	actionName,
	overwriteAttackRoll,
}: {
	discordChannel: Parameters<typeof sendSlashCommandWithArgs>[0];
	actionName: string;
	overwriteAttackRoll?: string;
}) {
	await sendSlashCommandWithArgs(discordChannel, '/roll action', [
		{ name: 'action', value: actionName, autocomplete: true },
		{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
		...(overwriteAttackRoll
			? [{ name: 'overwrite-attack-roll', value: overwriteAttackRoll }]
			: []),
	]);
	return (await waitForBotEmbed(discordChannel)).textContent();
}

async function setActionStage({
	discordChannel,
	actionName,
	stageName,
	editOption,
	editValue,
	moveOption,
}: {
	discordChannel: Parameters<typeof sendSlashCommandWithArgs>[0];
	actionName: string;
	stageName: string;
	editOption: string;
	editValue: string;
	moveOption?: 'top' | 'bottom';
}) {
	await sendSlashCommandWithArgs(discordChannel, '/action-stage set', [
		{ name: 'action', value: `${actionName} -- ${stageName}`, autocomplete: true },
		{ name: 'edit-option', value: editOption, autocomplete: true },
		{ name: 'edit-value', value: editValue },
		...(moveOption ? [{ name: 'move-option', value: moveOption }] : []),
	]);
	const responseText = (await waitForBotMessage(discordChannel)).textContent();
	await expect(responseText).resolves.toContain(editOption);
}

async function readEffectRoll(actionId: number, stageName: string): Promise<EffectRoll> {
	const action = await kobold.action.read({ id: actionId });
	const roll = action?.rolls.find(roll => roll.name === stageName);
	expect(roll?.type).toBe(RollTypeEnum.effect);
	return roll as EffectRoll;
}

test.describe('action effect stages', () => {
	test('applies sheet adjustments from an effect stage and does not double stack', async ({
		discordChannel,
	}) => {
		const suffix = String(Date.now()).slice(-8);
		const actionName = `e2e effect sheet ${suffix}`;
		const conditionName = `e2esheet${suffix}`.toLowerCase();
		const character = await getE2ECharacter();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseAc = initial.sheet.intProperties.ac ?? 0;
		let actionId: number | null = null;

		await cleanupConditionsByName(conditionName);

		try {
			const action = await createPersistedEffectAction({
				actionName,
				conditionName,
				condition: {
					type: SheetAdjustmentTypeEnum.status,
					severity: 3,
					sheetAdjustments: [
						{
							property: 'ac',
							propertyType: AdjustablePropertyEnum.intProperty,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '[severity]',
							type: SheetAdjustmentTypeEnum.status,
						},
					],
				},
			});
			actionId = action.id;

			await sendSlashCommandWithArgs(discordChannel, '/roll action', [
				{ name: 'action', value: actionName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);
			const firstRollText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(firstRollText?.toLowerCase()).toContain('applied');
			expect(firstRollText?.toLowerCase()).toContain(conditionName);

			const adjusted = await waitForSheetRecord(
				character.sheetRecordId,
				record =>
					record.conditions.filter(condition => condition.name === conditionName).length ===
						1 && record.adjustedSheet.intProperties.ac === baseAc + 3
			);
			expect(adjusted.sheet.intProperties.ac).toBe(baseAc);

			await sendSlashCommandWithArgs(discordChannel, '/roll action', [
				{ name: 'action', value: actionName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);
			const secondRollText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(secondRollText?.toLowerCase()).toContain('already active');

			const notStacked = await waitForSheetRecord(
				character.sheetRecordId,
				record =>
					record.conditions.filter(condition => condition.name === conditionName).length ===
						1 && record.adjustedSheet.intProperties.ac === baseAc + 3
			);
			expect(notStacked.sheet.intProperties.ac).toBe(baseAc);
		} finally {
			if (actionId != null) await kobold.action.delete({ id: actionId });
			await cleanupConditionsByName(conditionName);
		}
	});

	test('does not apply an effect when the target already has a condition with the same name', async ({
		discordChannel,
	}) => {
		const suffix = String(Date.now()).slice(-8);
		const actionName = `e2e effect existing ${suffix}`;
		const conditionName = `e2eexist${suffix}`.toLowerCase();
		const character = await getE2ECharacter();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseAc = initial.sheet.intProperties.ac ?? 0;
		let actionId: number | null = null;

		await cleanupConditionsByName(conditionName);

		try {
			await kobold.sheetRecord.update(
				{ id: character.sheetRecordId },
				{
					conditions: [
						...initial.conditions.filter(
							condition => condition.name.toLowerCase() !== conditionName
						),
						{
							name: conditionName,
							isActive: true,
							type: SheetAdjustmentTypeEnum.status,
							sheetAdjustments: [],
						},
					],
					adjustedSheet: initial.sheet,
				}
			);

			const action = await createPersistedEffectAction({
				actionName,
				conditionName,
				condition: {
					type: SheetAdjustmentTypeEnum.status,
					severity: 3,
					sheetAdjustments: [
						{
							property: 'ac',
							propertyType: AdjustablePropertyEnum.intProperty,
							operation: SheetAdjustmentOperationEnum['+'],
							value: '[severity]',
							type: SheetAdjustmentTypeEnum.status,
						},
					],
				},
			});
			actionId = action.id;

			await sendSlashCommandWithArgs(discordChannel, '/roll action', [
				{ name: 'action', value: actionName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);
			const rollText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(rollText?.toLowerCase()).toContain('already active');
			expect(rollText?.toLowerCase()).toContain(conditionName);

			const unchanged = await waitForSheetRecord(
				character.sheetRecordId,
				record =>
					record.conditions.filter(condition => condition.name === conditionName).length ===
						1 && record.adjustedSheet.intProperties.ac === baseAc
			);
			expect(unchanged.sheet.intProperties.ac).toBe(baseAc);
		} finally {
			if (actionId != null) await kobold.action.delete({ id: actionId });
			await cleanupConditionsByName(conditionName);
		}
	});

	test('updates every effect stage field through action-stage set', async ({
		discordChannel,
	}) => {
		const suffix = String(Date.now()).slice(-8);
		const actionName = `e2e effect set ${suffix}`;
		const conditionName = `e2eset${suffix}`.toLowerCase();
		const updatedConditionName = `e2esetn${suffix}`.toLowerCase();
		let actionId: number | null = null;
		let stageName = 'Effect';

		await cleanupConditionsByName(conditionName, updatedConditionName);

		try {
			const action = await createPersistedEffectAction({
				actionName,
				conditionName,
				condition: {
					type: SheetAdjustmentTypeEnum.status,
					severity: 1,
					sheetAdjustments: [],
				},
			});
			actionId = action.id;

			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'name',
				editValue: 'Edited Effect',
				moveOption: 'top',
			});
			stageName = 'Edited Effect';

			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'trigger',
				editValue: 'failure or worse',
				moveOption: 'bottom',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionName',
				editValue: updatedConditionName,
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionType',
				editValue: 'item',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionSeverity',
				editValue: '4',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionDescription',
				editValue: 'set description',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionInitiativeNote',
				editValue: 'set note',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionSheetValues',
				editValue: 'ac +[severity]',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionRollAdjustment',
				editValue: '-2',
			});
			await setActionStage({
				discordChannel,
				actionName,
				stageName,
				editOption: 'conditionRollTargetTags',
				editValue: 'skill',
			});

			const updatedAction = await kobold.action.read({ id: action.id });
			expect(updatedAction?.rolls[1]?.name).toBe(stageName);

			const effect = await readEffectRoll(action.id, stageName);
			expect(effect.trigger).toBe(ActionEffectTriggerEnum.failureOrWorse);
			expect(effect.condition.name).toBe(updatedConditionName);
			expect(effect.condition.type).toBe(SheetAdjustmentTypeEnum.item);
			expect(effect.condition.severity).toBe(4);
			expect(effect.condition.description).toBe('set description');
			expect(effect.condition.note).toBe('set note');
			expect(effect.condition.rollAdjustment).toBe('-2');
			expect(effect.condition.rollTargetTags).toBe('skill');
			expect(effect.condition.sheetAdjustments).toEqual([
				{
					property: 'ac',
					propertyType: AdjustablePropertyEnum.intProperty,
					operation: SheetAdjustmentOperationEnum['+'],
					value: '[severity]',
					type: SheetAdjustmentTypeEnum.item,
				},
			]);
		} finally {
			if (actionId != null) await kobold.action.delete({ id: actionId });
			await cleanupConditionsByName(conditionName, updatedConditionName);
		}
	});

	for (const { trigger, overwriteAttackRoll, conditionPrefix } of [
		{
			trigger: ActionEffectTriggerEnum.successOrBetter,
			overwriteAttackRoll: '10',
			conditionPrefix: 'e2esob',
		},
		{
			trigger: ActionEffectTriggerEnum.failureOrWorse,
			overwriteAttackRoll: '0',
			conditionPrefix: 'e2efow',
		},
	]) {
		test(`applies ${trigger} effects with deterministic overwrite attack rolls`, async ({
			discordChannel,
		}) => {
			const suffix = String(Date.now()).slice(-8);
			const actionName = `e2e effect trigger ${conditionPrefix} ${suffix}`;
			const conditionName = `${conditionPrefix}${suffix}`.toLowerCase();
			const character = await getE2ECharacter();
			let actionId: number | null = null;

			await cleanupConditionsByName(conditionName);

			try {
				const action = await createPersistedEffectAction({
					actionName,
					conditionName,
					trigger,
					condition: {
						type: SheetAdjustmentTypeEnum.status,
						severity: 1,
						sheetAdjustments: [
							{
								property: 'ac',
								propertyType: AdjustablePropertyEnum.intProperty,
								operation: SheetAdjustmentOperationEnum['+'],
								value: '[severity]',
								type: SheetAdjustmentTypeEnum.status,
							},
						],
					},
				});
				actionId = action.id;

				const rollText = await rollAction({
					discordChannel,
					actionName,
					overwriteAttackRoll,
				});
				expect(rollText?.toLowerCase()).toContain('applied');
				expect(rollText?.toLowerCase()).toContain(conditionName);

				await waitForSheetRecord(character.sheetRecordId, record =>
					record.conditions.some(condition => condition.name === conditionName)
				);
			} finally {
				if (actionId != null) await kobold.action.delete({ id: actionId });
				await cleanupConditionsByName(conditionName);
			}
		});
	}

	test('applies roll adjustments from an effect stage to later matching rolls', async ({
		discordChannel,
	}) => {
		const suffix = String(Date.now()).slice(-8);
		const actionName = `e2e effect roll ${suffix}`;
		const conditionName = `e2eroll${suffix}`.toLowerCase();
		const character = await getE2ECharacter();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const baseStealth = initial.adjustedSheet.stats.stealth.bonus ?? 0;
		let actionId: number | null = null;

		await cleanupConditionsByName(conditionName);

		try {
			const action = await createPersistedEffectAction({
				actionName,
				conditionName,
				condition: {
					type: SheetAdjustmentTypeEnum.status,
					rollAdjustment: '-2',
					rollTargetTags: 'skill',
					sheetAdjustments: [],
				},
			});
			actionId = action.id;

			await sendSlashCommandWithArgs(discordChannel, '/roll action', [
				{ name: 'action', value: actionName, autocomplete: true },
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
			]);
			const actionRollText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(actionRollText?.toLowerCase()).toContain('applied');
			expect(actionRollText?.toLowerCase()).toContain(conditionName);

			await waitForSheetRecord(
				character.sheetRecordId,
				record =>
					record.conditions.some(
						condition =>
							condition.name === conditionName &&
							condition.rollAdjustment === '-2' &&
							condition.rollTargetTags === 'skill'
					)
			);

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			const skillText = await (await waitForBotEmbed(discordChannel)).textContent();
			expect(skillText?.toLowerCase()).toContain('stealth');
			expect(skillText).toContain(signed(baseStealth));
			expect(skillText?.toLowerCase()).toContain(conditionName);
			expect(skillText).toContain('-2');
		} finally {
			if (actionId != null) await kobold.action.delete({ id: actionId });
			await cleanupConditionsByName(conditionName);
		}
	});
});
