/**
 * Integration tests for CharacterImportWanderersGuideSubCommand
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterCommand } from './character-command.js';
import { CharacterImportWanderersGuideSubCommand } from './character-import-wanderers-guide-subcommand.js';
import {
	createTestHarness,
	TEST_USER_ID,
	TEST_GUILD_ID,
	CommandTestHarness,
} from '../../../test-utils/index.js';

describe('CharacterImportWanderersGuideSubCommand Integration', () => {
	let harness: CommandTestHarness;

	beforeEach(() => {
		harness = createTestHarness([
			new CharacterCommand([new CharacterImportWanderersGuideSubCommand()]),
		]);
	});

	it('should respond with web app import instructions', async () => {
		const result = await harness.executeCommand({
			commandName: 'character',
			subcommand: 'import-wanderers-guide',
			options: {},
			userId: TEST_USER_ID,
			guildId: TEST_GUILD_ID,
		});

		expect(result.didRespond()).toBe(true);
		const response = result.getResponseContent();
		expect(response).toContain('Kobold web app');
		expect(response).toContain('/import');
	});
});
