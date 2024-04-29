import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Config } from '@kobold/config';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierExportSubCommand implements Command {
	public names = [L.en.commands.modifier.export.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.export.name(),
		description: L.en.commands.modifier.export.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
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
			LL.commands.modifier.export.interactions.success({
				characterName: activeCharacter.name,
				pasteBinLink: pastebinPost,
			})
		);
	}
}
