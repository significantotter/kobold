import { ChatInputCommandInteraction } from 'discord.js';

import { Config } from '@kobold/config';
import { Kobold } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ModifierExportSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.export
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const modifiers = activeCharacter.sheetRecord.modifiers;

		const pastebinPost = await new PasteBin({ apiKey: Config.pastebin.apiKey }).post({
			code: JSON.stringify(modifiers),
			name: `${activeCharacter.name}'s Modifiers`,
		});

		await InteractionUtils.send(
			intr,
			ModifierDefinition.strings.export.success({
				characterName: activeCharacter.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
