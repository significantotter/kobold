import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import {
	Action,
	CharacterWithRelations,
	Modifier,
	NewSheetRecord,
	RollMacro,
	Sheet,
	zAction,
	zModifier,
	zRollMacro,
	zSheet,
} from 'kobold-db';
import { PasteBin } from '../../../../services/pastebin/index.js';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { Creature } from '../../../../utils/creature.js';
import { SheetProperties } from '../../../../utils/sheet/sheet-properties.js';
import { CharacterFetcher } from './character-fetcher.js';

export const zPasteBinImport = z.object({
	sheet: zSheet.optional(),
	modifiers: z.array(zModifier).optional(),
	actions: z.array(zAction).optional(),
	rollMacros: z.array(zRollMacro).optional(),
});
export class PasteBinCharacterFetcher extends CharacterFetcher<
	{
		sheet: Sheet;
		modifiers: Modifier[];
		actions: Action[];
		rollMacros: RollMacro[];
	},
	{ url: string }
> {
	public importSource = 'pastebin';
	public async fetchSourceData(args: { url: string }): Promise<{
		sheet: Sheet;
		modifiers: Modifier[];
		actions: Action[];
		rollMacros: RollMacro[];
	}> {
		const characterJSON = await new PasteBin({}).get({ paste_key: args.url }).catch(() => {
			throw new KoboldError(`Yip! I couldn't access the url "${args.url}".`);
		});

		// sheet record properties
		let sheet: Sheet;
		let modifiers: Modifier[];
		let actions: Action[];
		let rollMacros: RollMacro[];

		const parseResult = zPasteBinImport.safeParse(characterJSON);
		if (parseResult.success) {
			sheet = parseResult.data.sheet || SheetProperties.defaultSheet;
			modifiers = parseResult.data.modifiers || [];
			actions = parseResult.data.actions || [];
			rollMacros = parseResult.data.rollMacros || [];
		} else {
			throw new KoboldError(
				`Yip! I wasn't able to parse the character data at the url ${args.url}. ` +
					`This is likely an issue with the tool that exports the data. ` +
					`Please report the following error data to the creator of the tool:\n\n` +
					fromZodError(parseResult.error)
			);
		}
		return {
			sheet,
			modifiers,
			actions,
			rollMacros,
		};
	}
	public convertSheetRecord(
		sourceData: {
			sheet: Sheet;
			modifiers: Modifier[];
			actions: Action[];
			rollMacros: RollMacro[];
		},
		activeCharacter?: CharacterWithRelations
	): NewSheetRecord {
		const finalActions = activeCharacter?.sheetRecord?.actions ?? [];
		for (const action of sourceData.actions) {
			const existingAction = finalActions.findIndex(a => a.name === action.name);
			if (existingAction > -1) {
				finalActions[existingAction] = action;
			} else {
				finalActions.push(action);
			}
		}
		const finalModifiers = activeCharacter?.sheetRecord?.modifiers ?? [];
		for (const modifier of sourceData.modifiers) {
			const existingModifier = finalModifiers.findIndex(a => a.name === modifier.name);
			if (existingModifier > -1) {
				finalModifiers[existingModifier] = modifier;
			} else {
				finalModifiers.push(modifier);
			}
		}
		const finalRollMacros = activeCharacter?.sheetRecord?.rollMacros ?? [];
		for (const rollMacro of sourceData.rollMacros) {
			const existingRollMacro = finalRollMacros.findIndex(a => a.name === rollMacro.name);
			if (existingRollMacro > -1) {
				finalRollMacros[existingRollMacro] = rollMacro;
			} else {
				finalRollMacros.push(rollMacro);
			}
		}

		let updatedSheet = sourceData.sheet;
		if (activeCharacter) {
			updatedSheet = Creature.preserveSheetTrackerValues(
				updatedSheet,
				activeCharacter.sheetRecord.sheet
			);
		}
		return {
			sheet: sourceData.sheet,
			actions: finalActions,
			modifiers: finalModifiers,
			rollMacros: finalRollMacros,
		} satisfies NewSheetRecord;
	}
	public getCharId(args: { url: string }): number {
		return -1;
	}
}
