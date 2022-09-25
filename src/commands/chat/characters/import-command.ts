import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { fetchWgCharacterFromToken } from './helpers.js';
import Config from '../../../config/config.json';

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
		const [tokenResults, existingCharacter] = await Promise.all([
			WgToken.query().where({ charId }),
			Character.query().where({ charId, userId: intr.user.id }),
		]);

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				`Yip! ${character.characterData.name} is already in the system! Did you mean to /update?`
			);
		} else if (!tokenResults.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				`Yip! Before you can import a character, you need to authenticate it. ` +
					`Give me permission to read your wanderer's guide character by following [this link](` +
					`${Config.wanderersGuide.oauthBaseUrl}?characterId=${charId}). ` +
					`Then, /import your character again!`
			);
		} else {
			// We have the authentication token! Fetch the user's sheet
			const token = tokenResults[0].accessToken;
			const character = await fetchWgCharacterFromToken(charId, token);

			// set current characters owned by user to inactive state
			await Character.query()
				.update({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				userId: intr.user.id,
				...character,
			});

			//send success message

			await InteractionUtils.send(
				intr,
				`Yip! I've successfully imported ${character.characterData.name}!`
			);
		}
	}
}
