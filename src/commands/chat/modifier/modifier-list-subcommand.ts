import { KoboldEmbed } from './../../../utils/kobold-embed-utils';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import _ from 'lodash';

export class ModifierListSubCommand implements Command {
	public names = [Language.LL.commands.modifier.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.list.name(),
		description: Language.LL.commands.modifier.list.description(),
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
		const modifiers = activeCharacter.modifiers;
		const fields = [];
		for (const modifier of modifiers.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			fields.push({
				name: LL.commands.modifier.interactions.detailHeader({
					modifierName: modifier.name,
					modifierIsActive: modifier.isActive ? ' (active)' : '',
				}),
				value: LL.commands.modifier.interactions.detailBody({
					modifierDescriptionText: modifier.description,
					modifierType: modifier.type || 'untyped',
					modifierValue: modifier.value,
					modifierTargetTags: modifier.targetTags,
				}),
				inline: true,
			});
		}

		const embeds = [];

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.sheet.info.name}'s Available Modifiers`);
		embed.addFields(fields);

		await embed.sendBatches(intr);
	}
}
