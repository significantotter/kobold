import { RollBuilder } from './../../../utils/dice-utils';
import { InitiativeActor } from './../../../services/kobold/models/initiative-actor/initiative-actor.model';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	MessageEmbed,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import {
	getInitiativeForChannel,
	InitiativeBuilder,
	updateInitiativeRoundMessageOrSendNew,
} from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { getActiveCharacter, findPossibleSkillFromString } from '../../../utils/character-utils.js';
import { rollSkill } from '../../../utils/dice-utils.js';

export class InitJoinSubCommand implements Command {
	public names = ['join'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'join',
		description: `Initiative Tracking`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				await InteractionUtils.respond(intr, []);
				return;
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = findPossibleSkillFromString(activeCharacter, match).map(
				skill => ({ name: skill.Name, value: skill.Name })
			);
			//return the matched skills
			await InteractionUtils.respond(intr, matchedSkills);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const [currentInitResponse, activeCharacter] = await Promise.all([
			getInitiativeForChannel(intr.channel),
			getActiveCharacter(intr.user.id),
		]);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}
		if (currentInit.actors.find(actor => actor.characterId === activeCharacter.id)) {
			await InteractionUtils.send(
				intr,
				`Yip! ${activeCharacter.characterData.name} is already in this initiative!`
			);
			return;
		}
		const initiativeValue = intr.options.getNumber(ChatArgs.INIT_VALUE_OPTION.name);
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);

		let finalInitiative = 0;
		let rollResultMessage: MessageEmbed;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new MessageEmbed()
				.setColor('GREEN')
				.setTitle(`${activeCharacter.characterData.name} joined Initiative!`)
				.setDescription(`Initiative: ${finalInitiative}`);
			if (activeCharacter.characterData.infoJSON?.imageURL) {
				rollResultMessage.setThumbnail(
					`${activeCharacter.characterData.infoJSON?.imageURL}`
				);
			}
		} else if (skillChoice) {
			const response = await rollSkill(
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
				rollDescription: 'rolled initiative!',
			});
			rollBuilder.addRoll(diceExpression);
			finalInitiative = rollBuilder.rollResults[0]?.results?.total || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		} else {
			const response = await rollSkill(
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
					name: '\u200B',
					value: `[Initiative Round ${currentInit.currentRound}](${targetMessage.url})`,
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
		});
		await updateInitiativeRoundMessageOrSendNew(intr, initBuilder);
		await InteractionUtils.send(intr, rollResultMessage);
	}
}
