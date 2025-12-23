import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { GameDefinition, utilStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GameInitSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.init
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.gameTargetCharacter].name) {
			const targetCharacter =
				intr.options.getString(
					commandOptions[commandOptionsEnum.gameTargetCharacter].name
				) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === commandOptions[commandOptionsEnum.skillChoice].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.skillChoice].name) ?? '';

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

		const initiativeValue = intr.options.getNumber(
			commandOptions[commandOptionsEnum.initValue].name
		);
		const skillChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.skillChoice].name
		);
		const diceExpression = intr.options.getString(
			commandOptions[commandOptionsEnum.rollExpression].name
		);
		const targetCharacter = intr.options.getString(
			commandOptions[commandOptionsEnum.gameTargetCharacter].name,
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
					utilStrings.initiative.initOutsideServerChannelError
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
				: rollResult.getRollTotalArray()[0] ?? 0;

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
			await InteractionUtils.send(intr, GameDefinition.strings.init.alreadyInInit);
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
