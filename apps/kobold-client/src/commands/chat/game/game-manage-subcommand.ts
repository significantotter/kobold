import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import { GameOptions } from './game-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { GameWithRelations, Kobold } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class GameManageSubCommand implements Command {
	public names = [L.en.commands.game.manage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.manage.name(),
		description: L.en.commands.game.manage.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameOptions.GAME_MANAGE_VALUE.name) {
			const option = intr.options.getString(GameOptions.GAME_MANAGE_OPTION.name) ?? '';
			const value = (intr.options.getString(GameOptions.GAME_MANAGE_VALUE.name) ?? '')
				.trim()
				.toLocaleLowerCase();

			const { gameUtils } = new KoboldUtils(kobold);

			let targetGames: GameWithRelations[] = [];
			if (option === L.en.commandOptions.gameManageOption.choices.kick.name()) {
				if (!intr.guildId) return [];
				targetGames = await kobold.game.readMany({
					guildId: intr.guildId,
					gmUserId: intr.user.id,
				});

				// this option sort of needs 2 values, a game and a character
				// we're going to cheat that and use hyphenated values

				const options: ApplicationCommandOptionChoiceData[] = [];
				for (const game of targetGames) {
					for (const character of game.characters || []) {
						const option = game.name + ' - ' + character.name;
						if (value == '' || option.toLocaleLowerCase().trim().includes(value)) {
							options.push({
								name: option,
								value: option,
							});
						}
					}
				}

				return options;
			} else if (option === L.en.commandOptions.gameManageOption.choices.join.name()) {
				targetGames = await gameUtils.getWhereUserLacksCharacter(
					intr.user.id,
					intr.guildId ?? ''
				);
			} else if (option === L.en.commandOptions.gameManageOption.choices.setActive.name()) {
				if (!intr.guildId) return [];
				targetGames = await kobold.game.readMany({
					gmUserId: intr.user.id,
					guildId: intr.guildId,
				});
			} else if (option === L.en.commandOptions.gameManageOption.choices.leave.name()) {
				targetGames = await gameUtils.getWhereUserHasCharacter(intr.user.id, intr.guildId);
			} else if (option === L.en.commandOptions.gameManageOption.choices.delete.name()) {
				if (!intr.guildId) return [];
				targetGames = await kobold.game.readMany({
					gmUserId: intr.user.id,
					guildId: intr.guildId,
				});
			} else {
				// create or unset
				return value && value.length > 0 ? [{ name: value, value: value }] : [];
			}
			// for everything else, we format the target games as the options
			return targetGames
				.map(game => ({
					name: game.name,
					value: game.name,
				}))
				.filter(
					field => value == '' || field.name.trim().toLocaleLowerCase().includes(value)
				);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const option = intr.options.getString(GameOptions.GAME_MANAGE_OPTION.name, true);
		const value = intr.options.getString(GameOptions.GAME_MANAGE_VALUE.name, true);

		if (!intr.guildId) {
			throw new KoboldError('You can only manage games in a server!');
		}

		const koboldUtils = new KoboldUtils(kobold);
		const { characterUtils } = koboldUtils;

		// This option uses value differently, so we do this separately from the rest
		if (option === L.en.commandOptions.gameManageOption.choices.kick.name()) {
			const [gameName, ...characterNameSections] = value.split(' - ');
			//just in case a character name has ' - ' in it
			const characterName = characterNameSections.join(' - ');

			const targetGames = await kobold.game.readMany({
				guildId: intr.guildId,
				gmUserId: intr.user.id,
				name: gameName,
			});
			const targetGame = targetGames.length ? targetGames[0] : null;

			if (gameName && characterName) {
				if (targetGames.length) {
					const targetGame = targetGames[0];
					const targetCharacter = (targetGame.characters || []).find(
						character =>
							character.name.trim().toLocaleLowerCase() ===
							characterName.trim().toLocaleLowerCase()
					);

					if (targetCharacter) {
						await kobold.character.update(
							{ id: targetCharacter.id },
							{
								gameId: null,
							}
						);

						await InteractionUtils.send(
							intr,
							LL.commands.game.manage.interactions.kickSuccess({
								characterName: characterName,
								gameName: gameName,
							})
						);
						return;
					} else {
						// didn't find the character in the game
						await InteractionUtils.send(
							intr,
							LL.commands.game.manage.interactions.characterNotInGame({
								characterName: characterName,
								gameName: gameName,
							})
						);
					}
				} else {
					//didn't find the game
					await InteractionUtils.send(
						intr,
						LL.commands.game.interactions.notFound({
							gameName: gameName,
						})
					);
				}
				return;
			} else {
				await InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.kickParseFailed()
				);
			}
			return;
		}

		const targetGames = await kobold.game.readMany({
			guildId: intr.guildId,
			name: value,
		});
		const targetGame = targetGames.length ? targetGames[0] : null;

		if (option === L.en.commandOptions.gameManageOption.choices.create.name()) {
			// ensure it's not a duplicate name

			if (value.length < 1) {
				InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.gameNameTooShort()
				);
				return;
			}
			if (value.indexOf(' - ') !== -1) {
				InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.gameNameDisallowedCharacters()
				);
				return;
			}

			if (targetGame) {
				InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.gameAlreadyExists()
				);
				return;
			}

			// set existing games here to not active
			await kobold.game.updateMany(
				{ gmUserId: intr.user.id, guildId: intr.guildId },
				{ isActive: false }
			);

			// create the game!
			await kobold.game.create({
				name: value,
				gmUserId: intr.user.id,
				guildId: intr.guildId,
				isActive: true,
			});

			await InteractionUtils.send(
				intr,
				LL.commands.game.manage.interactions.createSuccess({
					gameName: value,
				})
			);
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.setActive.name()) {
			if (targetGame == null) {
				throw new KoboldError(
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			// set existing games here to not active
			await kobold.game.updateMany(
				{ guildId: intr.guildId, gmUserId: intr.user.id },
				{ isActive: false }
			);

			// set target game to active
			await kobold.game.update({ id: targetGame.id }, { isActive: true });

			await InteractionUtils.send(
				intr,
				LL.commands.game.manage.interactions.setActiveSuccess({
					gameName: value,
				})
			);
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.delete.name()) {
			if (targetGame == null) {
				throw new KoboldError(
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			await kobold.game.delete({ id: targetGame.id });

			await InteractionUtils.send(
				intr,
				LL.commands.game.manage.interactions.deleteSuccess({
					gameName: value,
				})
			);
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.join.name()) {
			if (targetGame != null) {
				const activeCharacter = await characterUtils.getActiveCharacter(intr);
				if (!activeCharacter) {
					//didn't find the game
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.noActiveCharacter()
					);
				} else if (
					(targetGame.characters || []).filter(
						character => character.id === activeCharacter.id
					).length > 0
				) {
					await InteractionUtils.send(
						intr,
						`${activeCharacter.name} is already in ${targetGame.name}!`
					);
				} else {
					//relate the two!
					await kobold.character.update(
						{ id: activeCharacter.id },
						{ gameId: targetGame.id }
					);
					await InteractionUtils.send(
						intr,
						LL.commands.game.manage.interactions.joinSuccess({
							characterName: activeCharacter.name,
							gameName: targetGame.name,
						})
					);
				}
			} else {
				//didn't find the game
				await InteractionUtils.send(
					intr,
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.leave.name()) {
			if (targetGame) {
				const activeCharacter = await characterUtils.getActiveCharacter(intr);
				if (!activeCharacter) {
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.noActiveCharacter()
					);
				} else if (
					(targetGame.characters || []).filter(
						character => character.id !== activeCharacter.id
					).length > 0
				) {
					await InteractionUtils.send(
						intr,
						LL.commands.game.manage.interactions.characterNotInGame({
							characterName: activeCharacter.name,
							gameName: targetGame.name,
						})
					);
				} else {
					//unrelate the two!
					await kobold.character.update(
						{
							id: activeCharacter.id,
						},
						{
							gameId: null,
						}
					);
					await InteractionUtils.send(
						intr,
						LL.commands.game.manage.interactions.leaveSuccess({
							characterName: activeCharacter.name,
							gameName: targetGames[0].name,
						})
					);
				}
			} else {
				//didn't find the game
				await InteractionUtils.send(
					intr,
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			return;
		}
	}
}
