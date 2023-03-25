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

export class ActionAddRollSubCommand implements Command {
	public names = [Language.LL.commands.action.addRoll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.addRoll.name(),
		description: Language.LL.commands.action.addRoll.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {}
}
