import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

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
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const initBuilder = new InitiativeBuilder({ initiative: currentInitiative, LL });
		await KoboldEmbed.sendInitiative(intr, initBuilder, LL, {
			dmIfHiddenCreatures: initBuilder.init.gmUserId === intr.user.id,
		});
	}
}
