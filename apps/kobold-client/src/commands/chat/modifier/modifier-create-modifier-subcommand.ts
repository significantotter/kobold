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
			intr.options.getString(ModifierOptions.MODIFIER_SEVERITY_VALUE.name) ?? null;

		const rollAdjustment = intr.options.getString(
			ModifierOptions.MODIFIER_ROLL_ADJUSTMENT.name
		);
		let rollTargetTagsUnparsed = intr.options.getString(
			ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION.name
		);
		let rollTargetTags = rollTargetTagsUnparsed ? rollTargetTagsUnparsed.trim() : null;

		const modifierSeverityValidated = ModifierHelpers.validateSeverity(modifierSeverity);

		const description = intr.options.getString(
			ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name
		);
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
			try {
				compileExpression(rollTargetTags);
			} catch (err) {
				// the tags are in an invalid format
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createModifier.interactions.invalidTags()
				);
				return;
			}

			// we must be able to evaluate the modifier as a roll for this character
			try {
				DiceUtils.parseAndEvaluateDiceExpression({
					rollExpression: String(rollAdjustment),
					extraAttributes: [
						{
							value: modifierSeverityValidated ?? 0,
							type: modifierType,
							name: 'severity',
							tags: [],
							aliases: [],
						},
					],
					creature: Creature.fromSheetRecord(activeCharacter.sheetRecord),
				});
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createModifier.interactions.doesntEvaluateError()
				);
				return;
			}
			if (!rollAdjustment)
				throw new KoboldError(`Yip! I couldn't parse that modifier value!`);
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (modifierSheetValues) {
			parsedSheetAdjustments = SheetUtils.stringToSheetAdjustments(modifierSheetValues);
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
			description,
			type: modifierType,
			severity: modifierSeverityValidated,
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags,
			rollAdjustment,
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
