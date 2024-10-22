import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { ModifierOptions } from './modifier-command-options.js';

import { compileExpression } from 'filtrex';
import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, Modifier, zModifier } from '@kobold/db';
import { PasteBin } from '../../../services/pastebin/index.js';
import {
	ignoreOnConflict,
	overwriteOnConflict,
	renameOnConflict,
	replaceAll,
} from '../../../utils/import-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierImportSubCommand implements Command {
	public name = L.en.commands.modifier.import.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.import.name(),
		description: L.en.commands.modifier.import.description(),
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
		let importMode = intr.options
			.getString(ModifierOptions.MODIFIER_IMPORT_MODE.name, true)
			.trim()
			.toLowerCase();
		let importUrl = intr.options
			.getString(ModifierOptions.MODIFIER_IMPORT_URL.name, true)
			.trim();

		const importId = TextParseHelpers.parsePasteBinIdFromText(importUrl);

		if (!importId) {
			await InteractionUtils.send(intr, LL.commands.modifier.import.interactions.badUrl());
			return;
		}

		let newModifiers: Modifier[] = [];

		let invalidJson = false;
		try {
			const modifiersText = await new PasteBin({}).get({ paste_key: importId });
			if (_.isArray(modifiersText)) {
				newModifiers = modifiersText;
			} else {
				newModifiers = JSON.parse(modifiersText);
			}
			const valid = zModifier.safeParse(newModifiers);
			if (!valid.success) {
				invalidJson = true;
			} else {
				for (const modifier of newModifiers) {
					if (modifier.rollTargetTags) {
						// throws an error on an invalid expression
						compileExpression(modifier.rollTargetTags ?? '');
					}
				}
			}
		} catch (err) {
			console.warn(err);
			invalidJson = true;
		}
		if (invalidJson) {
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.import.interactions.failedParsing()
			);
			return;
		}
		const currentModifiers = activeCharacter.sheetRecord.modifiers;

		let finalModifiers: Modifier[] = [];

		if (importMode === L.en.commandOptions.modifierImportMode.choices.fullyReplace.value()) {
			finalModifiers = replaceAll(currentModifiers, newModifiers);
		} else if (
			importMode === L.en.commandOptions.modifierImportMode.choices.overwrite.value()
		) {
			finalModifiers = overwriteOnConflict(currentModifiers, newModifiers);
		} else if (
			importMode === L.en.commandOptions.modifierImportMode.choices.renameOnConflict.value()
		) {
			finalModifiers = renameOnConflict(currentModifiers, newModifiers);
		} else if (
			importMode === L.en.commandOptions.modifierImportMode.choices.ignoreOnConflict.value()
		) {
			finalModifiers = ignoreOnConflict(currentModifiers, newModifiers);
		} else {
			console.error('failed to match an import option');
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.import.interactions.failedParsing()
			);
			return;
		}

		await kobold.sheetRecord.update(
			{
				id: activeCharacter.sheetRecordId,
			},
			{
				modifiers: finalModifiers,
			}
		);

		await InteractionUtils.send(
			intr,
			LL.commands.modifier.import.interactions.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
