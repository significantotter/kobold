import { EmbedBuilder } from 'discord.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Language } from '../models/enum-helpers/index.js';
import { Character } from '../services/kobold/models/index.js';
import { InitiativeBuilder } from './initiative-utils.js';

export class KoboldEmbed extends EmbedBuilder {
	public constructor() {
		super();
		this.setColor('Green');
	}
	/**
	 * Sets character specific attributes for the embed: currently just the thumbnail
	 * @param character The character to set the attributes for
	 */
	public setCharacter(character: Character) {
		if (character?.characterData?.infoJSON?.imageURL) {
			this.setThumbnail(character.characterData.infoJSON.imageURL);
		}
		return this;
	}

	public static turnFromInitiativeBuilder(
		initiativeBuilder: InitiativeBuilder,
		LL?: TranslationFunctions
	) {
		LL = LL || Language.LL;
		const result = new KoboldEmbed();
		const groupTurn = initiativeBuilder.activeGroup;
		if (!groupTurn) {
			result.setTitle(LL.utils.koboldEmbed.cantDetermineTurnError());
			return result;
		}
		result.setTitle(
			LL.utils.koboldEmbed.turnTitle({
				groupName: groupTurn.name,
			})
		);
		result.addFields([
			{
				name: LL.utils.koboldEmbed.roundTitle({
					currentRound: initiativeBuilder.init?.currentRound || 0,
				}),
				value: initiativeBuilder.getAllGroupsTurnText(),
			},
		]);

		if (initiativeBuilder.actorsByGroup[groupTurn.id].length === 1) {
			const actor = initiativeBuilder.actorsByGroup[groupTurn.id][0];
			if (actor?.character) {
				result.setCharacter(actor.character);
			}
		}
		return result;
	}
	public static roundFromInitiativeBuilder(
		initiativeBuilder: InitiativeBuilder,
		LL?: TranslationFunctions
	) {
		LL = LL || Language.LL;
		const result = new KoboldEmbed().setTitle(
			LL.utils.koboldEmbed.roundTitle({
				currentRound: initiativeBuilder.init?.currentRound || 0,
			})
		);
		result.setDescription(initiativeBuilder.getAllGroupsTurnText());
		return result;
	}
}
