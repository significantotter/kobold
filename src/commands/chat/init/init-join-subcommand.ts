import { RollBuilder } from './../../../utils/dice-utils';
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
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = CharacterUtils.findPossibleSkillFromString(
				activeCharacter,
				match
			).map(skill => ({ name: skill.Name, value: skill.Name }));
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
			CharacterUtils.getActiveCharacter(intr.user.id),
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
					characterName: activeCharacter.characterData.name,
				})
			);
			return;
		}
		const initiativeValue = intr.options.getNumber(ChatArgs.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);

		let finalInitiative = 0;
		let rollResultMessage: EmbedBuilder;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					LL.commands.init.join.interactions.joinedEmbed.title({
						characterName: activeCharacter.characterData.name,
					})
				)
				.setDescription(
					LL.commands.init.join.interactions.joinedEmbed.setDescription({
						initValue: finalInitiative,
					})
				);
			if (activeCharacter.characterData.infoJSON?.imageURL) {
				rollResultMessage.setThumbnail(activeCharacter.characterData.infoJSON?.imageURL);
			}
		} else if (skillChoice) {
			const response = await DiceUtils.rollSkill(
				intr,
				activeCharacter,
				skillChoice,
				null,
				diceExpression
			);
			finalInitiative = response.rollResults[0]?.results?.total || 0;
			rollResultMessage = response.compileEmbed();
		} else if (diceExpression) {
			const rollBuilder = new RollBuilder({
				character: activeCharacter,
				rollDescription: LL.commands.init.join.interactions.joinedEmbed.rollDescription(),
			});
			rollBuilder.addRoll(diceExpression);
			finalInitiative = rollBuilder.rollResults[0]?.results?.total || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		} else {
			const response = await DiceUtils.rollSkill(
				intr,
				activeCharacter,
				'Perception',
				null,
				diceExpression
			);
			finalInitiative = response.rollResults[0]?.results?.total || 0;
			rollResultMessage = response.compileEmbed();
		}

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			rollResultMessage.addFields([
				{
					name: LL.commands.init.join.interactions.joinedEmbed.roundField.name(),
					value: LL.commands.init.join.interactions.joinedEmbed.roundField.value({
						currentRound: currentInit.currentRound,
						url: targetMessage.url,
					}),
				},
			]);
		}

		let nameCount = 1;
		let existingName = currentInit.actors.find(
			actor => actor.name.toLowerCase() === activeCharacter.characterData.name.toLowerCase()
		);
		let uniqueName = activeCharacter.characterData.name;
		if (existingName) {
			while (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === uniqueName.toLowerCase()
				)
			) {
				uniqueName = activeCharacter.characterData.name + `-${nameCount++}`;
			}
		}

		const newActor = await InitiativeActor.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: uniqueName,
			characterId: activeCharacter.id,
			userId: intr.user.id,

			actorGroup: {
				initiativeId: currentInit.id,
				userId: intr.user.id,
				name: uniqueName,
				initiativeResult: finalInitiative,
			},
		});

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			actors: currentInit.actors.concat(newActor),
			groups: currentInit.actorGroups.concat(newActor.actorGroup),
			LL,
		});
		await InteractionUtils.send(intr, rollResultMessage);
		if (currentInit.currentRound === 0) {
			await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);
		} else {
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			await InteractionUtils.send(intr, { embeds: [embed] });
		}
	}
}
