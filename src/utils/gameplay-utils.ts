import { ChatInputCommandInteraction, Client } from 'discord.js';
import { Character, InitiativeActor, ModelWithSheet } from '../services/kobold/models/index.js';
import { KoboldError } from './KoboldError.js';
import { Creature, SettableSheetOption } from './creature.js';
import { CharacterUtils } from './character-utils.js';

export class GameplayUtils {
	public static async fetchGameplayTargets(
		intr?: ChatInputCommandInteraction,
		compositeId?: string
	): Promise<ModelWithSheet[]> {
		let targetCharacters: ModelWithSheet[] = [];
		if (!compositeId) {
			if (intr) {
				const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
				if (activeCharacter) targetCharacters = [activeCharacter];
			}
		} else {
			const [type, id] = compositeId.split('-');
			if (type === 'init') {
				const initResult = await InitiativeActor.query()
					.withGraphFetched('character')
					.findOne({ id });
				if (initResult) {
					targetCharacters.push(initResult);
					if (initResult.character) {
						targetCharacters.push(initResult.character);
					}
				}
			} else if (type === 'char') {
				const charResult = await Character.query().findOne({ id });
				if (charResult) targetCharacters.push(charResult);
			}
		}
		return targetCharacters;
	}
	public static async recoverGameplayStats(
		intr: ChatInputCommandInteraction,
		targets: ModelWithSheet[]
	) {
		const promises = [];
		const creature = targets[0]?.sheet ? new Creature(targets[0]?.sheet) : undefined;
		let recoverValues: ReturnType<Creature['recover']>;
		if (creature) {
			recoverValues = creature.recover();
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		await targets[0].saveSheet(intr, creature.sheet);
		return recoverValues;
	}
	public static async setGameplayStats(
		intr: ChatInputCommandInteraction,
		targets: ModelWithSheet[],
		option: SettableSheetOption,
		value: string
	) {
		const promises = [];
		// sheets should be exact duplicates, so we only do our updates on one sheet, but write it onto both locations
		const creature = targets[0]?.sheet ? new Creature(targets[0]?.sheet) : undefined;
		let updateValues: ReturnType<Creature['updateValue']>;
		if (creature) {
			updateValues = creature.updateValue(option, value);
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		await targets[0].saveSheet(intr, creature.sheet);
		return updateValues;
	}
}
