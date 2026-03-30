import { ChatInputCommandInteraction } from 'discord.js';
import { compileExpression } from 'filtrex';
import _ from 'lodash';
import { Kobold, NewModifier, zCondition } from '@kobold/db';
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

		let newModifiers: NewModifier[] = [];

		let invalidJson = false;
		try {
			const modifiersText = await new PasteBin({}).get({ paste_key: importId });
			if (_.isArray(modifiersText)) {
				newModifiers = modifiersText;
			} else {
				newModifiers = JSON.parse(modifiersText);
			}
			const valid = zCondition.array().safeParse(newModifiers);
			if (!valid.success) {
				invalidJson = true;
			} else {
				for (const modifier of newModifiers) {
					if (modifier.rollTargetTags) {
						// throws an error on an invalid expression
						compileExpression(
							Array.isArray(modifier.rollTargetTags)
								? modifier.rollTargetTags.join(' ')
								: (modifier.rollTargetTags ?? '')
						);
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
		const currentModifiers = activeCharacter.modifiers;

		let finalModifiers: NewModifier[] = [];

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

		// Delete all existing modifiers for this character
		await kobold.modifier.deleteBySheetRecordId({
			sheetRecordId: activeCharacter.sheetRecordId,
		});

		// Create all the final modifiers
		for (const modifier of finalModifiers) {
			const newModifier: NewModifier = {
				name: modifier.name,
				isActive: modifier.isActive,
				description: modifier.description ?? '',
				type: modifier.type,
				severity: modifier.severity,
				sheetAdjustments: modifier.sheetAdjustments,
				rollTargetTags: modifier.rollTargetTags,
				rollAdjustment: modifier.rollAdjustment,
				note: modifier.note,
				sheetRecordId: activeCharacter.sheetRecordId,
				userId: intr.user.id,
			};
			await kobold.modifier.create(newModifier);
		}

		await InteractionUtils.send(
			intr,
			ModifierDefinition.strings.import.imported({
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
