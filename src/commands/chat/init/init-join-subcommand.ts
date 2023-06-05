import { RollBuilder } from '../../../utils/roll-builder.js';
import { InitiativeActor } from './../../../services/kobold/models/initiative-actor/initiative-actor.model';
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

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class InitJoinSubCommand implements Command {
	public names = [Language.LL.commands.init.join.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.join.name(),
		description: Language.LL.commands.init.join.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
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
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const [currentInitResponse, activeCharacter] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel, {
				sendErrors: true,
				LL,
			}),
			CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId),
		]);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.init.interactions.noActiveCharacter()
			);
			return;
		}
		if (currentInit.actors.find(actor => actor.characterId === activeCharacter.id)) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.init.join.interactions.characterAlreadyInInit({
					characterName: activeCharacter.sheet.info.name,
				})
			);
			return;
		}
		const initiativeValue = intr.options.getNumber(ChatArgs.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);

		const rollResultMessage = await InitiativeUtils.addCharacterToInitiative({
			character: activeCharacter,
			currentInit,
			initiativeValue,
			skillChoice,
			diceExpression,
			userName: intr.user.username,
			userId: intr.user.id,
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
