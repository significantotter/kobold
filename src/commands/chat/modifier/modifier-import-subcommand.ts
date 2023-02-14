import { ModifierOptions } from './modifier-command-options';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Character } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { compileExpression } from 'filtrex';
import { PasteBin } from '../../../services/pastebin/index.js';
import characterSchema from './../../../services/kobold/models/character/character.schema.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import _ from 'lodash';
import { ignoreOnConflict, overwriteOnConflict, renameOnConflict, replaceAll } from './helpers.js';
const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

export class ModifierImportSubCommand implements Command {
	public names = [Language.LL.commands.modifier.import.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.import.name(),
		description: Language.LL.commands.modifier.import.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let importMode = intr.options
			.getString(ModifierOptions.MODIFIER_IMPORT_MODE.name)
			.trim()
			.toLowerCase();
		let importUrl = intr.options.getString(ModifierOptions.MODIFIER_IMPORT_URL.name).trim();

		const importId = CharacterUtils.parsePastebinIdFromText(importUrl);

		if (!importId) {
			await InteractionUtils.send(intr, LL.commands.modifier.import.interactions.badUrl());
			return;
		}

		let newModifiers = [];

		let invalidJson = false;
		try {
			const modifiersText = await new PasteBin({}).get({ paste_key: importId });
			if (_.isArray(modifiersText)) {
				newModifiers = modifiersText;
			} else {
				newModifiers = JSON.parse(modifiersText);
			}
			const valid = ajv.validate(characterSchema.properties.modifiers, newModifiers);
			if (!valid) {
				invalidJson = true;
			} else {
				for (const modifier of newModifiers) {
					// throws an error on an invalid expression
					compileExpression(modifier.targetTags);
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
		if (activeCharacter.modifiers.length + newModifiers.length > 50) {
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.tooMany());
			return;
		}
		const currentModifiers = activeCharacter.modifiers;

		let finalModifiers: Character['modifiers'] = [];

		if (
			importMode ===
			Language.LL.commandOptions.modifierImportMode.choices.fullyReplace.value()
		) {
			finalModifiers = replaceAll(currentModifiers, newModifiers);
		} else if (
			importMode === Language.LL.commandOptions.modifierImportMode.choices.overwrite.value()
		) {
			finalModifiers = overwriteOnConflict(currentModifiers, newModifiers);
		} else if (
			importMode ===
			Language.LL.commandOptions.modifierImportMode.choices.renameOnConflict.value()
		) {
			finalModifiers = renameOnConflict(currentModifiers, newModifiers);
		} else if (
			importMode ===
			Language.LL.commandOptions.modifierImportMode.choices.ignoreOnConflict.value()
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

		await Character.query().patchAndFetchById(activeCharacter.id, {
			modifiers: finalModifiers,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.modifier.import.interactions.imported({
				characterName: activeCharacter.characterData.name,
			})
		);
		return;
	}
}
