import { WG } from '../services/wanderers-guide/wanderers-guide.js';
import { Character } from './../services/kobold/models/character/character.model';

// determines the distance between two strings
// taken from stack overflow
function levenshteinDistance(str1: string, str2: string) {
	const track = Array(str2.length + 1)
		.fill(null)
		.map(() => Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1, // deletion
				track[j - 1][i] + 1, // insertion
				track[j - 1][i - 1] + indicator // substitution
			);
		}
	}
	return track[str2.length][str1.length];
}

interface NamedThing {
	Name: string;
}
const characterIdRegex = /characters\/([0-9]+)/;
const pastebinIdRegex = /pastebin\.com(?:\/raw)?\/([A-Za-z0-9]+)/;

export class CharacterUtils {
	/**
	 * Finds the array item whose Name property is closest to 'name'. Useful for loose string matching skills, etc.
	 * @param name the name to match
	 * @param matchTargets the targets of the match with property .Name
	 * @returns the closest matchTarget to name
	 */
	public static getBestNameMatch<T extends NamedThing>(name: string, matchTargets: T[]): T {
		if (matchTargets.length === 0) return null;

		let lowestMatchTarget = matchTargets[0];
		let lowestMatchTargetDistance = levenshteinDistance(
			(matchTargets[0].Name || '').toLowerCase(),
			name.toLowerCase()
		);
		for (let i = 1; i < matchTargets.length; i++) {
			const currentMatchTargetDistance = levenshteinDistance(
				(matchTargets[i].Name || '').toLowerCase(),
				name.toLowerCase()
			);
			if (currentMatchTargetDistance < lowestMatchTargetDistance) {
				lowestMatchTarget = matchTargets[i];
				lowestMatchTargetDistance = currentMatchTargetDistance;
			}
		}
		return lowestMatchTarget;
	}

	/**
	 * Given a string, finds all skills containing that string on a given character
	 * @param targetCharacter the character to check for matching skills
	 * @param skillText the text to match to skills
	 * @returns all skills that contain the given skillText
	 */
	public static findPossibleSkillFromString(
		targetCharacter: Character,
		skillText: string
	): WG.NamedBonus[] {
		const matchedSkills = [];
		for (const skill of targetCharacter.calculatedStats.totalSkills.concat({
			Name: 'Perception',
			Bonus: targetCharacter.calculatedStats.totalPerception,
		})) {
			if (skill.Name.toLowerCase().includes(skillText.toLowerCase())) {
				matchedSkills.push(skill);
			}
		}
		return matchedSkills;
	}

	/**
	 * Given a string, finds all saves containing that string on a given character
	 * @param targetCharacter the character to check for matching saves
	 * @param saveText the text to match to saves
	 * @returns all saves that contain the given saveText
	 */
	public static findPossibleSaveFromString(
		targetCharacter: Character,
		saveText: string
	): WG.NamedBonus[] {
		const matchedSaves = [];
		for (const save of targetCharacter.calculatedStats.totalSaves) {
			if (save.Name.toLowerCase().includes(saveText.toLowerCase())) {
				matchedSaves.push(save);
			}
		}
		return matchedSaves;
	}

	/**
	 * Given a string, finds all modifiers containing that string on a given character
	 * @param targetCharacter the character to check for matching modifiers
	 * @param modifierText the text to match to modifiers
	 * @returns all modifiers that contain the given modifierText
	 */
	public static findPossibleModifierFromString(
		targetCharacter: Character,
		modifierText: string
	): Character['modifiers'] {
		const matchedModifiers = [];
		for (const modifier of targetCharacter.modifiers || []) {
			if (modifier.name.toLowerCase().includes(modifierText.toLowerCase())) {
				matchedModifiers.push(modifier);
			}
		}
		return matchedModifiers;
	}

	/**
	 * Given a string, finds all ability scores containing that string on a given character
	 * @param targetCharacter the character to check for matching ability scores
	 * @param abilityText the text to match to ability scores
	 * @returns all ability scores that contain the given abilityText
	 */
	public static findPossibleAbilityFromString(
		targetCharacter: Character,
		abilityText: string
	): WG.NamedScore[] {
		const matchedAbility = [];
		for (const ability of targetCharacter.calculatedStats.totalAbilityScores) {
			if (ability.Name.toLowerCase().includes(abilityText.toLowerCase())) {
				matchedAbility.push(ability);
			}
		}
		return matchedAbility;
	}

	/**
	 * Given a string, finds all attacks containing that string on a given character
	 * @param targetCharacter the character to check for matching attacks
	 * @param attackText the text to match to attacks
	 * @returns all attacks that contain the given attackText
	 */
	public static findPossibleAttackFromString(
		targetCharacter: Character,
		attackText: string
	): WG.NamedBonus[] {
		const matchedAttacks = [];
		for (const attack of targetCharacter.calculatedStats.weapons) {
			if (attack.Name.toLowerCase().includes(attackText.toLowerCase())) {
				matchedAttacks.push(attack);
			}
		}
		return matchedAttacks;
	}

	/**
	 * Gets the active character for a user
	 * @param userId the discord use
	 * @returns the active character for the user, or null if one is not present
	 */
	public static async getActiveCharacter(
		userId: string,
		guildId?: string
	): Promise<Character | null> {
		const [activeCharacter, GuildDefaultCharacter] = await Promise.all([
			Character.query().where({
				userId: userId,
				isActiveCharacter: true,
			}),
			Character.query()
				.joinRelated('guildDefaultCharacter')
				.where({
					'guildDefaultCharacter.userId': userId,
					'guildDefaultCharacter.guildId': guildId ?? 0,
				}),
		]);
		return GuildDefaultCharacter[0] ?? activeCharacter[0] ?? null;
	}

	/**
	 * Parses the text to find a character id out of a url or parses full string as a number
	 * @param text either a wanderer's guide url, or simply a numeric character id
	 */
	public static parseCharacterIdFromText(text: string): number | null {
		const trimmedText = text.trim();
		let charId = null;
		if (!isNaN(Number(trimmedText.trim()))) {
			// we allow just a character id to be passed in as well
			charId = Number(trimmedText.trim());
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(characterIdRegex);
			if (!matches) {
				charId = null;
			} else charId = Number(matches[1]);
		}
		return charId;
	}

	/**
	 * Parses the text to find a pastebin id out of a url or parses full string as a number
	 * @param text either a pastebin url, or simply a pastebin post id
	 */
	public static parsePastebinIdFromText(text: string): string | null {
		const trimmedText = text.trim();
		let pastebinId: string | null = null;
		if (/^([A-Za-z0-9]+)$/.test(trimmedText)) {
			// we allow just a pastebin id to be passed in as well
			pastebinId = text;
		} else {
			// match the trimmedText to the regex
			const matches = trimmedText.match(pastebinIdRegex);
			if (!matches) {
				pastebinId = null;
			} else pastebinId = matches[1];
		}
		return pastebinId;
	}
}
