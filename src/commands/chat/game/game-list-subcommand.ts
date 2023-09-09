import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import _ from 'lodash';

export class GameListSubCommand implements Command {
	public names = [Language.LL.commands.game.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.game.list.name(),
		description: Language.LL.commands.game.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const allGames = await Game.query().withGraphFetched('characters').where({
			gmUserId: intr.user.id,
			guildId: intr.guild.id,
		});

		if (allGames.length === 0) {
			InteractionUtils.send(intr, Language.LL.commands.game.interactions.noGames());
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
