import { ChatInputCommandInteraction } from 'discord.js';

import { Config } from '@kobold/config';
import { Kobold } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

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

		const exportJson =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.exportJson].name) ?? false;
		const actions = activeCharacter.actions;

		// Export as JSON in the response
		if (exportJson) {
			const jsonString = JSON.stringify(actions, null, 2);
			// Discord has a 2000 character limit, so we may need to truncate
			if (jsonString.length > 1900) {
				// Send as a file attachment instead
				const attachment = {
					name: `${activeCharacter.name}-actions.json`,
					attachment: Buffer.from(jsonString, 'utf-8'),
				};
				await InteractionUtils.send(intr, {
					content: `**${activeCharacter.name}'s Actions** (as JSON file):`,
					files: [attachment],
				});
			} else {
				await InteractionUtils.send(
					intr,
					`**${activeCharacter.name}'s Actions:**\n\`\`\`json\n${jsonString}\n\`\`\``
				);
			}
			return;
		}

		// Export to PasteBin
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
