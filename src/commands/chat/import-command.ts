import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { WanderersGuide } from '../../services/wanderers-guide/index.js';

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
		name: 'import',
		description: `imports a Wanderer's guide character`,
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
		const tokenResults = await WgToken.query().where('charId', '=', charId);

		if (!tokenResults.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				`Yip! Before you can import a character, you need to authenticate it. ` +
					`Give us permission to read your wanderer's guide character by following [this link](` +
					`https://kobold.netlify.app/.netlify/functions/oauth?characterId=${charId}). ` +
					`Then, /import your character again!`
			);
		} else {
			// We have the authentication token! Fetch the user's sheet
			console.log(tokenResults);
			console.log(tokenResults[0]);
			const token = tokenResults[0].accessToken;

			console.log(`found token ${token} for character id ${charId}`);

			//request sheet data from WG API

			const apiResponse = await new WanderersGuide(token).character.getAllEndpoints(charId);

			//store sheet in db

			//send success message

			await InteractionUtils.send(
				intr,
				`Yip! We have access to your sheet. ` +
					`Our kobolds are working to fetch your character's information`
			);
		}
	}
}
