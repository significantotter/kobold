import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
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
import { InitOptions } from './init-command-options.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';

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
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = CharacterUtils.findPossibleSkillFromString(
				activeCharacter,
				match
			).map(skill => ({ name: skill.name, value: skill.name }));
			//return the matched skills
			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const [currentInit, activeCharacter, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			CharacterUtils.getActiveCharacter(intr),
			SettingsUtils.getSettingsForUser(intr),
		]);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, L.en.commands.init.interactions.noActiveCharacter());
			return;
		}
		if (currentInit.actors.find(actor => actor.characterId === activeCharacter.id)) {
			await InteractionUtils.send(
				intr,
				L.en.commands.init.join.interactions.characterAlreadyInInit({
					characterName: activeCharacter.sheet.staticInfo.name,
				})
			);
			return;
		}
		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const hideStats = intr.options.getBoolean(InitOptions.INIT_HIDE_STATS_OPTION.name) ?? false;

		const rollResultMessage = await InitiativeUtils.addCharacterToInitiative({
			character: activeCharacter,
			currentInit,
			initiativeValue,
			skillChoice,
			diceExpression,
			userName: intr.user.username,
			userId: intr.user.id,
			hideStats,
			userSettings,
			LL,
		});

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			actors: currentInit.actors,
			groups: currentInit.actorGroups,
			LL,
		});
		await InteractionUtils.send(intr, rollResultMessage);
		if (currentInit.currentRound === 0) {
			await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
		} else {
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder, LL);
			await InteractionUtils.send(intr, { embeds: [embed] });
		}
	}
}
