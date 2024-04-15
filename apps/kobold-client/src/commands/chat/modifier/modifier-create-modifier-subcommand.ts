import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { ModifierOptions } from './modifier-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import {
	Kobold,
	Modifier,
	SheetAdjustment,
	SheetAdjustmentTypeEnum,
	isSheetAdjustmentTypeEnum,
} from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierHelpers } from './modifier-helpers.js';
import { compileExpression } from 'filtrex';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { Creature } from '../../../utils/creature.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

export class ModifierCreateModifierSubCommand implements Command {
	public names = [L.en.commands.modifier.createModifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.createModifier.name(),
		description: L.en.commands.modifier.createModifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		let name = intr.options
			.getString(ModifierOptions.MODIFIER_NAME_OPTION.name, true)
			.trim()
			.toLowerCase();
		let modifierType = (
			intr.options.getString(ModifierOptions.MODIFIER_TYPE_OPTION.name) ??
			SheetAdjustmentTypeEnum.untyped
		)
			.trim()
			.toLowerCase();
		const modifierSeverity =
			intr.options.getString(ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION.name) ?? null;

		const rollAdjustment = intr.options.getString(
			ModifierOptions.MODIFIER_ROLL_ADJUSTMENT.name
		);
		let rollTargetTagsUnparsed = intr.options.getString(
			ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION.name
		);
		let rollTargetTags = rollTargetTagsUnparsed ? rollTargetTagsUnparsed.trim() : null;

		let description = intr.options.getString(ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name);
		let note = intr.options.getString(ModifierOptions.MODIFIER_INITIATIVE_NOTE_OPTION.name);
		const modifierSheetValues = intr.options.getString(
			ModifierOptions.MODIFIER_SHEET_VALUES_OPTION.name
		);

		if (!isSheetAdjustmentTypeEnum(modifierType)) {
			throw new KoboldError(
				`Yip! ${modifierType} is not a valid modifier type! Please use one ` +
					`of the suggested options when entering the modifier type or leave it blank.`
			);
		}
		// check various failure conditions
		// we can't have target tags but no roll adjustment
		if (rollTargetTags && !rollAdjustment) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide a roll adjustment if you want to use target tags!'
			);
			return;
		}
		// we can't have a roll adjustment but no target tags
		if (rollAdjustment && !rollTargetTags) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide target tags if you want to use a roll adjustment!'
			);
			return;
		}
		// we can't have neither a roll adjustment nor a sheet adjustment
		if (!rollAdjustment && !modifierSheetValues) {
			await InteractionUtils.send(
				intr,
				'Yip! You need to provide either a roll adjustment or a sheet adjustment!'
			);
			return;
		}

		if (rollAdjustment && rollTargetTags) {
			// the tags for the modifier have to be valid
			if (!InputParseUtils.isValidRollTargetTags(rollTargetTags)) {
				throw new KoboldError(
					LL.commands.modifier.createModifier.interactions.invalidTags()
				);
			}
			if (
				!InputParseUtils.isValidDiceExpression(
					rollAdjustment,
					new Creature(activeCharacter.sheetRecord)
				)
			) {
				throw new KoboldError(
					LL.commands.modifier.createModifier.interactions.doesntEvaluateError()
				);
			}
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (modifierSheetValues) {
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				modifierSheetValues,
				activeCharacter.sheetRecord.sheet
			);
		}
		// make sure the name does't already exist in the character's modifiers
		if (FinderHelpers.getModifierByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createModifier.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.name,
				})
			);
			return;
		}

		const newModifier: Modifier = {
			name,
			isActive: true,
			description: InputParseUtils.parseAsNullableString(description, { maxLength: 300 }),
			type: modifierType,
			severity: InputParseUtils.parseAsNullableNumber(modifierSeverity),
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags,
			rollAdjustment,
			note: InputParseUtils.parseAsNullableString(note, { maxLength: 40 }),
		};

		// make sure that the adjustments are valid and can be applied to a sheet
		SheetUtils.adjustSheetWithModifiers(activeCharacter.sheetRecord.sheet, [newModifier]);

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				modifiers: [...activeCharacter.sheetRecord.modifiers, newModifier],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.modifier.createModifier.interactions.created({
				modifierName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
