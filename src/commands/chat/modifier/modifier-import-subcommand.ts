import { ModifierOptions } from './modifier-command-options.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Character, Modifier, zModifier } from '../../../services/kobold/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/kobold-service-utils/character-utils.js';
import { compileExpression } from 'filtrex';
import { PasteBin } from '../../../services/pastebin/index.js';
import _ from 'lodash';
import {
	ignoreOnConflict,
	overwriteOnConflict,
	renameOnConflict,
	replaceAll,
} from '../../../utils/import-utils.js';
import { CharacterModel } from '../../../services/kobold/models-old/character/character.model.js';

export class ModifierImportSubCommand implements Command {
	public names = [L.en.commands.modifier.import.name()];
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
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let importMode = intr.options
			.getString(ModifierOptions.MODIFIER_IMPORT_MODE.name, true)
			.trim()
			.toLowerCase();
		let importUrl = intr.options
			.getString(ModifierOptions.MODIFIER_IMPORT_URL.name, true)
			.trim();

		const importId = CharacterUtils.parsePastebinIdFromText(importUrl);

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
					if (modifier.modifierType === 'roll') {
						// throws an error on an invalid expression
						compileExpression(modifier.targetTags ?? '');
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
		const currentModifiers = activeCharacter.modifiers;

		let finalModifiers: Character['modifiers'] = [];

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

		await CharacterModel.query().patchAndFetchById(activeCharacter.id, {
			modifiers: finalModifiers,
		});

		await InteractionUtils.send(
			intr,
			LL.commands.modifier.import.interactions.imported({
				characterName: activeCharacter.sheet.staticInfo.name,
			})
		);
		return;
	}
}
