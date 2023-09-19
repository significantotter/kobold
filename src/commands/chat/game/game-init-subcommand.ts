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
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { GameUtils } from '../../../utils/game-utils.js';
import _ from 'lodash';
import {
	Character,
	InitWithActorsAndGroups,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
} from '../../../services/kobold/models/index.js';
import { GameOptions } from './game-command-options.js';
import { InitOptions } from '../init/init-command-options.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';

export class GameInitSubCommand implements Command {
	public names = [L.en.commands.game.init.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.init.name(),
		description: L.en.commands.game.init.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameOptions.GAME_TARGET_CHARACTER.name) {
			const targetCharacter =
				intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name) ?? '';

			const activeGame = await GameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return GameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name) ?? '';

			//get the active game
			const game = await GameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			if (!game) {
				//no choices if we don't have a character to match against
				return [];
			}
			const choices: Set<string> = new Set();
			for (const character of game.characters || []) {
				const matchedSkills = CharacterUtils.findPossibleSkillFromString(
					character,
					match
				).map(skill => skill.name);
				for (const skill of matchedSkills) {
					choices.add(_.capitalize(skill));
				}
			}
			choices.delete('');

			const results = [];
			let counter = 0;
			for (const value of choices.values()) {
				if (counter > 90) continue;
				results.push({ name: value, value: value });
				counter++;
			}
			return results;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const targetCharacter = intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name);

		let [currentInit, activeGame, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannelOrNull(intr.channel),
			GameUtils.getActiveGame(intr.user.id, intr.guildId ?? ''),
			SettingsUtils.getSettingsForUser(intr),
		]);
		if (!activeGame) {
			await InteractionUtils.send(intr, L.en.commands.game.interactions.activeGameNotFound());
			return;
		}
		if (activeGame.characters.length === 0) {
			await InteractionUtils.send(
				intr,
				`You have no characters in this game. Have players join using \`/game manage manage-option:join manage-value:${activeGame.name}\`.`
			);
			return;
		}

		const embeds: KoboldEmbed[] = [];

		if (!currentInit) {
			if (!intr.channel || !intr.channel.id) {
				await InteractionUtils.send(
					intr,
					LL.commands.init.start.interactions.notServerChannelError()
				);
				return;
			}
			currentInit = (await Initiative.query()
				.insertAndFetch({
					gmUserId: intr.user.id,
					channelId: intr.channel.id,
					currentTurnGroupId: null,
					currentRound: 0,
				} as Initiative)
				.first()) as InitWithActorsAndGroups;
		}

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			actors: currentInit.actors,
			groups: currentInit.actorGroups,
			LL,
		});

		for (const character of _.uniqBy(activeGame.characters, 'id')) {
			if (
				// the character is already in the init
				currentInit.actors.find(actor => actor.characterId === character.id) ||
				// we have a target character and this isn't it
				(targetCharacter &&
					targetCharacter.toLocaleLowerCase().trim().length > 0 &&
					targetCharacter.toLocaleLowerCase().trim() !==
						character.sheet.info.name.toLocaleLowerCase().trim())
			) {
				continue;
			}
			const rollResultMessage = await InitiativeUtils.addCharacterToInitiative({
				character,
				skillChoice,
				diceExpression,
				initiativeValue,
				currentInit,
				userName: character.sheet.info.name,
				userId: character.userId,
				hideStats: false,
				userSettings,
				LL,
			});

			initBuilder.set({ actors: currentInit.actors, groups: currentInit.actorGroups });
			embeds.push(rollResultMessage);
		}
		if (embeds.length === 0) {
			await InteractionUtils.send(intr, LL.commands.game.init.interactions.alreadyInInit());
		} else {
			await InteractionUtils.send(intr, { embeds: embeds });
		}

		await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
	}
}
