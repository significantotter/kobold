import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import {
	InitiativeBuilder,
	InitiativeBuilderUtils,
	TurnData,
} from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitRemoveSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.initCharacter].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.initCharacter].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return autocompleteUtils.getAllControllableInitiativeActors(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetActorName = intr.options
			.getString(commandOptions[commandOptionsEnum.initCharacter].name, true)
			.trim();

		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiativeLite: currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				userSettings: true,
				currentInitiativeLite: true,
			});

		const actor = InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			targetActorName,
			true
		);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			userSettings,
			useCachedSheets: true,
		});
		const currentTurn = initBuilder.getCurrentTurnInfo();
		const removesGroup = initBuilder.actorsByGroup[actor.initiativeActorGroupId].length === 1;
		const removesActiveGroup =
			removesGroup && currentInitiative.currentTurnGroupId === actor.initiativeActorGroupId;
		const remainingActors = currentInitiative.actors.filter(
			candidate => candidate.id !== actor.id
		);
		let updatedTurn: TurnData = {
			currentRound: currentInitiative.currentRound,
			currentTurnGroupId: currentInitiative.currentTurnGroupId,
		};
		if (!remainingActors.length) {
			updatedTurn = { currentRound: 0, currentTurnGroupId: null };
		} else if (removesActiveGroup) {
			const activeIndex = initBuilder.groups.findIndex(
				group => group.id === actor.initiativeActorGroupId
			);
			// There is no previous turn at the start of round one. Select the next
			// surviving group instead; otherwise preserve the existing rewind behavior.
			updatedTurn =
				activeIndex === 0 && currentInitiative.currentRound <= 1
					? {
							currentRound: currentInitiative.currentRound,
							currentTurnGroupId: initBuilder.groups[1].id,
						}
					: initBuilder.getPreviousTurnChanges();
		}

		// Prepare the display from the lite snapshot, avoiding another full sheet fetch.
		const remainingGroups = currentInitiative.actorGroups
			.filter(group => !removesGroup || group.id !== actor.initiativeActorGroupId)
			.map(group => ({
				...group,
				actors: remainingActors.filter(
					candidate => candidate.initiativeActorGroupId === group.id
				),
			}));
		const updatedBuilder = new InitiativeBuilder({
			initiative: {
				...currentInitiative,
				...updatedTurn,
				actors: remainingActors,
				actorGroups: remainingGroups,
			},
			userSettings,
			useCachedSheets: true,
		});
		const deletedEmbed = new KoboldEmbed().setTitle(
			InitDefinition.strings.remove.deletedEmbed.title({ actorName: actor.name })
		);

		await kobold.transaction(async transaction => {
			await transaction.initiativeActor.delete({ id: actor.id });
			if (removesGroup) {
				await transaction.initiativeActorGroup.delete({ id: actor.initiativeActorGroupId });
			}
			if (removesActiveGroup || !remainingActors.length) {
				await transaction.initiative.update({ id: currentInitiative.id }, updatedTurn);
			}
			await transaction.sheetRecord.deleteOrphaned();
		});

		// Discord delivery cannot be rolled back with the database. A notification
		// failure must not report that the already committed removal failed.
		try {
			await InteractionUtils.send(intr, deletedEmbed);
			if (updatedTurn.currentRound === 0) {
				await InitiativeBuilderUtils.sendNewRoundMessage(intr, updatedBuilder);
			} else if (currentInitiative.currentTurnGroupId === actor.initiativeActorGroupId) {
				const currentTurnEmbed = KoboldEmbed.turnFromInitiativeBuilder(updatedBuilder);
				await currentTurnEmbed.sendBatches(intr, {
					contentOutsideEmbed: updatedBuilder.activeGroup
						? `<@!${updatedBuilder.activeGroup.userId}>`
						: undefined,
				});
				if (_.some(updatedBuilder.activeActors, candidate => candidate.hideStats)) {
					await KoboldEmbed.dmInitiativeWithHiddenStats({
						intr,
						currentTurn,
						targetTurn: updatedTurn,
						initBuilder: updatedBuilder,
					});
				}
			}
		} catch (error) {
			console.warn('Initiative actor removed, but notification failed', {
				initiativeId: currentInitiative.id,
				actorId: actor.id,
				error,
			});
			try {
				await InteractionUtils.send(
					intr,
					'The actor was removed successfully, but an initiative notification could not be delivered.'
				);
			} catch (notificationError) {
				console.warn(
					'Unable to deliver initiative removal confirmation',
					notificationError
				);
			}
		}
	}
}
