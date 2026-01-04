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

export class GameKickSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.kick
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const value = (option.value as string).trim().toLowerCase();

		if (option.name === commandOptions[commandOptionsEnum.targetGame].name) {
			if (!intr.guildId) return [];

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

		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			if (!intr.guildId) return [];

			const selectedGameName =
				intr.options.getString(commandOptions[commandOptionsEnum.targetGame].name) ?? '';

			// Get the selected game
			const targetGames = await kobold.game.readMany({
				gmUserId: intr.user.id,
				guildId: intr.guildId,
				name: selectedGameName,
			});

			if (targetGames.length === 0) return [];

			const targetGame = targetGames[0];

			// Return characters in this game
			return (targetGame.characters || [])
				.map(char => ({
					name: char.name,
					value: char.name,
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
		const characterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);

		if (!intr.guildId) {
			throw new KoboldError('You can only kick characters from games in a server!');
		}

		const targetGames = await kobold.game.readMany({
			guildId: intr.guildId,
			gmUserId: intr.user.id,
			name: gameName,
		});

		if (targetGames.length === 0) {
			await InteractionUtils.send(intr, GameDefinition.strings.notFound({ gameName }));
			return;
		}

		const targetGame = targetGames[0];

		// Find the character in the game
		const targetCharacter = (targetGame.characters || []).find(
			char => char.name.toLowerCase().trim() === characterName.toLowerCase().trim()
		);

		if (!targetCharacter) {
			await InteractionUtils.send(
				intr,
				GameDefinition.strings.kick.characterNotInGame({
					characterName,
					gameName,
				})
			);
			return;
		}

		// Remove character from game
		await kobold.character.update({ id: targetCharacter.id }, { gameId: null });

		await InteractionUtils.send(
			intr,
			GameDefinition.strings.kick.success({
				characterName,
				gameName,
			})
		);
	}
}
