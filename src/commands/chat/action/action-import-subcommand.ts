import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { compileExpression } from 'filtrex';
import _ from 'lodash';
import { PasteBin } from '../../../services/pastebin/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import {
	replaceAll,
	overwriteOnConflict,
	renameOnConflict,
	ignoreOnConflict,
} from '../../../utils/import-utils.js';
import { ActionOptions } from '../action/action-command-options.js';
import characterSchema from './../../../services/kobold/models/character/character.schema.json';
const ajv = new Ajv({ allowUnionTypes: true });

export class ActionImportSubCommand implements Command {
	public names = [Language.LL.commands.action.import.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.import.name(),
		description: Language.LL.commands.action.import.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let importMode = intr.options
			.getString(ActionOptions.ACTION_IMPORT_MODE_OPTION.name)
			.trim()
			.toLowerCase();
		let importUrl = (
			intr.options.getString(ActionOptions.ACTION_IMPORT_URL_OPTION.name) ?? ''
		).trim();

		const importId = CharacterUtils.parsePastebinIdFromText(importUrl);

		if (!importId) {
			await InteractionUtils.send(intr, LL.commands.action.import.interactions.badUrl());
			return;
		}

		let newActions: Character['actions'] = [];

		let invalidJson = false;
		try {
			const actionsText = await new PasteBin({}).get({ paste_key: importId });
			if (_.isArray(actionsText)) {
				newActions = actionsText;
			} else {
				newActions = JSON.parse(actionsText);
			}
			const valid = ajv.validate(characterSchema.properties.actions, newActions);
			if (!valid) {
				invalidJson = true;
			}
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
		if (activeCharacter.actions.length + newActions.length > 50) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.tooMany());
			return;
		}
		const currentActions = activeCharacter.actions;

		let finalActions: Character['actions'] = [];

		if (
			importMode === Language.LL.commandOptions.actionImportMode.choices.fullyReplace.value()
		) {
			finalActions = replaceAll(currentActions, newActions);
		} else if (
			importMode === Language.LL.commandOptions.actionImportMode.choices.overwrite.value()
		) {
			finalActions = overwriteOnConflict(currentActions, newActions);
		} else if (
			importMode ===
			Language.LL.commandOptions.actionImportMode.choices.renameOnConflict.value()
		) {
			finalActions = renameOnConflict(currentActions, newActions);
		} else if (
			importMode ===
			Language.LL.commandOptions.actionImportMode.choices.ignoreOnConflict.value()
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

		await Character.query().patchAndFetchById(activeCharacter.id, {
			actions: finalActions,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.action.import.interactions.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
