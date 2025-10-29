import { ChatInputCommandInteraction } from 'discord.js';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitPrevSubCommand extends BaseCommandClass(
	InitCommand,
	InitCommand.subCommandEnum.prev
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				userSettings: true,
			});

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			userSettings,
			LL,
		});
		const previousTurn = initBuilder.getPreviousTurnChanges();
		const currentTurn = initBuilder.getCurrentTurnInfo();

		const updatedInitiative = await kobold.initiative.update(
			{ id: currentInitiative.id },
			previousTurn
		);

		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder);
		const activeGroup = initBuilder.activeGroup;

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
	}
}
