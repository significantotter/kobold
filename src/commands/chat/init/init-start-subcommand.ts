import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';

import { InitWithActorsAndGroups, Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeUtils } from '../../../utils/initiative-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class InitStartSubCommand implements Command {
	public names = [L.en.commands.init.start.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.start.name(),
		description: L.en.commands.init.show.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const startingUser = intr.user.id;
		if (!intr.channel || !intr.channel.id) {
			await InteractionUtils.send(
				intr,
				LL.commands.init.start.interactions.notServerChannelError()
			);
			return;
		}

		try {
			const init = await Initiative.query()
				.insertAndFetch({
					gmUserId: startingUser,
					channelId: intr.channelId,
					currentTurnGroupId: null,
					currentRound: 0,
				} as Initiative)
				.first();

			const initBuilder = new InitiativeBuilder({
				initiative: init,
				actors: init.actors,
				groups: init.actorGroups,
				LL,
			});
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);
			const message = await InteractionUtils.send(intr, embed);

			const updatedEmbed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);
			message
				? await message.edit({ embeds: [updatedEmbed] })
				: InteractionUtils.send(intr, updatedEmbed);
		} catch (err) {
			if (err instanceof KoboldError) throw err;
			if (err instanceof Error && err.name === 'UniqueViolationError') {
				throw new KoboldError(LL.commands.init.start.interactions.initExistsError());
			} else {
				console.warn(err);
				throw new KoboldError(LL.commands.init.start.interactions.otherError());
			}
		}
	}
}
