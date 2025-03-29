import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold, zAction, zModifier, zRollMacro, zSheet } from '@kobold/db';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { type Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { z } from 'zod';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';

export const zPasteBinImport = z.object({
	sheet: zSheet.optional(),
	modifiers: z.array(zModifier).optional(),
	actions: z.array(zAction).optional(),
	rollMacros: z.array(zRollMacro).optional(),
});

export class CharacterImportPasteBinSubCommand implements Command {
	public name = L.en.commands.character.importPasteBin.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.importPasteBin.name(),
		description: L.en.commands.character.importPasteBin.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const url = intr.options.getString(CharacterOptions.IMPORT_PASTEBIN_OPTION.name, true);

		const importId = TextParseHelpers.parsePasteBinIdFromText(url);

		if (!importId) {
			await InteractionUtils.send(intr, `Yip! I couldn't parse the url "${url}".`);
			return;
		}
		const fetcher = new PasteBinCharacterFetcher(intr, kobold, intr.user.id);
		const newCharacter = await fetcher.create({ url: importId });

		//send success message
		await InteractionUtils.send(
			intr,
			LL.commands.character.importPasteBin.interactions.success({
				characterName: newCharacter.name,
			})
		);
	}
}
