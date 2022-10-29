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
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class InitEndSubCommand implements Command {
	public names = [Language.LL.commands.init.end.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.end.name(),
		description: Language.LL.commands.init.end.description(),
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
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		try {
			await Initiative.query().deleteById(currentInit.id);
			await InteractionUtils.send(intr, Language.LL.commands.init.end.interactions.success());
		} catch (err) {
			await InteractionUtils.send(intr, Language.LL.commands.init.end.interactions.error());
			console.error(err);
		}
	}
}
