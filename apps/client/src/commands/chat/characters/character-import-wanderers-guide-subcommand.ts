import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { Config } from '@kobold/config';
import { InteractionUtils } from '../../../utils/index.js';
import { Command } from '../../index.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterImportWanderersGuideSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.importWanderersGuide
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const importUrl = `${Config.web.frontendBaseUrl}/import`;
		await InteractionUtils.send(
			intr,
			`Yip! Wanderer's Guide imports use the Kobold web app.\n\n` +
				`**How to import:**\n` +
				`1. Export your character from [Wanderer's Guide](https://wanderersguide.app) as JSON\n` +
				`2. Visit **${importUrl}** and log in with Discord\n` +
				`3. Upload the JSON file on the Import page`
		);
	}
}
