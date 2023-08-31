import { ModifierOptions } from './modifier-command-options.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Character } from '../../../services/kobold/models/index.js';
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Creature } from '../../../utils/creature.js';

export class ModifierCreateSheetModifierSubCommand implements Command {
	public names = [Language.LL.commands.modifier.createSheetModifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.createSheetModifier.name(),
		description: Language.LL.commands.modifier.createSheetModifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
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
		let name = (intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '')
			.trim()
			.toLowerCase();
		let modifierType = (intr.options.getString(ModifierOptions.MODIFIER_TYPE_OPTION.name) ?? '')
			.trim()
			.toLowerCase();
		const description = intr.options.getString(
			ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name
		);
		const modifierSheetValues = intr.options.getString(
			ModifierOptions.MODIFIER_SHEET_VALUES_OPTION.name
		);

		const creature = new Creature(activeCharacter.sheet);

		const parsedSheetValues: Character['modifiers'][0]['sheetAdjustments'] =
			StringUtils.parseSheetModifiers(modifierSheetValues, creature);

		// make sure the name does't already exist in the character's modifiers
		if (activeCharacter.getModifierByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.createRollModifier.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.sheet.info.name,
				})
			);
			return;
		}

		await Character.query().updateAndFetchById(activeCharacter.id, {
			modifiers: [
				...activeCharacter.modifiers,
				{
					name,
					isActive: true,
					description,
					type: modifierType,
					sheetAdjustments: parsedSheetValues,
					modifierType: 'sheet',
				},
			],
		});

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.modifier.createRollModifier.interactions.created({
				modifierName: name,
				characterName: activeCharacter.sheet.info.name,
			})
		);
		return;
	}
}
