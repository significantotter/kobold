import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

import { EventData } from '../../../models/internal-models.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class InitStartSubCommand implements Command {
	public names = [Language.LL.commands.init.start.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.start.name(),
		description: Language.LL.commands.init.show.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
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

		const initBuilder = new InitiativeBuilder({ LL });
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);

		const message = await InteractionUtils.send(intr, embed);

		try {
			const init = await Initiative.query()
				.withGraphFetched('[actors, actorGroups]')
				.insertAndFetch({
					gmUserId: startingUser,
					channelId: intr.channel.id,
					roundMessageIds: [],
				});
			initBuilder.set({ initiative: init, actors: init.actors, groups: init.actorGroups });
			const updatedEmbed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);
			await message.edit({ embeds: [updatedEmbed] });
		} catch (err) {
			if (err.name === 'UniqueViolationError') {
				await Promise.all([
					message.edit(LL.commands.init.start.interactions.initExistsError()),
					message.suppressEmbeds(true),
				]);
			} else {
				await Promise.all([
					message.edit(LL.commands.init.start.interactions.otherError()),
					message.suppressEmbeds(true),
				]);
				console.error(err);
			}
		}
	}
}
