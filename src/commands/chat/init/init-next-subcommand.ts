import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils';
import { ChatArgs } from '../../../constants/chat-args';
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
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';

export class InitNextSubCommand implements Command {
	public names = [Language.LL.commands.init.next.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.next.name(),
		description: Language.LL.commands.init.next.description(),
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
		const [initResult, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel, {
				sendErrors: true,
				LL,
			}),
			SettingsUtils.getSettingsForUser(intr),
		]);
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const initBuilder = new InitiativeBuilder({
			initiative: initResult.init,
			userSettings,
			LL,
		});
		const currentTurn = initBuilder.getCurrentTurnInfo();
		const nextTurn = initBuilder.getNextTurnChanges();
		if (nextTurn.errorMessage) {
			await InteractionUtils.send(intr, nextTurn.errorMessage);
			return;
		}

		const updatedInitiative = await Initiative.query()
			.patchAndFetchById(initResult.init.id, nextTurn)
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
		if (_.some(initBuilder.activeActors, actor => actor.hideStats)) {
			await KoboldEmbed.dmInitiativeWithHiddenStats({
				intr,
				initBuilder,
				currentTurn,
				targetTurn: nextTurn,
				LL,
			});
		}
	}
}
