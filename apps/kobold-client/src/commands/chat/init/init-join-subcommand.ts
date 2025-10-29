import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitOptions } from './init-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { RollOptions } from '../roll/roll-command-options.js';
import { InitCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitJoinSubCommand extends BaseCommandClass(
	InitCommand,
	InitCommand.subCommandEnum.join
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === RollOptions.SKILL_CHOICE_OPTION.name) {
			const { characterUtils } = new KoboldUtils(kobold);
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(RollOptions.SKILL_CHOICE_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = FinderHelpers.matchAllSkills(
				new Creature(activeCharacter.sheetRecord, undefined, intr),
				match
			).map(skill => ({ name: skill.name, value: skill.name }));
			//return the matched skills
			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { initiativeUtils } = koboldUtils;
		const { currentInitiative, activeCharacter, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				activeCharacter: true,
				userSettings: true,
			});

		if (
			currentInitiative &&
			currentInitiative.actors.find(actor => actor.characterId === activeCharacter.id)
		) {
			await InteractionUtils.send(
				intr,
				L.en.commands.init.join.interactions.characterAlreadyInInit({
					characterName: activeCharacter.name,
				})
			);
			return;
		}
		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(RollOptions.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(RollOptions.ROLL_EXPRESSION_OPTION.name);
		const hideStats = intr.options.getBoolean(InitOptions.INIT_HIDE_STATS_OPTION.name) ?? false;

		const rollResult = await InitiativeBuilderUtils.rollNewInitiative({
			character: activeCharacter,
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
			activeCharacter.name
		);

		await koboldUtils.initiativeUtils.createActorFromCharacter({
			initiativeId: currentInitiative.id,
			character: activeCharacter,
			name: actorName,
			initiativeResult,
			hideStats,
		});

		const embed = InitiativeBuilderUtils.initiativeJoinEmbed(rollResult, actorName);

		const newInitiative = await initiativeUtils.getInitiativeForChannel(intr.channel);

		if (!newInitiative)
			throw new KoboldError(
				"Yip! Something went wrong and I couldn't find this channel's initiative"
			);

		const initBuilder = new InitiativeBuilder({
			initiative: newInitiative,
		});

		await InteractionUtils.send(intr, embed);
		if (currentInitiative.currentRound === 0) {
			await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
		} else {
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);
			await InteractionUtils.send(intr, { embeds: [embed] });
		}
	}
}
