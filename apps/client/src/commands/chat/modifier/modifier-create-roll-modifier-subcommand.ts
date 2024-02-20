import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { ModifierOptions } from './modifier-command-options.js';

import { compileExpression } from 'filtrex';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, ModifierTypeEnum, isSheetAdjustmentTypeEnum } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierCreateRollModifierSubCommand implements Command {
	public names = [L.en.commands.modifier.createRollModifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.createRollModifier.name(),
		description: L.en.commands.modifier.createRollModifier.description(),
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
			L.en.commandOptions.modifierType.choices.untyped.value()
		)
			.trim()
			.toLowerCase();
		const description = intr.options.getString(
			ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name
		);
		const value = intr.options.getString(ModifierOptions.MODIFIER_VALUE_OPTION.name);
		let targetTags = intr.options
			.getString(ModifierOptions.MODIFIER_TARGET_TAGS_OPTION.name, true)
			.trim();

		if (!isSheetAdjustmentTypeEnum(modifierType)) {
			throw new KoboldError(
				`Yip! ${modifierType} is not a valid modifier type! Please use one ` +
					`of the suggested options when entering the modifier type or leave it blank.`
			);
		}

		// make sure the name does't already exist in the character's modifiers
		if (FinderHelpers.getModifierByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createRollModifier.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.name,
				})
			);
			return;
		}

		// the tags for the modifier have to be valid
		try {
			compileExpression(targetTags);
		} catch (err) {
			// the tags are in an invalid format
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createRollModifier.interactions.invalidTags()
			);
			return;
		}

		// we must be able to evaluate the modifier as a roll for this character
		try {
			DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: String(value),
				creature: Creature.fromSheetRecord(activeCharacter.sheetRecord),
			});
		} catch (err) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createRollModifier.interactions.doesntEvaluateError()
			);
			return;
		}
		if (!value) throw new KoboldError(`Yip! I couldn't parse that modifier value!`);

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				modifiers: [
					...activeCharacter.sheetRecord.modifiers,
					{
						name,
						isActive: true,
						description,
						value,
						type: modifierType,
						modifierType: ModifierTypeEnum.roll,
						targetTags,
					},
				],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.modifier.createRollModifier.interactions.created({
				modifierName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
