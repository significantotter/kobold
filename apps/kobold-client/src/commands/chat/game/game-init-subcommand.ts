import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitOptions } from '../init/init-command-options.js';
import { GameOptions } from './game-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { RollOptions } from '../roll/roll-command-options.js';
import { GameCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class GameInitSubCommand extends BaseCommandClass(
	GameCommand,
	GameCommand.subCommandEnum.init
) {
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
		} else if (option.name === RollOptions.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(RollOptions.SKILL_CHOICE_OPTION.name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			//get the active game
			const game = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			if (!game) {
				//no choices if we don't have a character to match against
				return [];
			}
			const choices: Set<string> = new Set();
			for (const character of game.characters || []) {
				const matchedSkills = FinderHelpers.matchAllSkills(
					new Creature(character.sheetRecord),
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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { initiativeUtils } = koboldUtils;
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
		const skillChoice = intr.options.getString(RollOptions.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(RollOptions.ROLL_EXPRESSION_OPTION.name);
		const targetCharacter = intr.options.getString(
			GameOptions.GAME_TARGET_CHARACTER.name,
			true
		);

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

		for (const character of _.uniqBy(activeGame.characters, 'id')) {
			if (
				targetCharacter !== 'All Players' && // the character is already in the init
				(currentInitiative.actors.find(actor => actor.characterId === character.id) ||
					// we have a target character and this isn't it
					(targetCharacter &&
						targetCharacter.toLocaleLowerCase().trim().length > 0 &&
						targetCharacter.toLocaleLowerCase().trim() !==
							character.name.toLocaleLowerCase().trim()))
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
				: (rollResult.getRollTotalArray()[0] ?? 0);

			const actorName = InitiativeBuilderUtils.getUniqueInitActorName(
				currentInitiative,
				character.name
			);

			await koboldUtils.initiativeUtils.createActorFromCharacter({
				initiativeId: currentInitiative.id,
				character,
				name: actorName,
				initiativeResult,
				hideStats: false,
			});

			const embed = InitiativeBuilderUtils.initiativeJoinEmbed(rollResult, actorName);

			embeds.push(embed);
		}
		if (embeds.length === 0) {
			await InteractionUtils.send(intr, LL.commands.game.init.interactions.alreadyInInit());
		} else {
			await InteractionUtils.send(intr, { embeds: embeds });
		}

		const newInitiative = await initiativeUtils.getInitiativeForChannel(intr.channel);

		if (!newInitiative)
			throw new KoboldError(
				"Yip! Something went wrong and I couldn't find this channel's initiative"
			);

		const initBuilder = new InitiativeBuilder({
			initiative: newInitiative,
		});

		await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
	}
}
