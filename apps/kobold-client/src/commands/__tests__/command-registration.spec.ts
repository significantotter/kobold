import { describe, it, expect } from 'vitest';
import {
	commands as documentationCommands,
	ActionDefinition as ActionCommand,
	ActionStageDefinition as ActionStageCommand,
	type CommandReference,
} from '@kobold/documentation';
import { ChatCommandExports } from '../chat/index.js';
import { CommandExport } from '../command.js';
import _ from 'lodash';

/**
 * These tests validate that command implementations properly align with their
 * documentation definitions. This ensures:
 * 1. All documented commands have implementations
 * 2. All documented subcommands have implementations
 * 3. Command metadata (name, options) matches documentation
 */

describe('Command Registration Validation', () => {
	describe('All documented commands have implementations', () => {
		it.each(documentationCommands.map(cmd => [cmd.definition.metadata.name, cmd]))(
			'%s command has an implementation',
			(name, docCommand) => {
				const implementation = ChatCommandExports.find(exp => {
					const instance = new exp.command([]);
					return instance.name === name;
				});
				expect(
					implementation,
					`Command "${name}" is documented but has no implementation`
				).toBeDefined();
			}
		);
	});

	describe('Command implementations match documentation structure', () => {
		// Map documentation commands by name for lookup
		const docCommandsByName = new Map<string, CommandReference>(
			documentationCommands.map(cmd => [cmd.definition.metadata.name, cmd])
		);

		for (const commandExport of ChatCommandExports) {
			const commandInstance = new commandExport.command([]);
			const commandName = commandInstance.name;
			const docCommand = docCommandsByName.get(commandName);

			// Skip commands that don't have documentation (like admin commands)
			if (!docCommand) continue;

			describe(`${commandName} command`, () => {
				it('has correct number of subcommands', () => {
					const expectedSubCommands = Object.keys(docCommand.definition.subCommands);
					expect(
						commandExport.subCommands.length,
						`${commandName} has ${commandExport.subCommands.length} subcommands but documentation defines ${expectedSubCommands.length}`
					).toBe(expectedSubCommands.length);
				});

				// Test each subcommand
				const expectedSubCommands = Object.values(docCommand.definition.subCommands);
				for (const subCommandDef of expectedSubCommands as any[]) {
					it(`has implementation for subcommand "${subCommandDef.name}"`, () => {
						const subCommandImpl = commandExport.subCommands.find(SubCmd => {
							const instance = new SubCmd();
							return instance.name === subCommandDef.name;
						});
						expect(
							subCommandImpl,
							`Subcommand "${subCommandDef.name}" is documented but has no implementation in ${commandName}`
						).toBeDefined();
					});
				}
			});
		}
	});

	describe('Subcommand options match documentation', () => {
		const docCommandsByName = new Map<string, CommandReference>(
			documentationCommands.map(cmd => [cmd.definition.metadata.name, cmd])
		);

		for (const commandExport of ChatCommandExports) {
			const commandInstance = new commandExport.command([]);
			const commandName = commandInstance.name;
			const docCommand = docCommandsByName.get(commandName);

			if (!docCommand) continue;

			for (const SubCommand of commandExport.subCommands) {
				const subCommandInstance = new SubCommand();
				const subCommandName = subCommandInstance.name;
				const subCommandDef =
					docCommand.definition.subCommands[
						subCommandName as keyof typeof docCommand.definition.subCommands
					];

				if (!subCommandDef || !subCommandDef.options) continue;

				describe(`${commandName} ${subCommandName}`, () => {
					it('metadata options match documentation options', () => {
						const metadataOptions = subCommandInstance.metadata.options ?? [];
						const docOptions = _.values(subCommandDef.options);

						// Check that all documented options exist in metadata
						for (const docOption of docOptions) {
							const metadataOption = metadataOptions.find(
								(opt: any) => opt.name === docOption.name
							);
							expect(
								metadataOption,
								`Option "${docOption.name}" is documented but missing from metadata in ${commandName} ${subCommandName}`
							).toBeDefined();

							if (metadataOption) {
								expect(
									metadataOption.type,
									`Option "${docOption.name}" type mismatch`
								).toBe(docOption.type);
								expect(
									metadataOption.required,
									`Option "${docOption.name}" required mismatch`
								).toBe(docOption.required);
							}
						}

						// Check counts match
						expect(
							metadataOptions.length,
							`${commandName} ${subCommandName} has ${metadataOptions.length} options but documentation defines ${docOptions.length}`
						).toBe(docOptions.length);
					});
				});
			}
		}
	});
});

