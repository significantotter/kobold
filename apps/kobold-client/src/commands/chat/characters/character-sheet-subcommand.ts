import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold, SheetRecordTrackerModeEnum } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export class CharacterSheetSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.sheet
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const sheetStyle =
			intr.options.getString(commandOptions[commandOptionsEnum.sheetStyle].name) ??
			SheetRecordTrackerModeEnum.full_sheet;
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);
		const embed = creature.compileEmbed('Sheet', sheetStyle);

		await embed.sendBatches(intr);
	}
}
