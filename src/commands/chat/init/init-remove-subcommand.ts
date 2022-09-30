import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import { getActiveCharacterActor, InitiativeBuilder } from './../../../utils/initiative-utils';
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
import { getActiveCharacter, getBestNameMatch } from '../../../utils/character-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import {
	getControllableInitiativeActors,
	getInitiativeForChannel,
	getNameMatchCharacterFromInitiative,
	updateInitiativeRoundMessageOrSendNew,
} from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';

export class InitRemoveSubCommand implements Command {
	public names = ['remove'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'remove',
		description: `Remove a character from the Initiative`,
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

			const currentInitResponse = await getInitiativeForChannel(intr.channel);
			if (!currentInitResponse) await InteractionUtils.respond(intr, []);
			//get the character matches
			let actorOptions = getControllableInitiativeActors(
				currentInitResponse.init,
				intr.user.id
			);
			actorOptions = actorOptions.filter(actor => actor.name.includes(match));

			//return the matched skills
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

		const currentInitResponse = await getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		let actorResponse: { actor: InitiativeActor; errorMessage: string };
		if (!targetCharacterName) {
			actorResponse = await getActiveCharacterActor(currentInit, intr.user.id);
		} else {
			actorResponse = await getNameMatchCharacterFromInitiative(
				intr.user.id,
				currentInit,
				targetCharacterName
			);
		}
		if (actorResponse.errorMessage) {
			await InteractionUtils.send(intr, actorResponse.errorMessage);
			return;
		}
		const actor = actorResponse.actor;
		const actorsInGroup = _.filter(
			currentInit.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);
		await InitiativeActor.query().deleteById(actor.id);
		if (actorsInGroup.length === 1) {
			await InitiativeActorGroup.query().deleteById(actor.initiativeActorGroupId);
		}

		const deletedEmbed = new MessageEmbed();
		deletedEmbed.setColor('GREEN').setTitle(`Yip! ${actor.name} was removed from initiative.`);

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			deletedEmbed.addFields([
				{ name: '\u200B', value: `[View Current Round](${targetMessage.url})` },
			]);
		}
		await InteractionUtils.send(intr, deletedEmbed);

		if (
			//we removed the currently active group
			currentInit.currentTurnGroupId === actor.initiativeActorGroupId &&
			//the groups are not already empty somehow
			currentInit.actorGroups?.length &&
			//we haven't removed the last group
			!(currentInit.actorGroups.length === 1 && actorsInGroup.length === 1)
		) {
			//we need to fix the initiative!

			const initBuilder = new InitiativeBuilder({ initiative: currentInit });
			let previousTurn = initBuilder.getPreviousTurnChanges();
			if (previousTurn.errorMessage) {
				previousTurn = initBuilder.getNextTurnChanges();
			}

			const updatedInitiative = await Initiative.query()
				.updateAndFetchById(currentInit.id, previousTurn)
				.withGraphFetched('[actors.[character], actorGroups]');

			initBuilder.set({
				initiative: updatedInitiative,
				actors: updatedInitiative.actors,
				groups: updatedInitiative.actorGroups,
			});

			const currentRoundMessage = await initBuilder.getCurrentRoundMessage(intr);
			const url = currentRoundMessage ? currentRoundMessage.url : '';
			const currentTurnEmbed = await initBuilder.currentTurnEmbed(url);
			const activeGroup = initBuilder.activeGroup;

			await updateInitiativeRoundMessageOrSendNew(intr, initBuilder);

			await InteractionUtils.send(intr, {
				content: `<@${activeGroup.userId}>`,
				embeds: [currentTurnEmbed],
			});
		} else {
			const initBuilder = new InitiativeBuilder({
				initiative: currentInit,
			});
			initBuilder.removeActor(actor);
			await updateInitiativeRoundMessageOrSendNew(intr, initBuilder);
		}
	}
}
