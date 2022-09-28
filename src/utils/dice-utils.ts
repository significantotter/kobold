import { Character } from './../services/kobold/models/character/character.model';
import { CommandInteraction, EmbedFieldData, MessageEmbed, User } from 'discord.js';
import { Dice, DiceResult } from 'dice-typescript';
import type { WG } from './../services/wanderers-guide/wanderers-guide.js';
import _ from 'lodash';
import { getBestNameMatch } from './character-utils.js';

interface DiceRollResult extends EmbedFieldData {
	results: DiceResult | null;
}

export class RollBuilder {
	private character: Character | null;
	private rollDescription: string;
	private rollNote: string;
	public rollResults: DiceRollResult[];
	private title: string;

	constructor({
		actorName,
		character,
		rollDescription,
		rollNote,
		title,
	}: {
		actorName?: string;
		character?: Character | null;
		rollDescription?: string;
		rollNote?: string;
		title?: string;
	}) {
		this.rollResults = [];
		this.character = character || null;
		this.rollNote = rollNote;
		this.rollDescription = rollDescription || 'rolled some dice!';

		const actorText = character?.characterData?.name || actorName || '';
		this.title = title || _.capitalize(`${actorText} ${this.rollDescription}`.trim());
	}

	/**
	 * Rolls an expression for the embed
	 * @param rollExpression The roll expression to roll
	 * @param rollTitle The optional title of the roll. If the embed
	 *                  only has a single roll, this will be overwritten
	 */
	public addRoll(rollExpression: string, rollTitle?: string) {
		const rollField = {
			name: rollTitle || '\u200B',
			value: '',
			results: null,
		};
		try {
			const roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(rollExpression);
			if (roll.errors?.length) {
				rollField.value =
					`Yip! We didn't understand the dice roll.\n` + roll.errors.join('\n');
			} else {
				rollField.value = `${rollExpression}\n${roll.renderedExpression.toString()}\n total = \`${
					roll.total
				}\``;
				rollField.results = roll;
			}
		} catch (err) {
			console.warn(err);
			rollField.value = `Yip! We didn't understand the dice roll "${rollExpression}".`;
		}
		this.rollResults.push(rollField);
	}
	/**
	 * Compiles all of the roll results and fields into a message embed
	 * @returns A message embed containing the full roll results
	 */
	public compileEmbed() {
		const response = new MessageEmbed().setTitle(this.title).setColor('GREEN');

		let characterData = this.character?.characterData as WG.CharacterApiResponse;
		if (characterData?.infoJSON?.imageURL) {
			response.setThumbnail(characterData.infoJSON.imageURL);
		}

		if (this.rollResults.length > 1) {
			response.addFields(
				//strip extra properties from the roll results
				this.rollResults.map(result => ({ name: result.name, value: result.value }))
			);
		} else if (this.rollResults.length === 1) {
			response.setDescription(this.rollResults[0].value);
		}
		if (this.rollNote) {
			response.setFooter({ text: this.rollNote });
		}
		return response;
	}
}

const damageTypeMatch = / [A-Za-z \-_,\/]+$/;
export function parseDiceFromWgDamageField(wgDamageField: string): string {
	return wgDamageField.replace(damageTypeMatch, '');
}

export function buildDiceExpression(
	baseDice?: string,
	bonus?: string,
	modifierExpression?: string
) {
	let builtDice = '';
	//if we have a bonus, and the bonus does not start with + or -
	if (bonus?.length && !['-', '+'].includes(bonus.charAt(0))) {
		//add a sign to the bonus
		bonus = '+' + bonus;
	}

	//if we have a bonus, but no base dice, base the dice on a d20
	if (bonus && !baseDice) {
		baseDice = 'd20';
	}

	let wrappedModifierExpression = '';
	if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;

	return `${baseDice}${bonus || ''}${wrappedModifierExpression}`;
}

export function rollSkill(
	intr: CommandInteraction,
	activeCharacter: Character,
	skillChoice: string,
	rollNote?: string,
	modifierExpression?: string,
	description?: string
) {
	const skillsPlusPerception = [
		...activeCharacter.calculatedStats.totalSkills,
		{
			Name: 'Perception',
			Bonus: activeCharacter.calculatedStats.totalPerception,
		},
	] as WG.NamedBonus[];

	//use the first skill that matches the text of what we were sent, or preferably a perfect match
	let targetSkill = getBestNameMatch(skillChoice, skillsPlusPerception);

	const rollBuilder = new RollBuilder({
		actorName: intr.user.username,
		character: activeCharacter,
		rollNote,
		rollDescription: `rolled ${targetSkill.Name}`,
	});
	rollBuilder.addRoll(buildDiceExpression('d20', String(targetSkill.Bonus), modifierExpression));
	return rollBuilder;
}
