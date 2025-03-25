import { GameplayCommandOptionEnum } from '../gameplay/index.js';
import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import { ModifierCommandOptionEnum } from '../modifier/index.js';
import {
	conditionCommandDefinition,
	ConditionSubCommandEnum,
} from './condition.command-definition.js';
import { ConditionCommandOptionEnum } from './condition.command-options.js';

export const conditionCommandDocumentation: CommandDocumentation<
	typeof conditionCommandDefinition
> = {
	name: 'condition',
	description: 'Commands for applying conditions to characters or creatures.',
	subCommands: {
		[ConditionSubCommandEnum.applyCustom]: {
			name: ConditionSubCommandEnum.applyCustom,
			description: 'Applies a custom condition to a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Blinded to Kobold Cavern Mage..',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Blinded',
						[ModifierCommandOptionEnum.sheetValues]: 'perception - 4',
						[ModifierCommandOptionEnum.type]: '',
						[ModifierCommandOptionEnum.description]:
							"All normal terrain is difficult terrain to you. You can't detect anything using vision. You automatically critically fail sight Perception checks, you take a –4 status penalty to Perception checks. You are immune to visual effects.",
						[ModifierCommandOptionEnum.initiativeNote]:
							'Immune to visual. All terrain difficult.',
					},
				},
				{
					title: 'Severity',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Frightened to Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Frightened',
						[ModifierCommandOptionEnum.sheetValues]: '-[severity] to checks and DCs',
						[ModifierCommandOptionEnum.type]: 'status',
						[ModifierCommandOptionEnum.rollAdjustment]: '-[severity]',
						[ModifierCommandOptionEnum.targetTags]: 'attack and not damage',
						[ModifierCommandOptionEnum.severity]: 1,
					},
				},
			],
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: ConditionSubCommandEnum.applyModifier,
			description: 'Applies your existing modifier to a target as a condition',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Off Guard to Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Lilac Sootsnout - Off Guard',
					},
				},
			],
		},
		[ConditionSubCommandEnum.list]: {
			name: ConditionSubCommandEnum.list,
			description: "Lists all of a character's conditions",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
					},
					embeds: [
						{
							title: "Kobold Cavern Mage's Conditions",
							// @ts-expect-error
							image: 'https://2e.aonprd.com/Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [
								{
									name: 'Blinded',
									value: "All normal terrain is difficult terrain to you. You can't detect anything using vision. You automatically critically fail sight Perception checks, you take a –4 status penalty to Perception checks. You are immune to visual effects.\n\nType: `status`\n\nSheet Adjustments: `perceptionBonus - 4`",
									inline: true,
									inlineIndex: 1,
								},
								{
									name: 'Off Guard',
									value: 'Type: `circumstance`\n\nSheet Adjustments: `ac - 2`',
									inline: true,
									inlineIndex: 2,
								},
							],
						},
					],
				},
			],
		},
		[ConditionSubCommandEnum.set]: {
			name: ConditionSubCommandEnum.set,
			description: 'Sets a property of a condition on a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						"Yip! Kobold Cavern Mage had their condition Blinded's sheet-values set to perceptionBonus - 4.",
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Blinded',
						[ModifierCommandOptionEnum.setOption]: 'sheet-values',
						[ModifierCommandOptionEnum.setValue]: 'perceptionBonus - 4',
					},
				},
			],
		},
		[ConditionSubCommandEnum.remove]: {
			name: ConditionSubCommandEnum.remove,
			description: 'Removes a condition from a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I removed the condition Blinded from Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Blinded',
					},
				},
			],
		},
		[ConditionSubCommandEnum.severity]: {
			name: ConditionSubCommandEnum.severity,
			description: 'Changes the severity of a condition on a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I changed the severity of Frightened to 2 for Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Frightened',
						[ModifierCommandOptionEnum.severity]: 2,
					},
				},
			],
		},
	},
};

