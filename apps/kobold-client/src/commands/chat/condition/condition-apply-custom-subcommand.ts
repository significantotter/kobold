import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

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
import { compileExpression } from 'filtrex';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { Creature } from '../../../utils/creature.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ModifierHelpers } from '../modifier/modifier-helpers.js';
import { ModifierOptions } from '../modifier/modifier-command-options.js';

export class ConditionApplyCustomSubCommand implements Command {
	public names = [L.en.commands.condition.applyCustom.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.applyCustom.name(),
		description: L.en.commands.condition.applyCustom.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils } = koboldUtils;
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

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

		const description = intr.options.getString(
			ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name
		);
		const modifierSheetValues = intr.options.getString(
			ModifierOptions.MODIFIER_SHEET_VALUES_OPTION.name
		);

		if (!isSheetAdjustmentTypeEnum(modifierType)) {
			throw new KoboldError(
				`Yip! ${modifierType} is not a valid type! Please use one ` +
					`of the suggested options when entering the condition type or leave it blank.`
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
				await InteractionUtils.send(intr, LL.commands.condition.interactions.invalidTags());
				return;
			}

			// we must be able to evaluate the modifier as a roll for this character
			try {
				DiceUtils.parseAndEvaluateDiceExpression({
					rollExpression: String(rollAdjustment),
					extraAttributes: [
						{
							value: 1,
							type: modifierType,
							name: 'severity',
							tags: [],
							aliases: [],
						},
					],
					creature: Creature.fromSheetRecord(targetSheetRecord),
				});
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.condition.interactions.doesntEvaluateError()
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
		if (FinderHelpers.getModifierByName(targetSheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.condition.interactions.alreadyExists({
					conditionName: name,
					characterName: targetSheetRecord.sheet.staticInfo.name,
				})
			);
			return;
		}

		const newModifier: Modifier = {
			name,
			isActive: true,
			description,
			type: modifierType,
			severity: null,
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags,
			rollAdjustment,
		};
		if (modifierSeverity != null) {
			newModifier.severity = ModifierHelpers.validateSeverity(modifierSeverity);
		}

		// make sure that the adjustments are valid and can be applied to a sheet
		SheetUtils.adjustSheetWithModifiers(targetSheetRecord.sheet, [newModifier]);

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				modifiers: [...targetSheetRecord.modifiers, newModifier],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.condition.interactions.created({
				conditionName: name,
				characterName: targetSheetRecord.sheet.staticInfo.name,
			})
		);
		return;
	}
}
