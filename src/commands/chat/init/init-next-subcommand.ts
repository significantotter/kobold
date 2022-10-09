import { InitiativeActorGroup } from '../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import {
	InitiativeUtils.getNameMatchGroupFromInitiative,
	InitiativeBuilder,
	InitiativeUtils.updateInitiativeRoundMessageOrSendNew,
} from '../../../utils/initiative-utils';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model';
import { ChatArgs } from '../../../constants/chat-args';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	CommandInteraction,
	PermissionString,
	MessageEmbed,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import {
	InitiativeUtils.getControllableInitiativeActors,
	InitiativeUtils.getInitiativeForChannel,
	InitiativeUtils.getNameMatchActorFromInitiative,
} from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

export class InitNextSubCommand implements Command {
	public names = ['next'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'next',
		description: `Moves to the next participant in the initiative order`,
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
		if (option.name === ChatArgs.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
			if (!currentInitResponse) await InteractionUtils.respond(intr, []);
			//get the character matches
			let actorOptions = InitiativeUtils.getControllableInitiativeActors(
				currentInitResponse.init,
				//get all initiative actors
				currentInitResponse.init.gmUserId
			);
			actorOptions = actorOptions.filter(actor => actor.name.includes(match));

			//return the matched actors
			await InteractionUtils.respond(
				intr,
				actorOptions.map(actor => ({
					name: actor.name,
					value: actor.name,
				}))
			);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);
		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const initBuilder = new InitiativeBuilder({ initiative: initResult.init });
		const nextTurn = initBuilder.getNextTurnChanges();
		if (nextTurn.errorMessage) {
			await InteractionUtils.send(intr, nextTurn.errorMessage);
			return;
		}

		let saveMessage = nextTurn.currentRound > initResult.init.currentRound;

		const updatedInitiative = await Initiative.query()
			.updateAndFetchById(initResult.init.id, nextTurn)
			.withGraphFetched('[actors.[character], actorGroups]');

		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const roundMessage = await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);

		let currentRoundMessage = roundMessage;

		if (saveMessage) {
			let roundMessageIds = initResult.init.roundMessageIds;
			roundMessageIds.push(roundMessage.id);
			await Initiative.query().update({ roundMessageIds }).where({ id: initResult.init.id });
		} else {
			currentRoundMessage = await initBuilder.getCurrentRoundMessage(intr);
		}
		const url = currentRoundMessage ? currentRoundMessage.url : '';
		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder, url);
		const activeGroup = initBuilder.activeGroup;

		await InteractionUtils.send(intr, {
			content: `<@${activeGroup.userId}>`,
			embeds: [currentTurnEmbed],
		});
	}
}
