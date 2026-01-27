import { ChatInputCommandInteraction } from 'discord.js';
import { compileExpression } from 'filtrex';
import _ from 'lodash';
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
import { Command } from '../../index.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierImportSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.import
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
		let importUrl = intr.options
			.getString(commandOptions[commandOptionsEnum.importUrl].name, true)
			.trim();

		const importId = TextParseHelpers.parsePasteBinIdFromText(importUrl);

		if (!importId) {
			await InteractionUtils.send(intr, ModifierDefinition.strings.import.badUrl);
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
			const valid = zModifier.array().safeParse(newModifiers);
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
			await InteractionUtils.send(intr, ModifierDefinition.strings.import.failedParsing);
			return;
		}
		const currentModifiers = activeCharacter.sheetRecord.modifiers;

		let finalModifiers: Modifier[] = [];

		const importModes = ModifierDefinition.optionChoices.importMode;
		if (importMode === importModes.overwriteAll) {
			finalModifiers = replaceAll(currentModifiers, newModifiers);
		} else if (importMode === importModes.overwriteOnConflict) {
			finalModifiers = overwriteOnConflict(currentModifiers, newModifiers);
		} else if (importMode === importModes.renameOnConflict) {
			finalModifiers = renameOnConflict(currentModifiers, newModifiers);
		} else if (importMode === importModes.ignoreOnConflict) {
			finalModifiers = ignoreOnConflict(currentModifiers, newModifiers);
		} else {
			console.error('failed to match an import option');
			await InteractionUtils.send(intr, ModifierDefinition.strings.import.failedParsing);
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
			ModifierDefinition.strings.import.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
