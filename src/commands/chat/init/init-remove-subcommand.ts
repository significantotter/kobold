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
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { InitOptions } from './init-command-options.js';
import { Kobold } from '../../../services/kobold/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

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
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return autocompleteUtils.getAllControllableInitiativeActors(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetActorName = intr.options
			.getString(InitOptions.INIT_CHARACTER_OPTION.name, true)
			.trim();

		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				userSettings: true,
				currentInitiative: true,
			});

		let actorResponse = InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			targetActorName,
			true
		);

		const actor = actorResponse;
		const actorsInGroup = _.filter(
			currentInitiative.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);
		await kobold.initiativeActor.delete({ id: actor.id });
		if (actorsInGroup.length === 1) {
			await kobold.initiativeActorGroup.delete({ id: actor.initiativeActorGroupId });
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
			currentInitiative.currentTurnGroupId === actor.initiativeActorGroupId &&
			//the groups are not already empty somehow
			currentInitiative.actorGroups?.length &&
			//we haven't removed the last group
			!(currentInitiative.actorGroups.length === 1 && actorsInGroup.length === 1)
		) {
			//we need to fix the initiative!

			const initBuilder = new InitiativeBuilder({
				initiative: currentInitiative,
				userSettings,
				LL,
			});
			let currentTurn = initBuilder.getCurrentTurnInfo();
			let previousTurn = initBuilder.getPreviousTurnChanges();

			const updatedInitiative = await kobold.initiative.read({ id: currentInitiative.id });

			if (!updatedInitiative)
				throw new Error('Initiative was already deleted while trying to remove an actor');

			initBuilder.set({
				initiative: updatedInitiative,
				actors: updatedInitiative.actors,
				groups: updatedInitiative.actorGroups,
			});

			const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder, LL);
			const activeGroup = initBuilder.activeGroup;

			if (updatedInitiative.currentRound === 0) {
				await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
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
				initiative: currentInitiative,
				userSettings,
				LL,
			});
			initBuilder.removeActor(actor);
			if (currentInitiative.currentRound === 0) {
				await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
			}
		}
	}
}
