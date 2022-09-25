import { WanderersGuide } from '../../../services/wanderers-guide/index';
import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { EventData } from '../../../models/internal-models.js';
import { Lang } from '../../../services/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { MessageEmbed } from 'discord.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { fetchWgCharacterFromToken } from './helpers.js';
import Config from '../../../config/config.json';

export class RemoveCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'remove',
		description: `removes an already imported character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have an active character
		const existingCharacter = await Character.query().where({
			userId: intr.user.id,
			isActiveCharacter: true,
		});
		const targetCharacter = existingCharacter[0];

		if (targetCharacter) {
			//check for token access
			await Character.query().deleteById(targetCharacter.id);

			//set another character as active
			const newActive = await Character.query().first().where({ userId: intr.user.id });
			await Character.query().updateAndFetchById(newActive.id, { isActiveCharacter: true });

			//send success message

			await InteractionUtils.send(
				intr,
				`Yip! I've successfully removed ${targetCharacter.characterData.name}! You can import them again at any time.`
			);
		} else {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
		}
	}
}
