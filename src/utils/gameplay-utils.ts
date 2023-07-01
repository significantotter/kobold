import { ChatInputCommandInteraction } from 'discord.js';
import { Character, InitiativeActor } from '../services/kobold/models/index.js';
import { KoboldError } from './KoboldError.js';
import { Creature, SettableSheetOption } from './creature.js';
import { CharacterUtils } from './character-utils.js';

export class GameplayUtils {
	public static async fetchGameplayTargets(
		intr?: ChatInputCommandInteraction,
		compositeId?: string
	): Promise<(Character | InitiativeActor)[]> {
		let targetCharacters: (Character | InitiativeActor)[] = [];
		if (!compositeId) {
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			targetCharacters = [activeCharacter];
		} else {
			const [type, id] = compositeId.split('-');
			if (type === 'init') {
				const initResult = await InitiativeActor.query()
					.withGraphFetched('character')
					.findOne({ id });
				targetCharacters.push(initResult);
				if (initResult.character) {
					targetCharacters.push(initResult.character);
				}
			} else if (type === 'char') {
				const charResult = await Character.query().findOne({ id });
				targetCharacters.push(charResult);
			}
		}
		return targetCharacters;
	}
	public static async recoverGameplayStats(targets: (Character | InitiativeActor)[]) {
		const promises = [];
		const creature = new Creature(targets[0]?.sheet);
		let recoverValues: ReturnType<Creature['recover']>;
		if (creature) {
			recoverValues = creature.recover();
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		for (const target of targets) {
			promises.push(target.$query().update({ sheet: creature.sheet }));
		}
		await Promise.all(promises);
		return recoverValues;
	}
	public static async setGameplayStats(
		targets: (Character | InitiativeActor)[],
		option: SettableSheetOption,
		value: string
	) {
		const promises = [];
		// sheets should be exact duplicates, so we only do our updates on one sheet, but write it onto both locations
		const creature = new Creature(targets[0]?.sheet);
		let updateValues: ReturnType<Creature['updateValue']>;
		if (creature) {
			updateValues = creature.updateValue(option, value);
		} else throw new KoboldError("Yip! I couldn't find a sheet to target.");
		for (const target of targets) {
			promises.push(target.$query().update({ sheet: creature.sheet }));
		}
		await Promise.all(promises);
		return updateValues;
	}
}
