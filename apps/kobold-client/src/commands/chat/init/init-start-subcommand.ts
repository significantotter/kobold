import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { InitDefinition, utilStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitStartSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.start
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const startingUser = intr.user.id;
		if (!intr.channel || !intr.channel.id) {
			await InteractionUtils.send(intr, utilStrings.initiative.initOutsideServerChannelError);
			return;
		}
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchDataForCommand(intr, {
			currentInitiative: true,
		});
		if (currentInitiative) {
			throw new KoboldError(InitDefinition.strings.start.initExistsError);
		}

		try {
			const init = await kobold.initiative.create({
				gmUserId: startingUser,
				channelId: intr.channelId,
				currentTurnGroupId: null,
				currentRound: 0,
			});

			const initBuilder = new InitiativeBuilder({
				initiative: init,
				actors: init.actors,
				groups: init.actorGroups,
			});
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			const message = await InteractionUtils.send(intr, embed);

			const updatedEmbed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			message
				? await message.edit({ embeds: [updatedEmbed] })
				: InteractionUtils.send(intr, updatedEmbed);
		} catch (err) {
			if (err instanceof KoboldError) throw err;
			else {
				console.warn(err);
				throw new KoboldError(InitDefinition.strings.start.otherError);
			}
		}
	}
}
