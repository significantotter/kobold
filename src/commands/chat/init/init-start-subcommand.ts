import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { Kobold } from '../../../services/kobold/index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const startingUser = intr.user.id;
		if (!intr.channel || !intr.channel.id) {
			await InteractionUtils.send(
				intr,
				LL.commands.init.start.interactions.notServerChannelError()
			);
			return;
		}
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchDataForCommand(intr, {
			currentInitiative: true,
		});
		if (currentInitiative) {
			throw new KoboldError(LL.commands.init.start.interactions.initExistsError());
		}

		try {
			const init = await kobold.initiative.create({
				gmUserId: startingUser,
				channelId: intr.channelId,
				currentTurnGroupId: null,
				currentRound: 0,
			});

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
			else {
				console.warn(err);
				throw new KoboldError(LL.commands.init.start.interactions.otherError());
			}
		}
	}
}
