import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold, zAction, zModifier, zRollMacro, zSheet } from '@kobold/db';

import _ from 'lodash';
import { InteractionUtils } from '../../../utils/index.js';
import { type Command } from '../../index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { z } from 'zod';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export const zPasteBinImport = z.object({
	sheet: zSheet.optional(),
	modifiers: zModifier.array().optional(),
	actions: zAction.array().optional(),
	rollMacros: zRollMacro.array().optional(),
});

export class CharacterImportPasteBinSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.importPasteBin
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const url = intr.options.getString(
			commandOptions[commandOptionsEnum.pastebinUrl].name,
			true
		);

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
			CharacterDefinition.strings.importPasteBin.success({
				characterName: newCharacter.name,
			})
		);
	}
}
