import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import {
	InitiativeBuilder,
	InitiativeBuilderUtils,
	TurnData,
} from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitOptions } from './init-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InitCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitRemoveSubCommand extends BaseCommandClass(
	InitCommand,
	InitCommand.subCommandEnum.remove
) {
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
			let updatedTurn: TurnData;
			try {
				updatedTurn = initBuilder.getPreviousTurnChanges();
			} catch (e) {
				console.warn('Error getting previous turn changes', e);
				if (e instanceof KoboldError) {
					// this is an edge case where we can't go to the previous turn on
					// the first turn, but remove the first character from initiative
					updatedTurn = initBuilder.getJumpToTurnChanges(initBuilder.groups[1].name);
				} else {
					throw e;
				}
			}

			const updatedInitiative = await kobold.initiative.read({ id: currentInitiative.id });
			updatedInitiative!.currentTurnGroupId = updatedTurn.currentTurnGroupId;

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
					targetTurn: updatedTurn,
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
