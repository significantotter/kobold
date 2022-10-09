import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import { InitiativeUtils, InitiativeBuilder } from './../../../utils/initiative-utils';
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
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

export class InitSetSubCommand implements Command {
	public names = ['set'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'set',
		description: `Sets certain properties of your character for initiative`,
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
			if (currentInitResponse.errorMessage) {
				await InteractionUtils.respond(intr, []);
				return;
			}
			//get the actor matches
			let actorOptions = InitiativeUtils.getControllableInitiativeActors(
				currentInitResponse.init,
				intr.user.id
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
		const targetCharacterName = intr.options
			.getString(ChatArgs.INIT_CHARACTER_OPTION.name)
			.trim();
		const fieldToChange = intr.options.getString(ChatArgs.ACTOR_SET_OPTION.name).trim();
		const newFieldValue = intr.options.getString(ChatArgs.ACTOR_SET_VALUE_OPTION.name).trim();

		if (!fieldToChange || !['initiative', 'name'].includes(fieldToChange)) {
			await InteractionUtils.send(intr, 'Yip! Please send a valid option to update.');
			return;
		}
		let currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		let currentInit = currentInitResponse.init;

		const actorResponse: { actor: InitiativeActor; errorMessage: string } =
			await InitiativeUtils.getNameMatchActorFromInitiative(
				intr.user.id,
				currentInit,
				targetCharacterName
			);
		if (actorResponse.errorMessage) {
			await InteractionUtils.send(intr, actorResponse.errorMessage);
			return;
		}
		const actor = actorResponse.actor;
		const actorsInGroup = _.filter(
			currentInit.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);

		// validate the updates
		if (fieldToChange === targetCharacterName) {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(intr, "Yip! You can't use an empty name!");
				return;
				//a name can't already be in the initiative
			} else if (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === newFieldValue.toLowerCase()
				)
			) {
				await InteractionUtils.send(
					intr,
					'Yip! A character with that name is already in the initiative.'
				);
				return;
			}
		}

		if (fieldToChange === 'initiative') {
			if (isNaN(Number(newFieldValue))) {
				await InteractionUtils.send(
					intr,
					'Yip! You can only update initiative with a number.'
				);
				return;
			}
		}

		// perform the updates
		if (fieldToChange === 'initiative') {
			await InitiativeActorGroup.query().updateAndFetchById(actor.initiativeActorGroupId, {
				initiativeResult: Number(newFieldValue),
			});
		} else if (fieldToChange === 'name') {
			await InitiativeActor.query().updateAndFetchById(actor.id, { name: newFieldValue });
			if (actorsInGroup.length === 1) {
				await InitiativeActorGroup.query().updateAndFetchById(
					actor.initiativeActorGroupId,
					{
						name: newFieldValue,
					}
				);
			}
		}
		currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		currentInit = currentInitResponse.init;

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			`Yip! ${actor.name} had their ${fieldToChange} set to ${newFieldValue}.`
		);

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			updateEmbed.addFields([
				{ name: '\u200B', value: `[View Current Round](${targetMessage.url})` },
			]);
		}
		await InteractionUtils.send(intr, updateEmbed);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
		});
		await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);
	}
}
