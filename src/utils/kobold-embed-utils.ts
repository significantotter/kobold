import { EmbedBuilder } from 'discord.js';
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
		targetMessageUrl?: string
	) {
		const result = new KoboldEmbed();
		const groupTurn = initiativeBuilder.activeGroup;
		if (!groupTurn) {
			result.setTitle("Yip! Something went wrong! I can't figure out whose turn it is!");
			return result;
		}
		result.setTitle(`It's ${groupTurn.name}'s turn!`);

		result.setDescription(initiativeBuilder.getAllGroupsTurnText());

		let roundText = '';
		if (targetMessageUrl) {
			roundText = '';
		}
		if (initiativeBuilder.actorsByGroup[groupTurn.id].length === 1) {
			const actor = initiativeBuilder.actorsByGroup[groupTurn.id][0];
			if (actor?.character) {
				result.setCharacter(actor.character);
			}
		}
		result.setDescription(
			result.data.description +
				`\n[Initiative Round ${initiativeBuilder.init.currentRound}](${targetMessageUrl})`
		);
		return result;
	}
	public static roundFromInitiativeBuilder(initiativeBuilder: InitiativeBuilder) {
		const result = new KoboldEmbed().setTitle(
			`Initiative Round ${initiativeBuilder.init?.currentRound || 0}`
		);
		result.setDescription(initiativeBuilder.getAllGroupsTurnText());
		return result;
	}
}
