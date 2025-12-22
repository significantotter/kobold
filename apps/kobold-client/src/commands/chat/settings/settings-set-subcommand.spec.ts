/**
 * Unit tests for SettingsSetSubCommand
 */
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import {
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	DefaultCompendiumEnum,
	RollCompactModeEnum,
} from '@kobold/db';
import { SettingsCommand } from './settings-command.js';
import { SettingsSetSubCommand } from './settings-set-subcommand.js';
import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	getMockKobold,
	resetMockKobold,
	type MockKoboldUtils,
} from '../../../test-utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');

describe('SettingsSetSubCommand', () => {
	const kobold = getMockKobold();

	let harness: CommandTestHarness;
	let upsertMock: MockInstance;

	const mockUserSettings = {
		userId: TEST_USER_ID,
		initStatsNotification: InitStatsNotificationEnum.every_round,
		rollCompactMode: RollCompactModeEnum.normal,
		inlineRollsDisplay: InlineRollsDisplayEnum.detailed,
		defaultCompendium: DefaultCompendiumEnum.nethys,
	};

	beforeEach(() => {
		resetMockKobold(kobold);
		harness = createTestHarness([new SettingsCommand([new SettingsSetSubCommand()])]);

		// Setup upsert mock on kobold
		upsertMock = kobold.userSettings.upsert.mockResolvedValue(mockUserSettings);

		// Setup KoboldUtils mock
		vi.mocked(KoboldUtils).mockImplementation(function (this: MockKoboldUtils) {
			this.fetchNonNullableDataForCommand = vi.fn(async () => ({
				userSettings: mockUserSettings,
			}));
			return this;
		} as unknown as () => KoboldUtils);
	});

	describe('setting initiative-tracker-notifications', () => {
		it('should set initiative-tracker-notifications to never', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
					value: 'never',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('initiative-tracker-notifications');
			expect(response).toContain('never');
		});

		it('should set initiative-tracker-notifications to every turn', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
					value: 'every turn',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
		});

		it('should set initiative-tracker-notifications to every round', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
					value: 'every round',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
		});

		it('should set initiative-tracker-notifications to whenever hidden', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
					value: 'whenever hidden',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
		});
	});

	describe('setting inline-rolls-display', () => {
		it('should set inline-rolls-display to detailed', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'inline-rolls-display',
					value: 'detailed',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('inline-rolls-display');
			expect(response).toContain('detailed');
		});

		it('should set inline-rolls-display to compact', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'inline-rolls-display',
					value: 'compact',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
		});
	});

	describe('setting default-compendium', () => {
		it('should set default-compendium to nethys', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'default-compendium',
					value: 'nethys',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
			const response = result.getResponseContent();
			expect(response).toContain('default-compendium');
			expect(response).toContain('nethys');
		});

		it('should set default-compendium to pf2etools', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'default-compendium',
					value: 'pf2etools',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
			expect(upsertMock).toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('should error for invalid option name', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'invalid-option',
					value: 'some value',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - errors are caught and logged, not thrown
			expect(upsertMock).not.toHaveBeenCalled();
		});

		it('should error for invalid initiative-tracker-notifications value', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
					value: 'invalid value',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - errors are caught and logged, not thrown
			expect(upsertMock).not.toHaveBeenCalled();
		});

		it('should error for invalid inline-rolls-display value', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'inline-rolls-display',
					value: 'invalid value',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - errors are caught and logged, not thrown
			expect(upsertMock).not.toHaveBeenCalled();
		});

		it('should error for invalid default-compendium value', async () => {
			// Act
			const result = await harness.executeCommand({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'default-compendium',
					value: 'invalid value',
				},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - errors are caught and logged, not thrown
			expect(upsertMock).not.toHaveBeenCalled();
		});
	});

	describe('autocomplete', () => {
		it('should return initiative notification options for autocomplete', async () => {
			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'initiative-tracker-notifications',
				},
				focusedOption: { name: 'value', value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices).toBeDefined();
			expect(choices.length).toBe(4);
			expect(choices.map(c => c.name)).toContain('never');
			expect(choices.map(c => c.name)).toContain('every turn');
			expect(choices.map(c => c.name)).toContain('every round');
			expect(choices.map(c => c.name)).toContain('whenever hidden');
		});

		it('should return inline rolls display options for autocomplete', async () => {
			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'inline-rolls-display',
				},
				focusedOption: { name: 'value', value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices).toBeDefined();
			expect(choices.length).toBe(2);
			expect(choices.map(c => c.name)).toContain('detailed');
			expect(choices.map(c => c.name)).toContain('compact');
		});

		it('should return compendium options for autocomplete', async () => {
			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'settings',
				subcommand: 'set',
				options: {
					option: 'default-compendium',
				},
				focusedOption: { name: 'value', value: '' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices).toBeDefined();
			expect(choices.length).toBe(2);
			expect(choices.map(c => c.name)).toContain('nethys');
			expect(choices.map(c => c.name)).toContain('pf2etools');
		});
	});
});