/**
 * Command Definition:
 *import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import L from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from '../modifier/modifier-command-options.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionOptions } from './condition-command-options.js';

export class ConditionCommand implements Command {
	public name = L.en.commands.condition.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.name(),
		description: L.en.commands.condition.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.condition.applyCustom.name(),
				description: L.en.commands.condition.applyCustom.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_ROLL_ADJUSTMENT,
					ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
					ModifierOptions.MODIFIER_INITIATIVE_NOTE_OPTION,
				],
			},
			{
				name: L.en.commands.condition.applyModifier.name(),
				description: L.en.commands.condition.applyModifier.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.condition.list.name(),
				description: L.en.commands.condition.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameplayOptions.GAMEPLAY_TARGET_CHARACTER],
			},
			{
				name: L.en.commands.condition.set.name(),
				description: L.en.commands.condition.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.condition.remove.name(),
				description: L.en.commands.condition.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
				],
			},
			{
				name: L.en.commands.condition.severity.name(),
				description: L.en.commands.condition.severity.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					{ ...ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION, required: true },
				],
			},
		],
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		services: InjectedServices
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option, services);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		services: InjectedServices
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL, services);
		}
	}
}
 *
 *
 * L.en.commandOptions
 * 
	modifierName: {
		name: 'name',
		description: 'The name of the modifier.',
	},
	conditionName: {
		name: 'name',
		description: 'The name of the condition.',
	},
	modifierType: {
		name: 'type',
		description: 'The optional type (status, item, or circumstance) of the modifier.',
		choices: {
			status: {
				name: 'status',
				value: 'status',
			},
			item: {
				name: 'item',
				value: 'item',
			},
			circumstance: {
				name: 'circumstance',
				value: 'circumstance',
			},
			untyped: {
				name: 'untyped',
				value: 'untyped',
			},
		},
	},
	modifierDescription: {
		name: 'description',
		description: 'A description for the modifier.',
	},
	modifierInitiativeNote: {
		name: 'initiative-note',
		description: 'A note to display in initiative when active.',
	},
	modifierRollAdjustment: {
		name: 'roll-adjustment',
		description: 'The amount to adjust a dice roll. Can be a number or a dice expression.',
	},
	modifierSeverity: {
		name: 'severity',
		description: 'A measure of a modifier\'s effect. Use "[severity]" in the value.',
	},
	modifierTargetTags: {
		name: 'roll-target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
	},
	modifierSheetValues: {
		name: 'sheet-values',
		description: 'How to alter the sheet values. For example "maxHp+5;ac=20;will-1"',
	},
	modifierSetOption: {
		name: 'option',
		description: 'The modifier option to alter.',
		choices: {
			name: {
				name: 'name',
				value: 'name',
			},
			description: {
				name: 'description',
				value: 'description',
			},
			type: {
				name: 'type',
				value: 'type',
			},
			rollAdjustment: {
				name: 'roll-adjustment',
				value: 'roll-adjustment',
			},
			rollTargetTags: {
				name: 'roll-target-tags',
				value: 'roll-target-tags',
			},
			sheetValues: {
				name: 'sheet-values',
				value: 'sheet-values',
			},
			severity: {
				name: 'severity',
				value: 'severity',
			},
			note: {
				name: 'initiative-note',
				value: 'initiative-note',
			},
		},
	},
	modifierSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},
	modifierCustomOption: {
		name: 'custom',
		description: 'Whether to view custom created modifiers, default modifiers, or both.',
		choices: {
			custom: {
				name: 'custom',
				value: 'custom',
			},
			default: {
				name: 'default',
				value: 'default',
			},
			both: {
				name: 'both',
				value: 'both',
			},
		},
	},
	modifierImportMode: {
		name: 'import-mode',
		description: 'What to do when importing data.',
		choices: {
			fullyReplace: {
				name: 'overwrite-all',
				value: 'overwrite-all',
			},
			overwrite: {
				name: 'overwrite-on-conflict',
				value: 'overwrite-on-conflict',
			},
			renameOnConflict: {
				name: 'rename-on-conflict',
				value: 'rename-on-conflict',
			},
			ignoreOnConflict: {
				name: 'ignore-on-conflict',
				value: 'ignore-on-conflict',
			},
		},
	},
	modifierImportUrl: {
		name: 'url',
		description: 'The pastebin url with the modifier code to import.',
	},
 *
 * L.en.condition
 *export default {
	name: 'condition',
	description: 'Commands for applying conditions to characters or creatures.',
	interactions: {
		created: 'Yip! I applied the condition {conditionName} for {characterName}.',
		alreadyExists: 'Yip! A condition named {conditionName} already exists for {characterName}.',
		invalidTags:
			"Yip! I didn't understand the target tag expression you provided. Tags can be" +
			' any expression in a format like "attack or skill".',
		doesntEvaluateError: 'Yip! That condition is not a valid number or dice roll.',
		removeConfirmation: {
			text: `Are you sure you want to remove the condition {conditionName}?`,
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Condition removal request expired.',
		},
		cancel: 'Yip! Canceled the request to remove the condition!',
		success: 'Yip! I removed the condition {conditionName}.',
		notFound: "Yip! I couldn't find a condition with that name.",
	},
	applyCustom: {
		name: 'apply-custom',
		description: 'Applies a custom condition to a target',
	},
	applyModifier: {
		name: 'apply-modifier',
		description: 'Applies your existing modifier to a target as a condition',
	},
	list: {
		name: 'list',
		description: "Lists all of a character's conditions",
	},
	set: {
		name: 'set',
		description: 'Sets a property of a condition on a target',
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to update.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A condition with that name already exists.',
			valueNotNumberError: 'Yip! You can only update a condition value with a number.',
			successEmbed: {
				title: "Yip! {characterName} had their condition {conditionName}'s {fieldToChange} set to {newFieldValue}.",
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a condition from a target',
	},
	severity: {
		name: 'severity',
		description: 'Changes the severity of a condition on a target',
	},
};
 *
 */
