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
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GameJoinSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.join
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetGame].name) {
			const value = (option.value as string).trim().toLowerCase();

			const { gameUtils } = new KoboldUtils(kobold);

			// Get games where user doesn't have a character
			const targetGames = await gameUtils.getWhereUserLacksCharacter(
				intr.user.id,
				intr.guildId ?? ''
			);

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
			commandOptions[commandOptionsEnum.targetGame].name,
			true
		);

		if (!intr.guildId) {
			throw new KoboldError('You can only join games in a server!');
		}

		const koboldUtils = new KoboldUtils(kobold);

		const targetGames = await kobold.game.readMany({
			guildId: intr.guildId,
			name: gameName,
		});
		const targetGame = targetGames.length ? targetGames[0] : null;

		if (!targetGame) {
			await InteractionUtils.send(intr, GameDefinition.strings.notFound({ gameName }));
			return;
		}

		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		// Check if character is already in the game
		if ((targetGame.characters || []).some(char => char.id === activeCharacter.id)) {
			await InteractionUtils.send(
				intr,
				GameDefinition.strings.join.alreadyInGame({
					characterName: activeCharacter.name,
					gameName: targetGame.name,
				})
			);
			return;
		}

		// Add character to game
		await kobold.character.update({ id: activeCharacter.id }, { gameId: targetGame.id });

		await InteractionUtils.send(
			intr,
			GameDefinition.strings.join.success({
				characterName: activeCharacter.name,
				gameName: targetGame.name,
			})
		);
	}
}
