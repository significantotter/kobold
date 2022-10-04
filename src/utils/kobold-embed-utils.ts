import { MessageEmbed } from 'discord.js';
import { Character } from '../services/kobold/models/index.js';
import { InitiativeBuilder } from './initiative-utils.js';

export class KoboldEmbed extends MessageEmbed {
	public constructor() {
		super();
		this.setColor('GREEN');
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
		} else {
			result.setTitle(`It's ${groupTurn.name}'s turn!`);

			result.setDescription(
				'```md\n' + initiativeBuilder.getActorGroupTurnText(groupTurn) + '```'
			);
		}
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
			result.description +
				`\n[Initiative Round ${initiativeBuilder.init.currentRound}](${targetMessageUrl})`
		);
		return result;
	}
	public static roundFromInitiativeBuilder(initiativeBuilder: InitiativeBuilder) {
		const result = new KoboldEmbed().setTitle(
			`Initiative Round ${initiativeBuilder.init?.currentRound || 0}`
		);
		let builtTurnText = '```md\n';
		for (const group of initiativeBuilder.groups) {
			builtTurnText += initiativeBuilder.getActorGroupTurnText(group);
		}
		builtTurnText += '```';
		if (initiativeBuilder.groups.length === 0) {
			builtTurnText = '';
		}
		result.setDescription(builtTurnText);
		return result;
	}
}
