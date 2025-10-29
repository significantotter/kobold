import { ChatInputCommandInteraction } from 'discord.js';

import { Config } from '@kobold/config';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ActionExportSubCommand extends BaseCommandClass(
	ActionCommand,
	ActionCommand.subCommandEnum.export
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const actions = activeCharacter.sheetRecord.actions;

		const pastebinPost = await new PasteBin({ apiKey: Config.pastebin.apiKey }).post({
			code: JSON.stringify(actions),
			name: `${activeCharacter.name}'s Actions`,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.action.export.interactions.success({
				characterName: activeCharacter.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
