import { WanderersGuide } from '../../../services/wanderers-guide/index';
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

export class SetActiveCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'set-active',
		description: `sets a character as the active character`,
		dm_permission: true,
		default_member_permissions: undefined,
		options: [ChatArgs.SET_ACTIVE_NAME_OPTION],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const charName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);

		// try and find that charcter
		const targetCharacter = (
			await Character.query().whereRaw(
				`user_id=:userId AND (character_data->'name')::TEXT ILIKE :charName`,
				{
					userId: intr.user.id,
					charName: `%${charName}%`,
				}
			)
		)[0];

		if (targetCharacter) {
			//set all other characters as not active
			await Character.query().update({ isActiveCharacter: false });

			//set the character as active
			await Character.query().updateAndFetchById(targetCharacter.id, {
				isActiveCharacter: true,
			});

			//send success message
			await InteractionUtils.send(
				intr,
				`Yip! ${targetCharacter.characterData.name} is now your active character!`
			);
		} else {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
		}
	}
}
