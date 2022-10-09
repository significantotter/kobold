import { KoboldEmbed } from './../../../utils/kobold-embed-utils';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { raw } from 'objection';

import { EventData } from '../../../models/internal-models.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils.getInitiativeForChannel, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class InitShowSubCommand implements Command {
	public names = ['show'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'show',
		description: `Displays the current initiative`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const initBuilder = new InitiativeBuilder({ initiative: initResult.init });
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
		await InteractionUtils.send(intr, { embeds: [embed] });
	}
}
