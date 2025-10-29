import { ChatInputCommandInteraction } from 'discord.js';
import {
	Action,
	Kobold,
	Modifier,
	RollMacro,
	Sheet,
	zAction,
	zModifier,
	zRollMacro,
	zSheet,
} from '@kobold/db';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { type Command } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { z } from 'zod';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';
import { CharacterCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export const zPasteBinImport = z.object({
	sheet: zSheet.optional(),
	modifiers: zModifier.array().optional(),
	actions: zAction.array().optional(),
	rollMacros: zRollMacro.array().optional(),
});

export class CharacterImportPasteBinSubCommand extends BaseCommandClass(
	CharacterCommand,
	CharacterCommand.subCommandEnum.importPasteBin
) {
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
