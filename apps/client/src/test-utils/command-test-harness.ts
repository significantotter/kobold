import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
} from 'discord.js';
import { Mock, vi } from 'vitest';

import { Command, InjectedServices } from '../commands/command.js';
import { CommandHandler } from '../events/command-handler.js';
import {
	createMockChatInputInteraction,
	createMockAutocompleteInteraction,
	MockInteractionOptions,
	getInteractionResponseContent,
} from './mock-interactions.js';

/**
 * Result object returned from command execution, containing the interaction
 * and helper methods for assertions.
 */
export interface CommandExecutionResult {
	/** The mock interaction that was processed */
	interaction: ChatInputCommandInteraction & {
		reply: Mock;
		editReply: Mock;
		followUp: Mock;
		deferReply: Mock;
	};
	/** Get the content sent via reply, editReply, or followUp */
	getResponseContent(): string | undefined;
	/** Check if deferReply was called */
	wasDeferred(): boolean;
	/** Check if any response was sent */
	didRespond(): boolean;
}

/**
 * Result object returned from autocomplete execution.
 */
export interface AutocompleteExecutionResult {
	/** The mock autocomplete interaction that was processed */
	interaction: AutocompleteInteraction & { respond: Mock };
	/** Get the choices that were responded with */
	getChoices(): Array<{ name: string; value: string }>;
}

/**
 * Options for creating a CommandTestHarness
 */
export interface CommandTestHarnessOptions {
	/** Commands to register with the handler */
	commands: Command[];
	/** Injected services (kobold, nethysCompendium) */
	services: InjectedServices;
}

/**
 * A test harness for integration testing Discord slash commands.
 *
 * This harness wraps the CommandHandler and provides utilities for:
 * - Creating mock interactions with specified options
 * - Executing commands through the same code path as production
 * - Asserting on responses sent to Discord
 *
 * @example
 * ```typescript
 * const harness = new CommandTestHarness({
 *   commands: [new ActionCommand([new ActionCreateSubCommand()])],
 *   services: { kobold: testKobold, nethysCompendium: testNethys }
 * });
 *
 * const result = await harness.executeCommand({
 *   commandName: 'action',
 *   subcommand: 'create',
 *   options: { name: 'Test Action', type: 'attack' }
 * });
 *
 * expect(result.getResponseContent()).toContain('Test Action');
 * ```
 */
export class CommandTestHarness {
	private handler: CommandHandler;
	private commands: Command[];
	private services: InjectedServices;

	constructor(options: CommandTestHarnessOptions) {
		this.commands = options.commands;
		this.services = options.services;
		this.handler = new CommandHandler(
			this.commands,
			this.services as Required<InjectedServices>
		);
	}

	/**
	 * Execute a chat input command and return the result for assertions.
	 *
	 * @param options - Options for creating the mock interaction
	 * @returns Result object with the interaction and helper methods
	 */
	async executeCommand(options: MockInteractionOptions): Promise<CommandExecutionResult> {
		const interaction = createMockChatInputInteraction(options);

		// Process the command through the handler
		await this.handler.process(interaction);

		return {
			interaction,
			getResponseContent: () => getInteractionResponseContent(interaction),
			wasDeferred: () => interaction.deferReply.mock.calls.length > 0,
			didRespond: () =>
				interaction.reply.mock.calls.length > 0 ||
				interaction.editReply.mock.calls.length > 0 ||
				interaction.followUp.mock.calls.length > 0,
		};
	}

	/**
	 * Execute an autocomplete interaction and return the result.
	 *
	 * @param options - Options for creating the mock autocomplete interaction
	 * @returns Result object with the interaction and choices
	 */
	async executeAutocomplete(
		options: MockInteractionOptions & { focusedOption?: { name: string; value: string } }
	): Promise<AutocompleteExecutionResult> {
		const interaction = createMockAutocompleteInteraction(options);

		// Process the autocomplete through the handler
		await this.handler.process(interaction);

		return {
			interaction,
			getChoices: () => {
				if (interaction.respond.mock.calls.length > 0) {
					return interaction.respond.mock.calls[0][0] ?? [];
				}
				return [];
			},
		};
	}

	/**
	 * Get the underlying CommandHandler for advanced testing scenarios.
	 */
	getHandler(): CommandHandler {
		return this.handler;
	}

	/**
	 * Get the registered commands.
	 */
	getCommands(): Command[] {
		return this.commands;
	}

	/**
	 * Get the injected services.
	 */
	getServices(): InjectedServices {
		return this.services;
	}
}

/**
 * Factory function to create a CommandTestHarness with common defaults.
 * Useful when you want to test a single command in isolation.
 *
 * @param command - The command to test
 * @param services - Injected services
 * @returns A configured CommandTestHarness
 */
export function createCommandHarness(
	command: Command,
	services: InjectedServices
): CommandTestHarness {
	return new CommandTestHarness({
		commands: [command],
		services,
	});
}
