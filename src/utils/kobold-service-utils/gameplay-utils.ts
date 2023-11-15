import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold, SheetBaseCounterKeys, SheetRecord } from '../../services/kobold/index.js';
import { Creature } from '../creature.js';
import { KoboldUtils } from './kobold-utils.js';

export class GameplayUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async recoverGameplayStats(
		intr: ChatInputCommandInteraction,
		sheetRecord: SheetRecord,
		creature: Creature
	) {
		let recoverValues = creature.recover();
		await this.koboldUtils.creatureUtils.saveSheet(intr, {
			...sheetRecord,
			sheet: creature._sheet,
		});
		return recoverValues;
	}
	public async setGameplayStats(
		intr: ChatInputCommandInteraction,
		sheetRecord: SheetRecord,
		creature: Creature,
		option: SheetBaseCounterKeys,
		value: string
	) {
		let updateValues = creature.updateValue(option, value);
		await this.koboldUtils.creatureUtils.saveSheet(intr, {
			...sheetRecord,
			sheet: creature._sheet,
		});
		return updateValues;
	}
}
