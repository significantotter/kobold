import { KoboldEmbed } from './../../../utils/kobold-embed-utils.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';

export class InitShowSubCommand implements Command {
	public names = [L.en.commands.init.show.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.show.name(),
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
		const currentInit = await InitiativeUtils.getInitiativeForChannel(intr.channel);

		const initBuilder = new InitiativeBuilder({ initiative: currentInit, LL });
		await KoboldEmbed.sendInitiative(intr, initBuilder, LL, {
			dmIfHiddenCreatures: initBuilder.init.gmUserId === intr.user.id,
		});
	}
}
