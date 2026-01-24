import { describe, it, expect } from 'vitest';
import {
	type CommandOptions,
	commands as documentationCommands,
	type CommandReference,
} from '@kobold/documentation';
import type { APIApplicationCommandOption } from 'discord-api-types/v10';

/**
 * These tests validate the documentation package's internal consistency.
 * This ensures:
 * 1. All subcommand options reference valid option definitions
 * 2. Option enums are complete and consistent
 * 3. Command definitions are well-formed
 */

// ============================================================================
// Types
// ============================================================================

interface SubCommandEntry {
	key: string;
	definition: {
		name: string;
		description: string;
		options?: Record<string, APIApplicationCommandOption>;
	};
}

interface OptionEntry {
	key: string;
	option: APIApplicationCommandOption;
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Discord command/option name pattern: lowercase alphanumeric with dashes */
const DISCORD_NAME_PATTERN = /^[a-z0-9-]+$/;
const MAX_DESCRIPTION_LENGTH = 100;

function getCommandName(command: CommandReference): string {
	return command.definition.metadata.name;
}

function getEnumValues(enumObj: Record<string, string>): string[] {
	return Object.values(enumObj);
}

function getSubCommands(command: CommandReference): SubCommandEntry[] {
	return Object.entries(command.definition.subCommands).map(([key, definition]) => ({
		key,
		definition: definition as SubCommandEntry['definition'],
	}));
}

function getSubCommandOptions(subCommand: SubCommandEntry): OptionEntry[] {
	if (!subCommand.definition.options) return [];
	return Object.entries(subCommand.definition.options).map(([key, option]) => ({
		key,
		option,
	}));
}

function getCommandOptions(command: CommandReference): OptionEntry[] {
	return Object.entries(command.options).map(([key, option]) => ({
		key,
		option,
	}));
}

function getAvailableOptionNames(command: CommandReference): string[] {
	return Object.values(command.options).map(opt => opt.name);
}

function isValidDiscordName(name: string): boolean {
	return DISCORD_NAME_PATTERN.test(name);
}

function isValidDescriptionLength(description: string | undefined): boolean {
	return (description?.length ?? 0) <= MAX_DESCRIPTION_LENGTH;
}

// ============================================================================
// Test Generators
// ============================================================================

function testSubCommandOptionReferences(command: CommandReference): void {
	const commandName = getCommandName(command);
	const availableOptionNames = getAvailableOptionNames(command);
	const enumValues = getEnumValues(command.commandOptionsEnum);

	describe(commandName, () => {
		for (const subCommand of getSubCommands(command)) {
			const options = getSubCommandOptions(subCommand);

			describe(`${subCommand.key} subcommand`, () => {
				if (options.length === 0) {
					it('has no options defined', () => {
						expect(getSubCommandOptions(subCommand)).toHaveLength(0);
					});
				} else {
					for (const { key, option } of options) {
						it(`option "${key}" references a valid enum value`, () => {
							expect(
								enumValues,
								`Option key "${key}" is not a valid enum value for /${commandName}`
							).toContain(key);
						});

						it(`option "${key}" has a valid option definition`, () => {
							expect(
								availableOptionNames,
								`Option "${option.name}" used in /${commandName} ${subCommand.key} is not defined in options`
							).toContain(option.name);
						});
					}
				}
			});
		}
	});
}

function testSubCommandEnumCompleteness(command: CommandReference): void {
	const commandName = getCommandName(command);
	const enumValues = getEnumValues(command.subCommandEnum).sort();
	const definitionKeys = Object.keys(command.definition.subCommands).sort();

	it(`${commandName} subCommandEnum matches definition.subCommands keys`, () => {
		expect(
			enumValues,
			`${commandName} subCommandEnum values don't match subCommands keys`
		).toEqual(definitionKeys);
	});
}

function testCommandMetadataValidity(command: CommandReference): void {
	const commandName = getCommandName(command);

	describe(commandName, () => {
		it('has valid metadata name', () => {
			expect(commandName).toBeTruthy();
			expect(
				isValidDiscordName(commandName),
				`Command name "${commandName}" is invalid`
			).toBe(true);
		});

		it('has valid metadata description', () => {
			const description = command.definition.metadata.description;
			expect(description).toBeTruthy();
			expect(
				isValidDescriptionLength(description),
				`Description exceeds ${MAX_DESCRIPTION_LENGTH} characters`
			).toBe(true);
		});

		it('has valid subcommand names', () => {
			for (const subCommand of getSubCommands(command)) {
				expect(
					isValidDiscordName(subCommand.definition.name),
					`Subcommand ${subCommand.key} has invalid name "${subCommand.definition.name}"`
				).toBe(true);
			}
		});

		it('has valid subcommand descriptions', () => {
			for (const subCommand of getSubCommands(command)) {
				expect(
					subCommand.definition.description,
					`Subcommand ${subCommand.key} has empty description`
				).toBeTruthy();
				expect(
					isValidDescriptionLength(subCommand.definition.description),
					`Subcommand ${subCommand.key} description exceeds ${MAX_DESCRIPTION_LENGTH} characters`
				).toBe(true);
			}
		});

		it('all options have valid Discord names (lowercase alphanumeric with dashes)', () => {
			for (const { key, option } of getCommandOptions(command)) {
				expect(
					isValidDiscordName(option.name),
					`Option ${key} has invalid name "${option.name}"`
				).toBe(true);
			}
		});

		it('all options have descriptions under 100 characters', () => {
			for (const { key, option } of getCommandOptions(command)) {
				expect(
					isValidDescriptionLength(option.description),
					`Option ${key} description exceeds ${MAX_DESCRIPTION_LENGTH} characters`
				).toBe(true);
			}
		});
	});
}

function testOptionDefinitionCompleteness(command: CommandReference): void {
	const commandName = getCommandName(command);
	const enumValues = getEnumValues(command.commandOptionsEnum);
	const optionKeys = Object.keys(command.options);

	describe(`${commandName} options`, () => {
		it('all enum values have corresponding option definitions', () => {
			const missingOptions = enumValues.filter(value => !optionKeys.includes(value));
			expect(
				missingOptions,
				`Enum values missing option definitions: ${missingOptions.join(', ')}`
			).toHaveLength(0);
		});

		it('all option definitions have corresponding enum values', () => {
			const extraOptions = optionKeys.filter(key => !enumValues.includes(key));
			expect(
				extraOptions,
				`Option definitions missing enum values: ${extraOptions.join(', ')}`
			).toHaveLength(0);
		});
	});
}

// ============================================================================
// Test Suites
// ============================================================================

describe('Documentation Package Validation', () => {
	describe('Subcommand options reference valid option definitions', () => {
		for (const command of documentationCommands) {
			testSubCommandOptionReferences(command);
		}
	});

	describe('SubCommand enum completeness', () => {
		for (const command of documentationCommands) {
			testSubCommandEnumCompleteness(command);
		}
	});

	describe('Command metadata validity', () => {
		for (const command of documentationCommands) {
			testCommandMetadataValidity(command);
		}
	});
});

describe('Option definition completeness', () => {
	for (const command of documentationCommands) {
		testOptionDefinitionCompleteness(command);
	}
});
