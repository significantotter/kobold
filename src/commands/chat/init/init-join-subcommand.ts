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
import { RateLimiter } from 'discord.js-rate-limiter';

import _ from 'lodash';
import { ChatArgs } from '../../../constants/chat-args.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '../../../services/kobold/index.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

export class InitJoinSubCommand implements Command {
	public names = [L.en.commands.init.join.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.join.name(),
		description: L.en.commands.init.join.description(),
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
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			const { characterUtils } = new KoboldUtils(kobold);
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = FinderHelpers.matchAllSkills(
				Creature.fromSheetRecord(activeCharacter.sheetRecord),
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
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
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
			: rollResult.getRollTotalArray()[0] ?? 0;

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

		const embed = InitiativeBuilderUtils.initiativeJoinEmbed(
			initiativeResult,
			currentInitiative.currentRound,
			actorName
		);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			actors: currentInitiative.actors,
			groups: currentInitiative.actorGroups,
			LL,
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
