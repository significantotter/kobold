import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model';
import { ChatArgs } from '../../../constants/chat-args';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	EmbedBuilder,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class InitRemoveSubCommand implements Command {
	public names = [Language.LL.commands.init.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.remove.name(),
		description: Language.LL.commands.init.remove.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
			if (!currentInitResponse) {
				return [];
			}
			//get the character matches
			let actorOptions = InitiativeUtils.getControllableInitiativeActors(
				currentInitResponse.init,
				intr.user.id
			);
			actorOptions = actorOptions.filter(actor => actor.name.includes(match));

			//return the matched skills
			return actorOptions.map(actor => ({
				name: actor.name,
				value: actor.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		let actorResponse: { actor: InitiativeActor; errorMessage: string };
		if (!targetCharacterName) {
			actorResponse = await InitiativeUtils.getActiveCharacterActor(
				currentInit,
				intr.user.id,
				LL
			);
		} else {
			actorResponse = await InitiativeUtils.getNameMatchActorFromInitiative(
				intr.user.id,
				currentInit,
				targetCharacterName,
				LL
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

		const deletedEmbed = new KoboldEmbed();
		deletedEmbed.setTitle(
			LL.commands.init.remove.interactions.deletedEmbed.title({
				actorName: actor.name,
			})
		);

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

			const initBuilder = new InitiativeBuilder({ initiative: currentInit, LL });
			let previousTurn = initBuilder.getPreviousTurnChanges();
			if (previousTurn.errorMessage) {
				previousTurn = initBuilder.getNextTurnChanges();
			}

			const updatedInitiative = await Initiative.query()
				.patchAndFetchById(currentInit.id, previousTurn)
				.withGraphFetched('[actors.[character], actorGroups]');

			initBuilder.set({
				initiative: updatedInitiative,
				actors: updatedInitiative.actors,
				groups: updatedInitiative.actorGroups,
			});

			const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder, LL);
			const activeGroup = initBuilder.activeGroup;

			if (updatedInitiative.currentRound === 0) {
				await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
			}

			await InteractionUtils.send(intr, {
				content: `<@!${activeGroup.userId}>`,
				embeds: [currentTurnEmbed],
			});
		} else {
			const initBuilder = new InitiativeBuilder({
				initiative: currentInit,
				LL,
			});
			initBuilder.removeActor(actor);
			if (currentInit.currentRound === 0) {
				await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
			}
		}
	}
}
