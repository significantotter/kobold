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
import { Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

export class ModifierListSubCommand implements Command {
	public names = [Language.LL.commands.modifier.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.list.name(),
		description: Language.LL.commands.modifier.list.description(),
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
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const modifiers = activeCharacter.modifiers;

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.characterData.name}'s Available Modifiers`);

		const fields = [];
		for (const modifier of modifiers) {
			fields.push({
				name: `${modifier.name}${modifier.isActive ? ' (active)' : ''}`,
				value: `${modifier.description ? modifier.description + '\n' : ''}${
					modifier.type ? `'Type: ${modifier.type}\n` : ''
				}Value: ${modifier.value}\nApplies to: ${modifier.targetTags.join(', ')}`,
			});
		}
		embed.addFields(fields);

		await InteractionUtils.send(intr, { embeds: [embed] });
	}
}