import { refs } from '../../../../constants/common-text.js';
import { CharacterWithRelations, Kobold, ImportSourceEnum } from '@kobold/db';
import { PathBuilder } from '../../../../services/pathbuilder/index.js';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { Creature } from '../../../../utils/creature.js';
import { CharacterFetcher, SheetConversionResult } from './character-fetcher.js';
import type { PathBuilder as PB } from '../../../../services/pathbuilder/pathbuilder.js';
import { CommandInteraction, CacheType } from 'discord.js';
import { CharacterDefinition as CharacterCommand } from '@kobold/documentation';

export class PathbuilderCharacterFetcher extends CharacterFetcher<
	PB.Character,
	{ jsonId: number }
> {
	constructor(
		intr: CommandInteraction<CacheType>,
		kobold: Kobold,
		userId: string,
		public options: { useStamina: boolean } = { useStamina: false }
	) {
		super(intr, kobold, userId);
	}
	public importSource = ImportSourceEnum.pathbuilder;
	public async fetchSourceData(args: { jsonId: number }): Promise<PB.Character> {
		const pathBuilderChar = await new PathBuilder().get({ characterJsonId: args.jsonId });

		if (!pathBuilderChar.success) {
			throw new KoboldError(
				CharacterCommand.strings.importPathbuilder.failedRequest({
					supportServerUrl: refs.links.support,
				})
			);
		}
		return pathBuilderChar.build;
	}
	public convertSheetRecord(
		sourceData: PB.Character,
		activeCharacter?: CharacterWithRelations
	): SheetConversionResult {
		const creature = Creature.fromPathBuilder(sourceData, activeCharacter, {
			useStamina: this.options.useStamina,
		});
		return {
			sheetRecord: {
				sheet: creature._sheet,
			},
			actions: creature.actions.map(action => ({
				name: action.name,
				description: action.description,
				type: action.type,
				actionCost: action.actionCost,
				baseLevel: action.baseLevel,
				autoHeighten: action.autoHeighten,
				rolls: action.rolls,
				tags: action.tags,
			})),
			modifiers: creature.modifiers.map(modifier => ({
				name: modifier.name,
				description: modifier.description,
				type: modifier.type,
				isActive: modifier.isActive,
				note: modifier.note,
				rollAdjustment: modifier.rollAdjustment,
				rollTargetTags: modifier.rollTargetTags,
				severity: modifier.severity,
				sheetAdjustments: modifier.sheetAdjustments,
			})),
			rollMacros: creature.rollMacros.map(macro => ({
				name: macro.name,
				macro: macro.macro,
			})),
		};
	}
	public getCharId(args: { jsonId: number }): number {
		return args.jsonId;
	}
}