describe('ActionCommand specific validation', () => {
	const actionExport = ChatCommandExports.find(exp => {
		const instance = new exp.command([]);
		return instance.name === 'action';
	});

	it('ActionCommand export exists', () => {
		expect(actionExport).toBeDefined();
	});

	it('all ActionCommand subcommands use correct option enum values', () => {
		if (!actionExport) return;

		const subCommands = actionExport.subCommands.map(SubCmd => new SubCmd());

		for (const subCommand of subCommands) {
			const metadata = subCommand.metadata;
			const options = metadata.options ?? [];

			// Verify each option name is valid
			for (const option of options) {
				const optionName = (option as any).name;
				const isValidOption = Object.values(ActionCommand.options).some(
					opt => opt.name === optionName
				);
				expect(
					isValidOption,
					`Option "${optionName}" in ${subCommand.name} is not a valid ActionCommand option`
				).toBe(true);
			}
		}
	});
});

describe('ActionStageCommand specific validation', () => {
	const actionStageExport = ChatCommandExports.find(exp => {
		const instance = new exp.command([]);
		return instance.name === 'action-stage';
	});

	it('ActionStageCommand export exists', () => {
		expect(actionStageExport).toBeDefined();
	});

	it('all ActionStageCommand subcommands use correct option enum values', () => {
		if (!actionStageExport) return;

		const subCommands = actionStageExport.subCommands.map(SubCmd => new SubCmd());

		for (const subCommand of subCommands) {
			const metadata = subCommand.metadata;
			const options = metadata.options ?? [];

			// Verify each option name is valid
			for (const option of options) {
				const optionName = (option as any).name;
				const isValidOption = Object.values(ActionStageCommand.options).some(
					opt => opt.name === optionName
				);
				expect(
					isValidOption,
					`Option "${optionName}" in ${subCommand.name} is not a valid ActionStageCommand option`
				).toBe(true);
			}
		}
	});

	it('all documented subcommands have implementations', () => {
		if (!actionStageExport) return;

		const documentedSubCommands = Object.values(ActionStageCommand.subCommandEnum);
		const implementedSubCommands = actionStageExport.subCommands.map(
			SubCmd => new SubCmd().name
		);

		for (const subCommandName of documentedSubCommands) {
			expect(
				implementedSubCommands,
				`Subcommand "${subCommandName}" is documented but not implemented`
			).toContain(subCommandName);
		}
	});
});

describe('Option enum consistency', () => {
	it('ActionCommand.commandOptionsEnum values match option keys', () => {
		const enumValues = Object.values(ActionCommand.commandOptionsEnum);
		const optionKeys = Object.keys(ActionCommand.options);

		expect(enumValues.sort()).toEqual(optionKeys.sort());
	});

	it('ActionStageCommand.commandOptionsEnum values match option keys', () => {
		const enumValues = Object.values(ActionStageCommand.commandOptionsEnum);
		const optionKeys = Object.keys(ActionStageCommand.options);

		expect(enumValues.sort()).toEqual(optionKeys.sort());
	});

	it('all commands have matching enum values and option keys', () => {
		for (const docCommand of documentationCommands) {
			const enumValues = Object.values(docCommand.commandOptionsEnum);
			const optionKeys = Object.keys(docCommand.options);

			expect(
				enumValues.sort(),
				`${docCommand.definition.metadata.name} has mismatched enum values and option keys`
			).toEqual(optionKeys.sort());
		}
	});
});
