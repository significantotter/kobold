import { ModifierOptions } from './modifier-command-options';
import { KoboldEmbed } from './../../../utils/kobold-embed-utils';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { raw } from 'objection';

import { EventData } from '../../../models/internal-models.js';
import { Character, Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

const targetTagsRegex = /([\W\d], ?)*([\W\d])/;
const replaceTargetTagsRegex = /["'`]/g;

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
		const description = intr.options
			.getString(ModifierOptions.MODIFIER_DESCRIPTION_OPTION.name)
			.trim();
		const value = intr.options.getNumber(ModifierOptions.MODIFIER_VALUE_OPTION.name);
		let targetTags = intr.options
			.getString(ModifierOptions.MODIFIER_TARGET_TAGS_OPTION.name)
			.trim();

		// make sure the name does't already exist in the character's modifiers
		if (activeCharacter.modifiers.find(modifier => modifier.name.toLowerCase() === name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.create.interactions.alreadyExists({
					modifierName: name,
					characterName: activeCharacter.characterData.name,
				})
			);
			return;
		}

		// parse the target tags
		targetTags = targetTags.replaceAll(replaceTargetTagsRegex, '');
		if (!targetTags || !targetTagsRegex.test(targetTags)) {
			// the tags are in an invalid format
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.create.interactions.invalidTags()
			);
			return;
		}
		const splitTags = targetTags.split(/, */).filter(tag => tag !== '');

		await Character.query().updateAndFetchById(activeCharacter.id, {
			modifiers: [
				...activeCharacter.modifiers,
				{
					name,
					description,
					value,
					targetTags: splitTags,
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
