import { ChatInputCommandInteraction } from 'discord.js';
import {
	CharacterModel,
	InitiativeActorModel,
	ModelWithSheet,
} from '../../services/kobold/index.js';
import { Kobold } from '../../services/kobold/kobold.model.js';
import { KoboldUtils } from './kobold-utils.js';

export class GameplayUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async fetchGameplayTargets(
		intr?: ChatInputCommandInteraction,
		compositeId?: string
	): Promise<ModelWithSheet[]> {
		let targetCharacters: ModelWithSheet[] = [];
		if (!compositeId) {
			if (intr) {
				const activeCharacter =
					await this.koboldUtils.characterUtils.getActiveCharacter(intr);
				if (activeCharacter) targetCharacters = [activeCharacter];
			}
		} else {
			const [type, id] = compositeId.split('-');
			if (type === 'init') {
				const initResult = await this.kobold.initiativeActor.read({ id: Number(id) });
				if (initResult) {
					targetCharacters.push(initResult);
					if (initResult.character) {
						targetCharacters.push(initResult.character);
					}
				}
			} else if (type === 'char') {
				const charResult = await this.kobold.character.read({ id: Number(id) });
				if (charResult) targetCharacters.push(charResult);
			}
		}
		return targetCharacters;
	}
}
