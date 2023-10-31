import { ModifierOptions } from './modifier-command-options.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { CharacterModel, SheetAdjustment } from '../../../services/kobold/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';

export class ModifierCreateSheetModifierSubCommand implements Command {
	public names = [L.en.commands.modifier.createSheetModifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.createSheetModifier.name(),
		description: L.en.commands.modifier.createSheetModifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
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
		const modifierSheetValues = intr.options.getString(
			ModifierOptions.MODIFIER_SHEET_VALUES_OPTION.name,
			true
		);

		const parsedSheetAdjustments: SheetAdjustment[] =
			SheetUtils.stringToSheetAdjustments(modifierSheetValues);

		// make sure that the adjustments are valid and can be applied to a sheet
		SheetUtils.adjustSheetWithSheetAdjustments(activeCharacter.sheet, parsedSheetAdjustments);

		// make sure the name does't already exist in the character's modifiers
		if (activeCharacter.getModifierByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createRollModifier.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.sheet.staticInfo.name,
				})
			);
			return;
		}

		await CharacterModel.query().updateAndFetchById(activeCharacter.id, {
			modifiers: [
				...activeCharacter.modifiers,
				{
					name,
					isActive: true,
					description,
					type: modifierType,
					sheetAdjustments: parsedSheetAdjustments,
					modifierType: 'sheet',
				},
			],
		});

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.modifier.createRollModifier.interactions.created({
				modifierName: name,
				characterName: activeCharacter.sheet.staticInfo.name,
			})
		);
		return;
	}
}
