import { KoboldEmbed } from './../../../utils/kobold-embed-utils.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/kobold-service-utils/character-utils.js';
import { PasteBin } from '../../../services/pastebin/index.js';
import { Config } from '../../../config/config.js';

export class ModifierExportSubCommand implements Command {
	public names = [L.en.commands.modifier.export.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.export.name(),
		description: L.en.commands.modifier.export.description(),
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
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const modifiers = activeCharacter.modifiers;

		const pastebinPost = await new PasteBin({ apiKey: Config.pastebin.apiKey }).post({
			code: JSON.stringify(modifiers),
			name: `${activeCharacter.sheet.staticInfo.name}'s Modifiers`,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.modifier.export.interactions.success({
				characterName: activeCharacter.sheet.staticInfo.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
