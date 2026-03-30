import { ChatInputCommandInteraction } from 'discord.js';
import { Action, zAction } from '@kobold/db';

import _ from 'lodash';
import { z } from 'zod';
import { Kobold } from '@kobold/db';
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
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionImportSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.import
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		let importMode = intr.options
			.getString(commandOptions[commandOptionsEnum.importMode].name, true)
			.trim()
			.toLowerCase();
		let importUrl = intr.options.getString(commandOptions[commandOptionsEnum.url].name)?.trim();
		let rawJson = intr.options.getString(commandOptions[commandOptionsEnum.json].name)?.trim();

		// Must provide either URL or JSON
		if (!importUrl && !rawJson) {
			await InteractionUtils.send(
				intr,
				'Yip! You must provide either a pastebin URL or raw JSON data to import.'
			);
			return;
		}

		let newActions: Action[] = [];
		let invalidJson = false;

		try {
			let actionsText: string | Action[];

			if (rawJson) {
				// Use raw JSON directly
				actionsText = rawJson;
			} else if (importUrl) {
				// Fetch from PasteBin
				const importId = TextParseHelpers.parsePasteBinIdFromText(importUrl);

				if (!importId) {
					await InteractionUtils.send(intr, ActionDefinition.strings.import.badUrl);
					return;
				}

				actionsText = await new PasteBin({}).get({ paste_key: importId });
			} else {
				await InteractionUtils.send(intr, ActionDefinition.strings.import.badUrl);
				return;
			}

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
			await InteractionUtils.send(intr, ActionDefinition.strings.import.failedParsing);
			return;
		}
		const currentActions = activeCharacter.actions;

		let finalActions: Action[] = [];

		const importModes = ActionDefinition.optionChoices.importMode;
		if (importMode === importModes.overwriteAll) {
			finalActions = replaceAll(currentActions, newActions);
		} else if (importMode === importModes.overwriteOnConflict) {
			finalActions = overwriteOnConflict(currentActions, newActions);
		} else if (importMode === importModes.renameOnConflict) {
			finalActions = renameOnConflict(currentActions, newActions);
		} else if (importMode === importModes.ignoreOnConflict) {
			finalActions = ignoreOnConflict(currentActions, newActions);
		} else {
			console.error('failed to match an import option');
			await InteractionUtils.send(intr, ActionDefinition.strings.import.failedParsing);
			return;
		}

		// Delete all existing actions and create the final actions
		await kobold.action.deleteBySheetRecordId({
			sheetRecordId: activeCharacter.sheetRecordId,
		});
		for (const action of finalActions) {
			await kobold.action.create({
				userId: intr.user.id,
				sheetRecordId: activeCharacter.sheetRecordId,
				name: action.name,
				description: action.description,
				type: action.type,
				actionCost: action.actionCost,
				baseLevel: action.baseLevel,
				autoHeighten: action.autoHeighten,
				rolls: action.rolls,
				tags: action.tags,
			});
		}

		await InteractionUtils.send(
			intr,
			ActionDefinition.strings.import.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
