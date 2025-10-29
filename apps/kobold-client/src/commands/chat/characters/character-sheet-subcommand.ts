import { ChatInputCommandInteraction } from 'discord.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecordTrackerModeEnum } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameOptions } from '../game/game-command-options.js';
import { CharacterCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterSheetSubCommand extends BaseCommandClass(
	CharacterCommand,
	CharacterCommand.subCommandEnum.sheet
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const sheetStyle =
			intr.options.getString(GameOptions.GAME_SHEET_STYLE.name) ??
			SheetRecordTrackerModeEnum.full_sheet;
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);
		const embed = creature.compileEmbed('Sheet', sheetStyle);

		await embed.sendBatches(intr);
	}
}
