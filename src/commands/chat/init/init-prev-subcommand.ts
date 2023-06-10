import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils';
import { ChatArgs } from '../../../constants/chat-args';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	EmbedBuilder,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class InitPrevSubCommand implements Command {
	public names = [Language.LL.commands.init.prev.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.prev.name(),
		description: Language.LL.commands.init.prev.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const initBuilder = new InitiativeBuilder({ initiative: initResult.init, LL });
		const previousTurn = initBuilder.getPreviousTurnChanges();
		if (previousTurn.errorMessage) {
			await InteractionUtils.send(intr, previousTurn.errorMessage);
			return;
		}

		const updatedInitiative = await Initiative.query()
			.patchAndFetchById(initResult.init.id, previousTurn)
			.withGraphFetched('[actors.[character], actorGroups]');

		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder);
		const activeGroup = initBuilder.activeGroup;

		await InteractionUtils.send(intr, {
			content: `<@!${activeGroup.userId}>`,
			embeds: [currentTurnEmbed],
		});
	}
}
