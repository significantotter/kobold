import { WG } from '../services/wanderers-guide/wanderers-guide.js';
import { Character } from './../services/kobold/models/character/character.model';

// determines the distance between two strings
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

/**
 * Finds the array item whose Name property is closest to 'name'. Useful for loose string matching skills, etc.
 * @param name the name to match
 * @param matchTargets the targets of the match with property .Name
 * @returns the closest matchTarget to name
 */
export function getBestNameMatch<T extends NamedThing>(name: string, matchTargets: T[]): T {
	if (matchTargets.length === 0) return null;

	let lowestMatchTarget = matchTargets[0];
	let lowestMatchTargetDistance = levenshteinDistance(
		matchTargets[0].Name.toLowerCase(),
		name.toLowerCase()
	);
	for (let i = 1; i < matchTargets.length; i++) {
		const currentMatchTargetDistance = levenshteinDistance(
			matchTargets[i].Name.toLowerCase(),
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
 * Given a string, finds all skills contining that string on a given character
 * @param targetCharacter the character to check for matching skills
 * @param skillText the text to match to skills
 * @returns all skills that contain the given skillText
 */
export function findPossibleSkillFromString(
	targetCharacter: Character,
	skillText: string
): WG.NamedBonus[] {
	const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
	const matchRegex = new RegExp(skillText, 'ig');
	const matchedSkills = [];
	for (const skill of stats.totalSkills.concat({
		Name: 'Perception',
		Bonus: targetCharacter.calculatedStats.totalPerception,
	})) {
		if (matchRegex.test(skill.Name)) {
			matchedSkills.push(skill);
		}
	}
	return matchedSkills;
}

/**
 * Given a string, finds all saves contining that string on a given character
 * @param targetCharacter the character to check for matching saves
 * @param saveText the text to match to saves
 * @returns all saves that contain the given saveText
 */
export function findPossibleSaveFromString(
	targetCharacter: Character,
	saveText: string
): WG.NamedBonus[] {
	const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
	const matchRegex = new RegExp(saveText, 'ig');
	const matchedSaves = [];
	for (const save of stats.totalSaves) {
		if (matchRegex.test(save.Name)) {
			matchedSaves.push(save);
		}
	}
	return matchedSaves;
}

/**
 * Given a string, finds all ability scores contining that string on a given character
 * @param targetCharacter the character to check for matching ability scores
 * @param abilityText the text to match to ability scores
 * @returns all ability scores that contain the given abilityText
 */
export function findPossibleAbilityFromString(
	targetCharacter: Character,
	abilityText: string
): WG.NamedScore[] {
	const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
	const matchRegex = new RegExp(abilityText, 'ig');
	const matchedAbility = [];
	for (const ability of stats.totalAbilityScores) {
		if (matchRegex.test(ability.Name)) {
			matchedAbility.push(ability);
		}
	}
	return matchedAbility;
}

/**
 * Given a string, finds all attacks contining that string on a given character
 * @param targetCharacter the character to check for matching attacks
 * @param attackText the text to match to attacks
 * @returns all attacks that contain the given attackText
 */
export function findPossibleAttackFromString(
	targetCharacter: Character,
	attackText: string
): WG.NamedBonus[] {
	const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
	const matchRegex = new RegExp(attackText, 'ig');
	const matchedAttacks = [];
	for (const attack of stats.weapons) {
		if (matchRegex.test(attack.Name)) {
			matchedAttacks.push(attack);
		}
	}
	return matchedAttacks;
}

/**
 * Gets the active character for a user
 * @param userId the discord use
 * @returns the active character for the user, or an empty array if one is not present
 */
export async function getActiveCharacter(userId: string): Promise<Character> {
	const existingCharacter = await Character.query().where({
		userId: userId,
		isActiveCharacter: true,
	});
	return existingCharacter[0];
}

const characterIdRegex = /characters\/([0-9]+)/;
/**
 * Parses the text to find a character id out of a url or parses full string as a number
 * @param text either a wanderer's guide url, or simply a numeric character id
 */
export function parseCharacterIdFromText(text: string): number | null {
	let charId = null;
	if (!isNaN(Number(text))) {
		// we allow just a character id to be passed in as well
		charId = Number(text);
	} else {
		// match the text to the regex
		const matches = text.match(characterIdRegex);
		if (!matches) {
			charId = null;
		} else charId = Number(matches[1]);
	}
	return charId;
}
