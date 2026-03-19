import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import { Kobold, MinionWithRelations, SheetAdjustmentTypeEnum } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Creature } from '../../../utils/creature.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionUpdateSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.update
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.minion].name);
			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions = await kobold.minion.readMany({
				characterId: activeCharacter.id,
			});

			return minions
				.filter((m: MinionWithRelations) =>
					m.name.toLowerCase().includes((match ?? '').toLowerCase())
				)
				.map((m: MinionWithRelations) => ({
					name: m.name,
					value: m.name,
				}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.minion].name, true)
			.trim();
		const statsInput = intr.options.getString(commandOptions[commandOptionsEnum.stats].name);

		// Find the minion
		const minions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name}!`
			);
		}

		// If no stats provided, nothing to update
		if (!statsInput) {
			throw new KoboldError('Yip! You must provide stats to update the minion with!');
		}

		// Get the current sheet and apply the stat adjustments
		let sheet = targetMinion.sheet;

		const adjustments = SheetUtils.stringToSheetAdjustments(
			statsInput,
			SheetAdjustmentTypeEnum.untyped
		);
		const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

		const creature = new Creature(
			{
				sheet: adjustedSheet,
				actions: targetMinion.actions ?? [],
				rollMacros: targetMinion.rollMacros ?? [],
				modifiers: targetMinion.modifiers ?? [],
				conditions: [],
			},
			undefined,
			intr
		);
		creature.recover();
		sheet = creature._sheet;

		// Keep the minion's original name
		sheet = _.merge(sheet, { staticInfo: { name: targetMinion.name } });

		// Update the minion's sheet
		await kobold.minion.update({ id: targetMinion.id }, { sheet });

		// Update the sheetRecord if it exists
		if (targetMinion.sheetRecordId) {
			await kobold.sheetRecord.update({ id: targetMinion.sheetRecordId }, { sheet });
		}

		await InteractionUtils.send(
			intr,
			`Yip! I've updated the minion "${targetMinion.name}" with the new stats!`
		);
	}
}
