import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../constants/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { MessageEmbed } from 'discord.js';
import { WgToken } from '../../services/kobold/models/index.js';

export class ImportCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Lang.getRef('chatCommands.test', Language.Default),
		name_localizations: Lang.getRefLocalizationMap('chatCommands.test'),
		description: Lang.getRef('commandDescs.test', Language.Default),
		description_localizations: Lang.getRefLocalizationMap('commandDescs.test'),
		dm_permission: true,
		default_member_permissions: undefined,
		options: [
			{
				...ChatArgs.IMPORT_OPTION,
				required: true,
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const charId = intr.options.getInteger(ChatArgs.IMPORT_OPTION.name);

		//check if we have a token
		const token = await WgToken.query().where('charId', '=', charId);

		console.log(`found token ${token} for character id ${charId}`);

		//if we don't have a token, send the user an auth link with a 'try again' button

		//(if we do have a token)

		//request sheet data from WG API

		//store sheet in db

		//send success message

		await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.test', data.lang()));
	}
}
