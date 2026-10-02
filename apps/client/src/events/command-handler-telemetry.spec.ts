import {
	DiscordAPIError,
	RESTJSONErrorCodes as DiscordApiErrors,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { describe, expect, it, vi } from 'vitest';

import { Command, CommandDeferType, InjectedServices } from '../commands/command.js';
import { Logger } from '../services/logger.js';
import {
	createMockChatInputInteraction,
	createMockAutocompleteInteraction,
} from '../test-utils/mock-interactions.js';
import { InteractionUtils } from '../utils/interaction-utils.js';
import { CommandTimingContext } from '../services/command-timing-context.js';
import { CommandHandler } from './command-handler.js';

function createCommand(execute = vi.fn(async () => {})): Command {
	return {
		name: 'telemetry',
		metadata: {
			name: 'telemetry',
			description: 'test',
			type: 1,
		} as RESTPostAPIApplicationCommandsJSONBody,
		deferType: CommandDeferType.PUBLIC,
		requireClientPerms: [],
		commands: [],
		execute,
	};
}

describe('CommandHandler telemetry', () => {
	it('logs receipt, defer, and total command timing', async () => {
		const infoSpy = vi.spyOn(Logger, 'info').mockImplementation(() => {});
		const execute = vi.fn(async () => {});
		const handler = new CommandHandler(
			[createCommand(execute)],
			{} as Required<InjectedServices>
		);
		const interaction = createMockChatInputInteraction({ commandName: 'telemetry' });

		await handler.process(interaction);

		expect(execute).toHaveBeenCalledOnce();
		expect(infoSpy).toHaveBeenCalledWith(
			expect.stringContaining('Interaction received'),
			expect.objectContaining({
				event: 'interaction_received',
				gatewayLagMs: expect.any(Number),
			})
		);
		expect(infoSpy).toHaveBeenCalledWith(
			expect.stringContaining('Interaction deferred'),
			expect.objectContaining({
				event: 'interaction_deferred',
				deferDurationMs: expect.any(Number),
			})
		);
		expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('total='));
	});

	it('logs and stops when a defer is not acknowledged', async () => {
		const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {});
		const execute = vi.fn(async () => {});
		const handler = new CommandHandler(
			[createCommand(execute)],
			{} as Required<InjectedServices>
		);
		const interaction = createMockChatInputInteraction({ commandName: 'telemetry' });
		interaction.deferReply.mockResolvedValueOnce(undefined);

		await handler.process(interaction);

		expect(execute).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('did not acknowledge'),
			expect.objectContaining({ event: 'interaction_defer_unacknowledged' })
		);
	});

	it('logs ignored UnknownInteraction defer errors explicitly', async () => {
		const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {});
		const interaction = createMockChatInputInteraction({ commandName: 'telemetry' });
		interaction.deferReply.mockRejectedValueOnce(
			new DiscordAPIError(
				{ message: 'Unknown interaction', code: DiscordApiErrors.UnknownInteraction },
				DiscordApiErrors.UnknownInteraction,
				404,
				'POST',
				'https://discord.test/interactions',
				{ body: null, files: undefined }
			)
		);

		await expect(InteractionUtils.deferReply(interaction)).resolves.toBeUndefined();

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('Discord rejected the interaction defer'),
			expect.objectContaining({
				event: 'interaction_defer_discord_rejection',
				isUnknownInteraction: true,
			})
		);
	});
});

describe('autocomplete database telemetry', () => {
	it.each(['processing', 'response'])(
		'identifies %s failures and preserves query timing',
		async stage => {
			const error = new Error('simulated failure');
			const errorSpy = vi.spyOn(Logger, 'error').mockResolvedValue();
			vi.spyOn(Logger, 'info').mockImplementation(() => {});
			const interaction = createMockAutocompleteInteraction({ commandName: 'telemetry' });
			const command = createCommand();
			command.autocomplete = vi.fn(async () => {
				expect(CommandTimingContext.metadata()).toEqual({
					commandName: 'telemetry',
					interactionId: interaction.id,
				});
				CommandTimingContext.recordDbQuery(12, 'select 1');
				if (stage === 'processing') throw error;
				return [];
			});
			vi.spyOn(InteractionUtils, 'respond').mockRejectedValue(error);
			await new CommandHandler([command], {} as Required<InjectedServices>).process(
				interaction
			);
			expect(errorSpy).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					err: error,
					event: 'autocomplete_failed',
					failureStage: stage,
					dbDurationMs: 12,
					dbQueryCount: 1,
				})
			);
			expect(CommandTimingContext.metadata()).toBeUndefined();
		}
	);
});
