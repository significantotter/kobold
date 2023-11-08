import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { PasteBin } from '../../../services/pastebin/index.js';
import { CharacterUtils } from '../../../utils/kobold-service-utils/character-utils.js';
import { Config } from '../../../config/config.js';
import L from '../../../i18n/i18n-node.js';

export class ActionExportSubCommand implements Command {
	public names = [L.en.commands.action.export.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.export.name(),
		description: L.en.commands.action.export.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const actions = activeCharacter.actions;

		const pastebinPost = await new PasteBin({ apiKey: Config.pastebin.apiKey }).post({
			code: JSON.stringify(actions),
			name: `${activeCharacter.sheet.staticInfo.name}'s Actions`,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.action.export.interactions.success({
				characterName: activeCharacter.sheet.staticInfo.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
