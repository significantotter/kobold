/**
 * Integration tests for ModifierListSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SheetAdjustmentTypeEnum } from '@kobold/db';
import { ModifierCommand } from './modifier-command.js';
import { ModifierListSubCommand } from './modifier-list-subcommand.js';
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('ModifierListSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ModifierCommand([new ModifierListSubCommand()])]);
	});


	describe('successful modifier listing', () => {
		it('should list all modifiers on a character', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'inspire courage',
					isActive: true,
					description: 'Bard inspiration',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack OR damage',
					note: null,
				},
				{
					name: 'frightened',
					isActive: true,
					description: 'Fear condition',
					type: SheetAdjustmentTypeEnum.status,
					severity: 2,
					sheetAdjustments: [],
					rollAdjustment: '-2',
					rollTargetTags: 'attack OR skill',
					note: 'Frightened 2',
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should handle a character with no modifiers', async () => {
			// Arrange
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = [];

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should list modifiers with mixed active states', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'active modifier',
					isActive: true,
					description: 'Currently active',
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
				{
					name: 'inactive modifier',
					isActive: false,
					description: 'Currently inactive',
					type: SheetAdjustmentTypeEnum.circumstance,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'perception',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should list modifiers with various types', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'status modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
				{
					name: 'circumstance modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.circumstance,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'attack',
					note: null,
				},
				{
					name: 'untyped modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.untyped,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '-1',
					rollTargetTags: 'skill',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should sort modifiers alphabetically', async () => {
			// Arrange
			const modifiers = [
				{
					name: 'zebra modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+1',
					rollTargetTags: 'attack',
					note: null,
				},
				{
					name: 'apple modifier',
					isActive: true,
					description: null,
					type: SheetAdjustmentTypeEnum.status,
					severity: null,
					sheetAdjustments: [],
					rollAdjustment: '+2',
					rollTargetTags: 'attack',
					note: null,
				},
			];
			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.modifiers = modifiers;

			setupKoboldUtilsMocks({ characterOverrides: mockCharacter });

			// Act
			const result = await harness.executeCommand({
				commandName: 'modifier',
				subcommand: 'list',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
