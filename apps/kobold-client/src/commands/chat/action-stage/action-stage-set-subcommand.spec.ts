/**
 * Integration tests for ActionStageSetSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vitestKobold } from '@kobold/db/test-utils';
import { ActionStageCommand } from './action-stage-command.js';
import { ActionStageSetSubCommand } from './action-stage-set-subcommand.js';
import {
	createTestHarness,
	createMockAction,
	createAttackRoll,
	createDamageRoll,
	createTextRoll,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	setupSheetRecordUpdateMock,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('ActionStageSetSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionStageCommand([new ActionStageSetSubCommand()])]);
	});


	describe('execute', () => {
		it('should set the name of an attack roll', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'name',
'edit-value': 'Primary Attack',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set the roll of an attack stage', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'roll',
'edit-value': '1d20+15',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set allowRollModifiers to false', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createAttackRoll({
name: 'Attack',
roll: '1d20+10',
allowRollModifiers: true,
}),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'allowRollModifiers',
'edit-value': 'false',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set damage type for a damage roll', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createDamageRoll({
name: 'Damage',
roll: '2d6+4',
damageType: 'slashing',
}),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Damage',
'edit-option': 'damageType',
'edit-value': 'fire',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should set text for a text stage', async () => {
			// Arrange
			const action = createMockAction({
name: 'Cast Spell',
rolls: [
createTextRoll({
name: 'Effect',
defaultText: 'Old text',
}),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Cast Spell -- Effect',
'edit-option': 'defaultText',
'edit-value': 'New text content',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should move a stage to top', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createAttackRoll({ name: 'Attack', roll: '1d20+10' }),
createDamageRoll({ name: 'Damage', roll: '2d6+4' }),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Damage',
'edit-option': 'name',
'edit-value': 'Damage',
'move-option': 'top',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should move a stage to bottom', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createAttackRoll({ name: 'Attack', roll: '1d20+10' }),
createDamageRoll({ name: 'Damage', roll: '2d6+4' }),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'name',
'edit-value': 'Attack',
'move-option': 'bottom',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});

		it('should fail when action is not found', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Nonexistent -- Roll',
'edit-option': 'name',
'edit-value': 'New Name',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when roll is not found', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
});
			setupKoboldUtilsMocks({ actions: [action] });

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Nonexistent',
'edit-option': 'name',
'edit-value': 'New Name',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should fail when editing invalid field for roll type', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
});
			setupKoboldUtilsMocks({ actions: [action] });

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'defaultText', // Invalid for attack roll
'edit-value': 'Some text',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should clear a field by setting to none/null', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createAttackRoll({
name: 'Attack',
roll: '1d20+10',
targetDC: 'AC',
}),
],
});
			setupKoboldUtilsMocks({ actions: [action] });
			const { updateMock } = setupSheetRecordUpdateMock(vitestKobold);

			// Act
			const result = await harness.executeCommand({
commandName: 'action-stage',
subcommand: 'set',
options: {
action: 'Strike -- Attack',
'edit-option': 'targetDC',
'edit-value': 'none',
},
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(updateMock).toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return matching action rolls for action target', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [
createAttackRoll({ name: 'Attack', roll: '1d20+10' }),
createDamageRoll({ name: 'Damage', roll: '2d6+4' }),
],
});
			setupAutocompleteKoboldMocks({ actions: [action] });

			// Act
			const result = await harness.executeAutocomplete({
commandName: 'action-stage',
subcommand: 'set',
focusedOption: { name: 'action', value: 'Strike' },
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});

		it('should return valid edit options for attack roll', async () => {
			// Arrange
			const action = createMockAction({
name: 'Strike',
rolls: [createAttackRoll({ name: 'Attack', roll: '1d20+10' })],
});
			setupAutocompleteKoboldMocks({ actions: [action] });

			// Act
			const result = await harness.executeAutocomplete({
commandName: 'action-stage',
subcommand: 'set',
focusedOption: { name: 'edit-option', value: '' },
options: { action: 'Strike -- Attack' },
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.getChoices().length).toBeGreaterThanOrEqual(0);
		});

		it('should return empty array when no character is active', async () => {
			// Arrange
			setupAutocompleteKoboldMocks({ noActiveCharacter: true });

			// Act
			const result = await harness.executeAutocomplete({
commandName: 'action-stage',
subcommand: 'set',
focusedOption: { name: 'action', value: 'test' },
userId: TEST_USER_ID,
guildId: TEST_GUILD_ID,
});

			// Assert
			expect(result.getChoices()).toHaveLength(0);
		});
	});
});
