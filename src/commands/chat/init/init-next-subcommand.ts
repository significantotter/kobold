import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-builder.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative, InitiativeModel } from '../../../services/kobold/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { SettingsUtils } from '../../../utils/kobold-service-utils/user-settings-utils.js';

export class InitNextSubCommand implements Command {
	public names = [L.en.commands.init.next.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.next.name(),
		description: L.en.commands.init.next.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const [currentInit, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			SettingsUtils.getSettingsForUser(intr),
		]);
		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			userSettings,
			LL,
		});
		const currentTurn = initBuilder.getCurrentTurnInfo();
		const nextTurn = initBuilder.getNextTurnChanges();

		const updatedInitiative = await InitiativeModel.query()
			.patchAndFetchById(currentInit.id, nextTurn)
			.withGraphFetched('[actors.[character], actorGroups]');

		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder);
		const activeGroup = initBuilder.activeGroup;

		await InteractionUtils.send(intr, {
			content: activeGroup ? `<@!${activeGroup.userId}>` : undefined,
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
