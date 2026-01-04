import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GameCreateSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.create
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const gameName = intr.options.getString(
			commandOptions[commandOptionsEnum.createName].name,
			true
		);

		if (!intr.guildId) {
			throw new KoboldError('You can only create games in a server!');
		}

		if (gameName.length < 2) {
			await InteractionUtils.send(intr, GameDefinition.strings.create.gameNameTooShort);
			return;
		}

		// Check if a game with this name already exists
		const existingGames = await kobold.game.readMany({
			guildId: intr.guildId,
			name: gameName,
		});

		if (existingGames.length > 0) {
			await InteractionUtils.send(intr, GameDefinition.strings.create.gameAlreadyExists);
			return;
		}

		// Deactivate existing games for this user
		await kobold.game.updateMany(
			{ gmUserId: intr.user.id, guildId: intr.guildId },
			{ isActive: false }
		);

		// Create the new game
		await kobold.game.create({
			name: gameName,
			gmUserId: intr.user.id,
			guildId: intr.guildId,
			isActive: true,
		});

		await InteractionUtils.send(intr, GameDefinition.strings.create.success({ gameName }));
	}
}
