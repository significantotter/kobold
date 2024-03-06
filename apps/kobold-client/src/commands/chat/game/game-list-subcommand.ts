import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from 'kobold-db';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class GameListSubCommand implements Command {
	public names = [L.en.commands.game.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.list.name(),
		description: L.en.commands.game.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const allGames = await kobold.game.readMany({
			gmUserId: intr.user.id,
			guildId: intr.guild?.id,
		});

		if (allGames.length === 0) {
			InteractionUtils.send(intr, L.en.commands.game.interactions.noGames());
			return;
		}

		const gameListEmbed = new KoboldEmbed().setTitle(
			LL.commands.game.list.interactions.gameListEmbed.title()
		);
		gameListEmbed.addFields(
			allGames.map(game => ({
				name: game.name + (game.isActive ? ' (active)' : ''),
				value:
					_.uniqBy(game.characters, 'id')
						.map(character => character.name)
						.join('\n') ||
					LL.commands.game.list.interactions.gameListEmbed.noCharacters(),
			}))
		);
		await gameListEmbed.sendBatches(intr);
	}
}
