import { ChatInputCommandInteraction } from 'discord.js';
import _ from 'lodash';
import { Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { SheetProperties } from '../../../utils/sheet/sheet-properties.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Creature } from '../../../utils/creature.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionCreateSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.create
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		const statsInput = intr.options.getString(commandOptions[commandOptionsEnum.stats].name);

		if (!minionName || minionName.length === 0) {
			throw new KoboldError('Yip! You must provide a name for the minion!');
		}

		if (minionName.length > 100) {
			throw new KoboldError('Yip! The minion name must be 100 characters or less!');
		}

		// Check if a minion with this name already exists for this character
		const existingMinions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});
		const existingMinion = existingMinions.find(
			(m: { name: string }) => m.name.toLowerCase() === minionName.toLowerCase()
		);
		if (existingMinion) {
			throw new KoboldError(
				`Yip! A minion named "${minionName}" already exists for ${activeCharacter.name}!`
			);
		}

		let sheet = SheetProperties.defaultSheet;

		// Set the minion name on the sheet
		sheet = _.merge(sheet, { staticInfo: { name: minionName } });

		// If custom stats are provided, parse and apply them
		if (statsInput) {
			const adjustments = SheetUtils.stringToSheetAdjustments(
				statsInput,
				SheetAdjustmentTypeEnum.untyped
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

			const creature = new Creature(
				{
					sheet: adjustedSheet,
					actions: [],
					rollMacros: [],
					modifiers: [],
					conditions: [],
				},
				undefined,
				intr
			);
			creature.recover();
			sheet = creature._sheet;
		}

		// Create a sheetRecord for the minion's actions/modifiers/rollMacros
		const sheetRecord = await kobold.sheetRecord.create({ sheet });

		// Create the minion
		await kobold.minion.create({
			name: minionName,
			sheet,
			userId: intr.user.id,
			characterId: activeCharacter.id,
			sheetRecordId: sheetRecord.id,
		});

		await InteractionUtils.send(
			intr,
			`Yip! I've created the minion "${minionName}" for ${activeCharacter.name}!`
		);
	}
}
