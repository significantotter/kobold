import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold } from '@kobold/db';

import _ from 'lodash';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class GameListSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const allGames = await kobold.game.readMany({
			gmUserId: intr.user.id,
			guildId: intr.guild?.id,
		});

		if (allGames.length === 0) {
			InteractionUtils.send(intr, GameDefinition.strings.noGames);
			return;
		}

		const gameListEmbed = new KoboldEmbed().setTitle(
			GameDefinition.strings.list.gameListEmbed.title
		);
		gameListEmbed.addFields(
			allGames.map(game => ({
				name: game.name + (game.isActive ? ' (active)' : ''),
				value:
					_.uniqBy(game.characters, 'id')
						.map(character => character.name)
						.join('\n') || GameDefinition.strings.list.gameListEmbed.noCharacters,
			}))
		);
		await gameListEmbed.sendBatches(intr);
	}
}
