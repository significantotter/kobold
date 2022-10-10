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
import { InitiativeUtils } from '../../../utils/initiative-utils.js';
import { Initiative } from '../../../services/kobold/models/index.js';

export class InitEndSubCommand implements Command {
	public names = ['end'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'end',
		description: 'Ends the initiative in the current channel.',
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		try {
			await Initiative.query().deleteById(currentInit.id);
			await InteractionUtils.send(intr, `Yip! Ended the initiative!`);
		} catch (err) {
			await InteractionUtils.send(intr, `Yip! Something went wrong!`);
			console.error(err);
		}
	}
}
