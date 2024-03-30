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

export class ConditionApplyModifierSubCommand implements Command {
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
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllModifiersForAllCharacters(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils, characterUtils } = koboldUtils;
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

		const targetModifierName = intr.options.getString(
			ModifierOptions.MODIFIER_NAME_OPTION.name,
			true
		);
		const [characterName, modifierName] = targetModifierName.split(' - ').map(s => s.trim());

		const sourceCharacter = (
			await characterUtils.findOwnedCharacterByName(characterName, intr.user.id)
		)[0];
		const modifier = FinderHelpers.getModifierByName(sourceCharacter.sheetRecord, modifierName);
		if (!modifier) {
			throw new KoboldError(
				`Yip! I couldn't find the modifier ${modifierName} on ${characterName}!`
			);
			return;
		}

		const modifierSeverity =
			intr.options.getString(ModifierOptions.MODIFIER_SEVERITY_VALUE.name) ?? null;

		const modifierSeverityValidated = ModifierHelpers.validateSeverity(modifierSeverity);

		// make sure the name does't already exist in the character's modifiers
		if (FinderHelpers.getModifierByName(targetSheetRecord, modifierName)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createModifier.interactions.alreadyExists({
					modifierName: modifierName,
					characterName: characterName,
				})
			);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				conditions: [...targetSheetRecord.conditions, modifier],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.modifier.createModifier.interactions.created({
				modifierName: modifierName,
				characterName: targetSheetRecord.sheet.staticInfo.name,
			})
		);
		return;
	}
}
