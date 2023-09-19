import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';

import { GameOptions } from './game-command-options.js';

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Game } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

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
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameOptions.GAME_MANAGE_VALUE.name) {
			const option = intr.options.getString(GameOptions.GAME_MANAGE_OPTION.name) ?? '';
			const value = (intr.options.getString(GameOptions.GAME_MANAGE_VALUE.name) ?? '')
				.trim()
				.toLocaleLowerCase();

			let targetGames: Game[] = [];
			if (option === L.en.commandOptions.gameManageOption.choices.kick.name()) {
				targetGames = await Game.query()
					.withGraphFetched('characters')
					.where('guildId', intr.guildId)
					.andWhere('gmUserId', intr.user.id);

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
				targetGames = await Game.queryWhereUserLacksCharacter(
					intr.user.id,
					intr.guildId ?? ''
				);
			} else if (option === L.en.commandOptions.gameManageOption.choices.setActive.name()) {
				targetGames = await Game.query().where({
					gmUserId: intr.user.id,
					guildId: intr.guildId,
				});
			} else if (option === L.en.commandOptions.gameManageOption.choices.leave.name()) {
				targetGames = await Game.queryWhereUserHasCharacter(intr.user.id, intr.guildId);
			} else if (option === L.en.commandOptions.gameManageOption.choices.delete.name()) {
				targetGames = await Game.query().where({
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
		LL: TranslationFunctions
	): Promise<void> {
		const option = intr.options.getString(GameOptions.GAME_MANAGE_OPTION.name, true);
		const value = intr.options.getString(GameOptions.GAME_MANAGE_VALUE.name, true);

		if (option === L.en.commandOptions.gameManageOption.choices.create.name()) {
			// ensure it's not a duplicate name
			const existingGame = await Game.query()
				.where('guildId', 'ilike', intr.guildId)
				.andWhere('name', value);

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

			if (existingGame.length > 0) {
				InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.gameAlreadyExists()
				);
				return;
			}

			// set existing games here to not active
			await Game.query()
				.patch({ isActive: false })
				.where({ gmUserId: intr.user.id, guildId: intr.guildId });

			// create the game!
			await Game.query().insert({
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
			// set target game to active
			const updated = await Game.query()
				.patch({ isActive: true })
				.where({ gmUserId: intr.user.id, guildId: intr.guildId })
				.andWhere('name', 'ilike', value);

			if (updated > 0) {
				// set existing games here to not active
				await Game.query()
					.patch({ isActive: false })
					.where({ gmUserId: intr.user.id, guildId: intr.guildId })
					.andWhereNot('name', 'ilike', value);

				await InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.setActiveSuccess({
						gameName: value,
					})
				);
			} else {
				await InteractionUtils.send(
					intr,
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.delete.name()) {
			const deletedRows = await Game.query().delete().where({
				gmUserId: intr.user.id,
				guildId: intr.guildId,
				name: value,
			});
			if (deletedRows) {
				await InteractionUtils.send(
					intr,
					LL.commands.game.manage.interactions.deleteSuccess({
						gameName: value,
					})
				);
			} else {
				await InteractionUtils.send(
					intr,
					LL.commands.game.interactions.notFound({
						gameName: value,
					})
				);
			}
			return;
		} else if (option === L.en.commandOptions.gameManageOption.choices.kick.name()) {
			const [gameName, ...characterNameSections] = value.split(' - ');
			//just in case a character name has ' - ' in it
			const characterName = characterNameSections.join(' - ');
			if (gameName && characterName) {
				const targetGames = await Game.query().withGraphFetched('characters').where({
					gmUserId: intr.user.id,
					guildId: intr.guildId,
					name: gameName,
				});
				if (targetGames.length) {
					const targetGame = targetGames[0];
					const targetCharacters = (targetGame.characters || []).filter(
						character =>
							character.name.trim().toLocaleLowerCase() ===
							characterName.trim().toLocaleLowerCase()
					);
					if (targetCharacters.length) {
						await targetGame
							.$relatedQuery('characters')
							.unrelate()
							.where({ id: targetCharacters[0].id });

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
		} else if (option === L.en.commandOptions.gameManageOption.choices.join.name()) {
			const targetGames = await Game.query().where({
				guildId: intr.guildId,
				name: value,
			});
			if (targetGames.length > 0) {
				const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
				if (!activeCharacter) {
					//didn't find the game
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.noActiveCharacter()
					);
				} else if (
					(targetGames[0].characters || []).filter(
						character => character.id === activeCharacter.id
					).length > 0
				) {
					await InteractionUtils.send(
						intr,
						`${activeCharacter.name} is already in ${targetGames[0].name}!`
					);
				} else {
					//relate the two!
					const result = await targetGames[0]
						.$relatedQuery('characters')
						.relate(activeCharacter);
					await InteractionUtils.send(
						intr,
						LL.commands.game.manage.interactions.joinSuccess({
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
		} else if (option === L.en.commandOptions.gameManageOption.choices.leave.name()) {
			const targetGames = await Game.query()
				.where({
					guildId: intr.guildId,
					name: value,
				})
				.andWhereNot({ gmUserId: intr.user.id });
			if (targetGames.length > 0) {
				const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
				if (!activeCharacter) {
					//didn't find the game
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.noActiveCharacter()
					);
				} else if (
					(targetGames[0].characters || []).filter(
						character => character.id === activeCharacter.id
					).length > 0
				) {
					await InteractionUtils.send(
						intr,
						LL.commands.game.manage.interactions.characterNotInGame({
							characterName: activeCharacter.name,
							gameName: targetGames[0].name,
						})
					);
				} else {
					//unrelate the two!
					await targetGames[0]
						.$relatedQuery('characters')
						.unrelate()
						.where('id', activeCharacter.id);
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
