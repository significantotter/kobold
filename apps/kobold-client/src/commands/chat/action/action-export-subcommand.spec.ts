/**
 * Integration tests for ActionExportSubCommand
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionTypeEnum, ActionCostEnum } from '@kobold/db';
import { ActionCommand } from './action-command.js';
import { ActionExportSubCommand } from './action-export-subcommand.js';
import { PasteBin } from '../../../services/pastebin/index.js';
import {
	createTestHarness,
	createMockAction,
	setupKoboldUtilsMocks,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

vi.mock('../../../utils/kobold-service-utils/kobold-utils.js');
vi.mock('../../../services/pastebin/index.js');

describe('ActionExportSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([new ActionCommand([new ActionExportSubCommand()])]);
	});


	describe('successful action export', () => {
		it('should export actions to PasteBin and return link', async () => {
			// Arrange
			const action = createMockAction({
				name: 'Strike',
				description: 'A basic attack',
			});

			setupKoboldUtilsMocks({ actions: [action] });
			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						post: vi.fn().mockResolvedValue('https://pastebin.com/abc123'),
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should export empty actions array', async () => {
			// Arrange
			setupKoboldUtilsMocks({ actions: [] });
			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						post: vi.fn().mockResolvedValue('https://pastebin.com/empty123'),
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});

		it('should export multiple actions', async () => {
			// Arrange
			const actions = [
				createMockAction({ name: 'Strike', type: ActionTypeEnum.attack }),
				createMockAction({
					name: 'Fireball',
					type: ActionTypeEnum.spell,
					actionCost: ActionCostEnum.twoActions,
					baseLevel: 3,
					autoHeighten: true,
					tags: ['fire'],
				}),
			];

			setupKoboldUtilsMocks({ actions });
			vi.mocked(PasteBin).mockImplementation(
				() =>
					({
						post: vi.fn().mockResolvedValue('https://pastebin.com/multi123'),
					}) as any
			);

			// Act
			const result = await harness.executeCommand({
				commandName: 'action',
				subcommand: 'export',
				options: {},
				userId: TEST_USER_ID,
				guildId: TEST_GUILD_ID,
			});

			// Assert
			expect(result.didRespond()).toBe(true);
		});
	});
});
