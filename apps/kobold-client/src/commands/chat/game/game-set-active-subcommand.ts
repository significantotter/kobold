import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GameSetActiveSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.setActive
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.gameTargetGame].name) {
			if (!intr.guildId) return [];

			const value = (option.value as string).trim().toLowerCase();

			// Get games the user owns in this guild
			const targetGames = await kobold.game.readMany({
				gmUserId: intr.user.id,
				guildId: intr.guildId,
			});

			return targetGames
				.map(game => ({
					name: game.name,
					value: game.name,
				}))
				.filter(field => value === '' || field.name.toLowerCase().includes(value));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const gameName = intr.options.getString(
			commandOptions[commandOptionsEnum.gameTargetGame].name,
			true
		);

		if (!intr.guildId) {
			throw new KoboldError('You can only set active games in a server!');
		}

		const targetGames = await kobold.game.readMany({
			guildId: intr.guildId,
			name: gameName,
		});
		const targetGame = targetGames.length ? targetGames[0] : null;

		if (!targetGame) {
			throw new KoboldError(GameDefinition.strings.notFound({ gameName }));
		}

		// Deactivate all user's games in this guild
		await kobold.game.updateMany(
			{ guildId: intr.guildId, gmUserId: intr.user.id },
			{ isActive: false }
		);

		// Set target game as active
		await kobold.game.update({ id: targetGame.id }, { isActive: true });

		await InteractionUtils.send(intr, GameDefinition.strings.setActive.success({ gameName }));
	}
}
