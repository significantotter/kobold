import { ModifierOptions } from './modifier-command-options';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Character, Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { compileExpression } from 'filtrex';

export class ModifierCreateSubCommand implements Command {
	public names = [Language.LL.commands.modifier.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.create.name(),
		description: Language.LL.commands.modifier.create.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let name = intr.options
			.getString(ModifierOptions.MODIFIER_NAME_OPTION.name)
			.trim()
			.toLowerCase();
		let modifierType = (intr.options.getString(ModifierOptions.MODIFIER_TYPE_OPTION.name) || '')
			.trim()
			.toLowerCase();
		const description = intr.options.getString(
			ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name
		);
		const value = intr.options.getNumber(ModifierOptions.MODIFIER_VALUE_OPTION.name);
		let targetTags = intr.options
			.getString(ModifierOptions.MODIFIER_TARGET_TAGS_OPTION.name)
			.trim();

		// make sure the name does't already exist in the character's modifiers
		if (activeCharacter.getModifierByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.create.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.characterData.name,
				})
			);
			return;
		}

		try {
			compileExpression(targetTags);
		} catch (err) {
			// the tags are in an invalid format
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.create.interactions.invalidTags()
			);
			return;
		}
		if (activeCharacter.modifiers.length + 1 > 50) {
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.tooMany());
			return;
		}

		await Character.query().updateAndFetchById(activeCharacter.id, {
			modifiers: [
				...activeCharacter.modifiers,
				{
					name,
					isActive: true,
					description,
					value,
					type: modifierType,
					targetTags,
				},
			],
		});

		await InteractionUtils.send(
			intr,
			LL.commands.modifier.create.interactions.created({
				modifierName: name,
				characterName: activeCharacter.characterData.name,
			})
		);
		return;
		//send a response
		return;
	}
}
