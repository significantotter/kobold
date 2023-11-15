import { Action, Character, CharacterModel, zAction } from '../../../services/kobold/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import _ from 'lodash';
import { PasteBin } from '../../../services/pastebin/index.js';
import {
	replaceAll,
	overwriteOnConflict,
	renameOnConflict,
	ignoreOnConflict,
} from '../../../utils/import-utils.js';
import { ActionOptions } from '../action/action-command-options.js';
import L from '../../../i18n/i18n-node.js';
import { z } from 'zod';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { Kobold } from '../../../services/kobold/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

export class ActionImportSubCommand implements Command {
	public names = [L.en.commands.action.import.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.import.name(),
		description: L.en.commands.action.import.description(),
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
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		let importMode = intr.options
			.getString(ActionOptions.ACTION_IMPORT_MODE_OPTION.name, true)
			.trim()
			.toLowerCase();
		let importUrl = intr.options
			.getString(ActionOptions.ACTION_IMPORT_URL_OPTION.name, true)
			.trim();

		const importId = TextParseHelpers.parsePastebinIdFromText(importUrl);

		if (!importId) {
			await InteractionUtils.send(intr, LL.commands.action.import.interactions.badUrl());
			return;
		}

		let newActions: Action[] = [];

		let invalidJson = false;
		try {
			const actionsText = await new PasteBin({}).get({ paste_key: importId });
			if (_.isArray(actionsText)) {
				newActions = actionsText;
			} else {
				newActions = JSON.parse(actionsText);
			}
			newActions = z.array(zAction).parse(newActions);
		} catch (err) {
			console.warn(err);
			invalidJson = true;
		}
		if (invalidJson) {
			await InteractionUtils.send(
				intr,
				LL.commands.action.import.interactions.failedParsing()
			);
			return;
		}
		const currentActions = activeCharacter.sheetRecord.actions;

		let finalActions: Action[] = [];

		if (importMode === L.en.commandOptions.actionImportMode.choices.fullyReplace.value()) {
			finalActions = replaceAll(currentActions, newActions);
		} else if (importMode === L.en.commandOptions.actionImportMode.choices.overwrite.value()) {
			finalActions = overwriteOnConflict(currentActions, newActions);
		} else if (
			importMode === L.en.commandOptions.actionImportMode.choices.renameOnConflict.value()
		) {
			finalActions = renameOnConflict(currentActions, newActions);
		} else if (
			importMode === L.en.commandOptions.actionImportMode.choices.ignoreOnConflict.value()
		) {
			finalActions = ignoreOnConflict(currentActions, newActions);
		} else {
			console.error('failed to match an import option');
			await InteractionUtils.send(
				intr,
				LL.commands.action.import.interactions.failedParsing()
			);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{ actions: finalActions }
		);

		await InteractionUtils.send(
			intr,
			LL.commands.action.import.interactions.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
