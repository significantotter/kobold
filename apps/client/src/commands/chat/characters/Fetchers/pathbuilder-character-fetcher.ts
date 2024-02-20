import { refs } from '../../../../constants/common-text.js';
import L from '../../../../i18n/i18n-node.js';
import { CharacterWithRelations, Kobold, NewSheetRecord } from 'kobold-db';
import { PathBuilder } from '../../../../services/pathbuilder/index.js';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { Creature } from '../../../../utils/creature.js';
import { CharacterFetcher } from './character-fetcher.js';
import type { PathBuilder as PB } from '../../../../services/pathbuilder/pathbuilder.js';
import { CommandInteraction, CacheType } from 'discord.js';

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
	public importSource = 'pathbuilder';
	public async fetchSourceData(args: { jsonId: number }): Promise<PB.Character> {
		const pathBuilderChar = await new PathBuilder().get({ characterJsonId: args.jsonId });

		if (!pathBuilderChar.success) {
			throw new KoboldError(
				L.en.commands.character.importPathbuilder.interactions.failedRequest({
					supportServerUrl: refs.links.support,
				})
			);
		}
		return pathBuilderChar.build;
	}
	public convertSheetRecord(
		sourceData: PB.Character,
		activeCharacter?: CharacterWithRelations
	): NewSheetRecord {
		const creature = Creature.fromPathBuilder(sourceData, activeCharacter?.sheetRecord, {
			useStamina: this.options.useStamina,
		});
		return {
			sheet: creature._sheet,
			actions: creature.actions,
			modifiers: creature.modifiers,
			rollMacros: creature.rollMacros,
		} satisfies NewSheetRecord;
	}
	public getCharId(args: { jsonId: number }): number {
		return args.jsonId;
	}
}
