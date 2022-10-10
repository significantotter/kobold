import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class InitStartSubCommand implements Command {
	public names = ['start'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'start',
		description: `Start an Initiative`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const startingUser = intr.user.id;
		if (!intr.channel || !intr.channel.id) {
			await InteractionUtils.send(
				intr,
				'Yip! You can only start initiative in a normal server channel.'
			);
			return;
		}

		const initBuilder = new InitiativeBuilder({});
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);

		const message = await InteractionUtils.send(intr, embed);

		try {
			const init = await Initiative.query()
				.withGraphFetched('[actors, actorGroups]')
				.insertAndFetch({
					gmUserId: startingUser,
					channelId: intr.channel.id,
					roundMessageIds: [message.id],
				});
			initBuilder.set({ initiative: init, actors: init.actors, groups: init.actorGroups });
			const updatedEmbed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			await message.edit({ embeds: [updatedEmbed] });
		} catch (err) {
			if (err.name === 'UniqueViolationError') {
				await Promise.all([
					message.edit(
						"Yip! There's already an initiative in this channel. End it before you start a new one!"
					),
					message.suppressEmbeds(true),
				]);
			} else {
				await Promise.all([
					message.edit('Yip! Something when wrong when starting your initiative!'),
					message.suppressEmbeds(true),
				]);
				console.error(err);
			}
		}
	}
}
