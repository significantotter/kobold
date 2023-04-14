import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { PasteBin } from '../../../services/pastebin/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Config } from '../../../config/config.js';

export class ActionExportSubCommand implements Command {
	public names = [Language.LL.commands.action.export.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.export.name(),
		description: Language.LL.commands.action.export.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
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
		const actions = activeCharacter.actions;

		const pastebinPost = await new PasteBin({ apiKey: Config.pastebin.apiKey }).post({
			code: JSON.stringify(actions),
			name: `${activeCharacter.characterData.name}'s Actions`,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.action.export.interactions.success({
				characterName: activeCharacter.characterData.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
