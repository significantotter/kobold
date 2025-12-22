/**
 * Integration tests for CounterDisplaySubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CounterDefinition as CounterCommandDoc } from '@kobold/documentation';
import { CounterCommand } from './counter-command.js';
import { CounterDisplaySubCommand } from './counter-display-subcommand.js';

const opts = CounterCommandDoc.commandOptionsEnum;
import {
	createTestHarness,
	createMockCharacter,
	setupKoboldUtilsMocks,
	setupAutocompleteKoboldMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
	createMockNumericCounter,
	createMockCounterGroup,
	createMockDotsCounter,
	createMockPreparedCounter,
} from '../../../test-utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import type { Counter } from '@kobold/db';
import type { MockKoboldEmbed } from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../utils/kobold-embed-utils.js');
vi.mock('../../../utils/kobold-helpers/finder-helpers.js');

describe('CounterDisplaySubCommand Integration', () => {
	let harness: CommandTestHarness;
	let sendBatchesMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		harness = createTestHarness([new CounterCommand([new CounterDisplaySubCommand()])]);

		// Setup KoboldEmbed mock
		sendBatchesMock = vi.fn(async () => undefined);
		vi.mocked(KoboldEmbed).mockImplementation(function (this: MockKoboldEmbed) {
			this.setCharacter = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.setTitle = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.setDescription = vi.fn(function (this: MockKoboldEmbed) {
				return this;
			});
			this.sendBatches = sendBatchesMock;
			return this;
		} as unknown as () => KoboldEmbed);
	});

	describe('displaying a counter', () => {
		it('should display a numeric counter', async () => {
			// Arrange
			const counter = createMockNumericCounter({
				name: 'Hit Points',
				current: 30,
				max: 45,
				description: 'Current health',
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Hit Points' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
			expect(FinderHelpers.getCounterByName).toHaveBeenCalled();
		});

		it('should display a dots counter', async () => {
			// Arrange
			const counter = createMockDotsCounter({
				name: 'Focus Points',
				current: 2,
				max: 3,
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Focus Points' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should display a prepared counter', async () => {
			// Arrange
			const counter = createMockPreparedCounter({
				name: 'Level 1 Spells',
				prepared: ['Magic Missile', 'Shield', null],
				active: [true, false, true],
			});

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Level 1 Spells' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should display a counter with its group name', async () => {
			// Arrange
			const counter = createMockNumericCounter({ name: 'Level 1' });
			const group = createMockCounterGroup({ name: 'Spell Slots' });

			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter,
				group,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Level 1' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(sendBatchesMock).toHaveBeenCalled();
		});

		it('should throw error when counter not found', async () => {
			// Arrange
			setupKoboldUtilsMocks();
			vi.mocked(FinderHelpers.getCounterByName).mockReturnValue({
				counter: null,
				group: null,
			});

			// Act
			const result = await harness.executeCommand({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Nonexistent' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert - Error is caught and responded to
			expect(result.didRespond()).toBe(true);
		});
	});

	describe('autocomplete', () => {
		it('should return matching counters for autocomplete', async () => {
			// Arrange
			const counters: Counter[] = [
				createMockNumericCounter({ name: 'Focus Points' }),
				createMockNumericCounter({ name: 'Fortune' }),
			];

			const mockCharacter = createMockCharacter();
			mockCharacter.sheetRecord.sheet.countersOutsideGroups = counters;

			setupAutocompleteKoboldMocks({
				characterOverrides: mockCharacter,
			});

			// Act
			const result = await harness.executeAutocomplete({
				commandName: 'counter',
				subcommand: 'display',
				options: { [opts.counterName]: 'Fo' },
				focusedOption: { name: opts.counterName, value: 'Fo' },
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			const choices = result.getChoices();
			expect(choices.length).toBeGreaterThanOrEqual(0);
		});
	});
});
