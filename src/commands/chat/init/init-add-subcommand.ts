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

export class InitAddSubCommand implements Command {
	public names = ['add'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'add',
		description: `Adds a fake character to initiative`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const currentInitResponse = await getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		let actorName = intr.options.getString(ChatArgs.ACTOR_NAME_OPTION.name);
		const initiativeValue = intr.options.getNumber(ChatArgs.INIT_VALUE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);

		let nameCount = 1;
		let existingName = currentInit.actors.find(
			actor => actor.name.toLowerCase() === actorName.toLowerCase()
		);
		const baseName = actorName;
		if (existingName) {
			while (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === actorName.toLowerCase()
				)
			) {
				actorName = baseName + `-${nameCount++}`;
			}
		}
		let finalInitiative = 0;
		let rollResultMessage: MessageEmbed;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new MessageEmbed()
				.setColor('GREEN')
				.setTitle(`${actorName} joined Initiative!`)
				.setDescription(`Initiative: ${finalInitiative}`);
		} else {
			const rollBuilder = new RollBuilder({
				title: `${actorName} rolled Initiative!`,
			});
			rollBuilder.addRoll(diceExpression || 'd20');
			finalInitiative = rollBuilder.rollResults[0]?.results?.total || 0;
			rollResultMessage = rollBuilder.compileEmbed();
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
		const newActor = await InitiativeActor.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: actorName,
			userId: intr.user.id,

			actorGroup: {
				initiativeId: currentInit.id,
				userId: intr.user.id,
				name: actorName,
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
