import { APIEmbed, EmbedBuilder, EmbedData } from 'discord.js';
import _ from 'lodash';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import { Language } from '../models/enum-helpers/index.js';
import { Character, Sheet } from '../services/kobold/models/index.js';
import { InitiativeBuilder } from './initiative-utils.js';
import { InteractionUtils } from './interaction-utils.js';

export class KoboldEmbed extends EmbedBuilder {
	public constructor(data?: APIEmbed | EmbedData) {
		super(data);
		this.setColor('Green');
	}
	/**
	 * Sets character specific attributes for the embed: currently just the thumbnail
	 * @param character The character to set the attributes for
	 */
	public setCharacter(character: Character) {
		if (character?.sheet?.info?.imageURL) {
			this.setThumbnail(character.sheet.info.imageURL);
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
	public determineEmbedMetaTextLength(): number {
		let length = 0;
		length += this.data?.title?.length || 0;
		length += this.data?.description?.length || 0;
		length += this.data?.footer?.text?.length || 0;
		length += this.data?.author?.name?.length || 0;
		return length;
	}

	public isOverSized() {
		return (
			this.determineEmbedFieldTextLength() + this.determineEmbedMetaTextLength() > 6000 ||
			this.data?.fields?.length > 25
		);
	}
	public determineEmbedFieldTextLength(): number {
		return (
			this.data?.fields?.reduce((acc, field) => {
				return acc + field.name.length + field.value.length;
			}, 0) || 0
		);
	}

	public splitEmbedIfTooLong(): KoboldEmbed[] {
		const cloneOfThis = new KoboldEmbed(this.toJSON());

		let length = cloneOfThis.determineEmbedMetaTextLength();
		let fieldLength = cloneOfThis.determineEmbedFieldTextLength();

		if (length + fieldLength < 6000) {
			//we're within normal embed size, so we can just return ourselves.
			return [cloneOfThis];
		}

		// if the embed isn't oversized, we can fit at least 1 embed with the static text
		// so we can split this into many embeds if over the text limit
		let extraEmbeds: KoboldEmbed[] = [];
		while (cloneOfThis.isOverSized()) {
			// splice the field to move off of the end of this embed
			const splicedField = cloneOfThis.data.fields.splice(
				cloneOfThis.data.fields.length - 1,
				1
			)[0];
			// check the most recent extra embed to see if the field can be added to it
			let canAddFieldToEmbed = false;
			if (extraEmbeds.length > 0) {
				const mostRecentExtraEmbed = extraEmbeds[0];
				canAddFieldToEmbed =
					mostRecentExtraEmbed.data.fields.length < 25 &&
					mostRecentExtraEmbed.determineEmbedFieldTextLength() +
						splicedField.name.length +
						splicedField.value.length <
						6000;
			}
			if (canAddFieldToEmbed) {
				// if it can, then add it to the most recent extra embed
				extraEmbeds[0].spliceFields(0, 0, splicedField);
			}
			// if it can't, then we need to create a new extra embed
			else {
				let newEmbed = new KoboldEmbed();
				newEmbed.addFields(splicedField);
				extraEmbeds.unshift(newEmbed);
			}
			length = cloneOfThis.determineEmbedMetaTextLength();
			fieldLength = cloneOfThis.determineEmbedFieldTextLength();
		}

		if (extraEmbeds.length >= 9) {
			// What the heck are they doing asking for 30,000 characters of embed text?
			let errorEmbed = new KoboldEmbed();
			errorEmbed.setTitle("Error! Holy heck that's a lot of stuff!");
			errorEmbed.setDescription(
				"Yip! That command would have returned 10 whole heckin' messages at their limit of 6000 characters or 25 fields each! You need to" +
					" learn some moderation there, buddy! Or contact my author for help if you think this is a legit use of me! I'm just " +
					"a little kobold! I can't handle all that!"
			);
			return [errorEmbed];
		}
		return [cloneOfThis, ...extraEmbeds];
	}

	public batchEmbeds() {
		const splitEmbeds = this.splitEmbedIfTooLong();
		const embedBatches: KoboldEmbed[][] = [];
		return _.chunk(splitEmbeds, 1);
	}
	public async sendBatches(intr, isSecretRoll = false) {
		const splitEmbeds = this.splitEmbedIfTooLong();
		for (const embed of splitEmbeds) {
			await InteractionUtils.send(intr, embed, isSecretRoll);
		}
	}
}

export class EmbedUtils {
	public static describeActionResult({
		embed,
		action,
		heightenLevel,
		saveRollType,
		targetDC,
	}: {
		embed: KoboldEmbed;
		action: Sheet['actions'][0];
		heightenLevel?: number;
		saveRollType?: string;
		targetDC?: number;
	}): KoboldEmbed {
		const descriptionArr = [];
		if (heightenLevel) {
			descriptionArr.push(`Heightened to level ${heightenLevel}`);
		}
		if (saveRollType) {
			let rollType = '';
			for (const roll of action.rolls) {
				if (roll.type === 'save') {
					rollType = ` ${roll.saveRollType}`;
					break;
				}
			}
			descriptionArr.push(`The target rolls${rollType} ${saveRollType}`);
		}
		if (targetDC) {
			let saveType = ' DC';
			for (const roll of action.rolls) {
				if (roll.type === 'save' || roll.type === 'attack') {
					saveType = ` ${roll.saveTargetDC ?? roll.targetDC ?? 'ac'}`;
					// add the word DC if we aren't checking vs the AC
					if (
						saveType.toLocaleLowerCase() !== ' ac' &&
						!_.endsWith(saveType.toLocaleLowerCase(), ' dc')
					)
						saveType += ' DC';
					// change a to an if the next letter is a vowel
					if (['a', 'e', 'i', 'o', 'u'].includes(saveType[1].toLocaleLowerCase()))
						saveType = `n${saveType}`;
					break;
				}
			}
			descriptionArr.push(`VS a${saveType} of ${targetDC}`);
		}
		if (descriptionArr.length) embed.setDescription(descriptionArr.join('\n'));
		return embed;
	}
}
