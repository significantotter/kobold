import { ChatInputCommandInteraction } from 'discord.js';

import { Config } from '@kobold/config';
import { Kobold } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ActionExportSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.export
) {
	public async execute(
		intr: ChatInputCommandInteraction,
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
			ActionDefinition.strings.export.success({
				characterName: activeCharacter.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
