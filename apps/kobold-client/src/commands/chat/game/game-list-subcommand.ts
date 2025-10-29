import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold } from '@kobold/db';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class GameListSubCommand extends BaseCommandClass(
	GameCommand,
	GameCommand.subCommandEnum.list
) {
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
