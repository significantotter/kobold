import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitShowSubCommand extends BaseCommandClass(
	InitCommand,
	InitCommand.subCommandEnum.show
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const initBuilder = new InitiativeBuilder({ initiative: currentInitiative, LL });
		await KoboldEmbed.sendInitiative(intr, initBuilder, LL, {
			dmIfHiddenCreatures: initBuilder.init.gmUserId === intr.user.id,
		});
	}
}
