import { RollBuilder } from './../../../utils/dice-utils';
import { InitiativeActor } from './../../../services/kobold/models/initiative-actor/initiative-actor.model';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/language.js';

export class InitAddSubCommand implements Command {
	public names = [Language.LL.commands.init.add.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.add.name(),
		description: Language.LL.commands.init.add.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
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
		let rollResultMessage: EmbedBuilder;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					Language.LL.commands.init.add.interactions.joinedEmbed.joinedTitle({
						actorName,
					})
				)
				.setDescription(
					Language.LL.commands.init.add.interactions.joinedEmbed.description({
						finalInitiative,
					})
				);
		} else {
			const rollBuilder = new RollBuilder({
				title: Language.LL.commands.init.add.interactions.joinedEmbed.rolledTitle({
					actorName,
				}),
				LL,
			});
			rollBuilder.addRoll({
				rollExpression: diceExpression || 'd20',
				tags: ['skill', 'perception', 'initiative'],
			});
			finalInitiative = rollBuilder.rollResults[0]?.results?.total || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		}

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			rollResultMessage.addFields([
				{
					name: Language.LL.commands.init.add.interactions.joinedEmbed.roundField.name(),
					value: Language.LL.commands.init.add.interactions.joinedEmbed.roundField.value({
						currentRound: currentInit.currentRound,
						url: targetMessage.url,
					}),
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
			LL,
		});
		await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
		await InteractionUtils.send(intr, rollResultMessage);
	}
}
