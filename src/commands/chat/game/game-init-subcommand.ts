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
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import _ from 'lodash';
import { GameOptions } from './game-command-options.js';
import { InitOptions } from '../init/init-command-options.js';
import { Kobold } from '../../../services/kobold/kobold.model.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import {
	Character,
	InitiativeWithRelations,
	UserSettings,
} from '../../../services/kobold/index.js';

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
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameOptions.GAME_TARGET_CHARACTER.name) {
			const targetCharacter =
				intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name) ?? '';

			const { gameUtils, characterUtils } = new KoboldUtils(kobold);
			//get the active game
			const game = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			if (!game) {
				//no choices if we don't have a character to match against
				return [];
			}
			const choices: Set<string> = new Set();
			for (const character of game.characters || []) {
				const matchedSkills = characterUtils
					.findPossibleSkillFromString(character, match)
					.map(skill => skill.name);
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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { gameUtils, initiativeUtils } = koboldUtils;
		let { currentInitiative, activeGame, userSettings } = await koboldUtils.fetchDataForCommand(
			intr,
			{
				currentInitiative: true,
				activeGame: true,
				userSettings: true,
			}
		);
		koboldUtils.assertActiveGameNotNull(activeGame);

		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const targetCharacter = intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name);

		if (activeGame.characters.length === 0) {
			await InteractionUtils.send(
				intr,
				`You have no characters in this game. Have players join using \`/game manage manage-option:join manage-value:${activeGame.name}\`.`
			);
			return;
		}

		const embeds: KoboldEmbed[] = [];

		if (!currentInitiative) {
			if (!intr.channel || !intr.channel.id) {
				await InteractionUtils.send(
					intr,
					LL.commands.init.start.interactions.notServerChannelError()
				);
				return;
			}
			currentInitiative = await kobold.initiative.create({
				gmUserId: intr.user.id,
				channelId: intr.channel.id,
				currentTurnGroupId: null,
				currentRound: 0,
			});
		}

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			actors: currentInitiative.actors,
			groups: currentInitiative.actorGroups,
			LL,
		});

		for (const character of _.uniqBy(activeGame.characters, 'id')) {
			if (
				// the character is already in the init
				currentInitiative.actors.find(actor => actor.characterId === character.id) ||
				// we have a target character and this isn't it
				(targetCharacter &&
					targetCharacter.toLocaleLowerCase().trim().length > 0 &&
					targetCharacter.toLocaleLowerCase().trim() !==
						character.sheet.staticInfo.name.toLocaleLowerCase().trim())
			) {
				continue;
			}

			const rollResult = await InitiativeBuilderUtils.rollNewInitiative({
				character: character,
				skillChoice,
				diceExpression,
				initiativeValue,
				userSettings,
			});
			const initiativeResult = _.isNumber(rollResult)
				? rollResult
				: rollResult.getRollTotalArray()[0] ?? 0;

			const actorName = InitiativeBuilderUtils.getUniqueInitActorName(
				currentInitiative,
				character.name
			);

			await koboldUtils.initiativeUtils.addActorToInitiative({
				initiativeId: currentInitiative.id,
				characterId: character.id,
				sheet: character.sheet,
				name: actorName,
				initiativeResult,
				userId: intr.user.id,
				hideStats: false,
			});

			const embed = InitiativeBuilderUtils.initiativeJoinEmbed(
				initiativeResult,
				currentInitiative.currentRound,
				actorName
			);

			initBuilder.set({
				actors: currentInitiative.actors,
				groups: currentInitiative.actorGroups,
			});
			embeds.push(embed);
		}
		if (embeds.length === 0) {
			await InteractionUtils.send(intr, LL.commands.game.init.interactions.alreadyInInit());
		} else {
			await InteractionUtils.send(intr, { embeds: embeds });
		}

		await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
	}
}
