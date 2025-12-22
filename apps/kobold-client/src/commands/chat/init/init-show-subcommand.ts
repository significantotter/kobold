import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import { Kobold } from '@kobold/db';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitShowSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.show
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const initBuilder = new InitiativeBuilder({ initiative: currentInitiative });
		await KoboldEmbed.sendInitiative(intr, initBuilder, {
			dmIfHiddenCreatures: initBuilder.init.gmUserId === intr.user.id,
		});
	}
}
