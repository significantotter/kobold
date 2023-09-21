import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { InitOptions } from './init-command-options.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';

export class InitRemoveSubCommand implements Command {
	public names = [L.en.commands.init.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.remove.name(),
		description: L.en.commands.init.remove.description(),
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
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			return AutocompleteUtils.getAllControllableInitiativeActors(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacterName = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name);

		const [currentInit, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			SettingsUtils.getSettingsForUser(intr),
		]);

		let actorResponse: InitiativeActor;
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
				LL,
				true
			);
		}

		const actor = actorResponse;
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

			const initBuilder = new InitiativeBuilder({
				initiative: currentInit,
				userSettings,
				LL,
			});
			let currentTurn = initBuilder.getCurrentTurnInfo();
			let previousTurn = initBuilder.getPreviousTurnChanges();

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
				content: activeGroup ? `<@!${activeGroup.userId}>` : undefined,
				embeds: [currentTurnEmbed],
			});
			if (_.some(initBuilder.activeActors, actor => actor.hideStats)) {
				await KoboldEmbed.dmInitiativeWithHiddenStats({
					intr,
					currentTurn,
					targetTurn: previousTurn,
					initBuilder,
					LL,
				});
			}
		} else {
			const initBuilder = new InitiativeBuilder({
				initiative: currentInit,
				userSettings,
				LL,
			});
			initBuilder.removeActor(actor);
			if (currentInit.currentRound === 0) {
				await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
			}
		}
	}
}
