import { AutocompleteInteraction, CacheType } from 'discord.js';
import _ from 'lodash';
import { Npc } from '../services/kobold/models/index.js';
import { CharacterUtils } from './character-utils.js';
import { InitiativeUtils } from './initiative-utils.js';
import { Creature } from './creature.js';
import { Language } from '../models/enum-helpers/language.js';

export class AutocompleteUtils {
	public static async getBestiaryNpcs(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const targetNpcs = await Npc.query()
			.whereRaw('name ilike ?', [`%${matchText ?? ''}%`])
			.orderByRaw('random()')
			.limit(49);
		return targetNpcs.map(npc => {
			let name = npc.name;
			const duplicates = targetNpcs.filter(c => c.name === npc.name);
			if (duplicates.length > 1) {
				name = `${npc.name} (${npc.data?.source})`;
			}

			return { name: name, value: npc.id.toString() };
		});
	}

	public static async getTargetActionForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			//no choices if we don't have a character to match against
			return [];
		}
		//find a save on the character matching the autocomplete string
		const matchedActions = CharacterUtils.findPossibleActionFromString(
			activeCharacter,
			matchText
		).map(action => ({
			name: action.name,
			value: action.name,
		}));
		//return the matched saves
		return matchedActions;
	}

	public static async getAllMatchingRollsForActiveCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		extraChoices: string[] = []
	) {
		const choices: Set<string> = new Set(extraChoices);

		//get the active character
		const character = await CharacterUtils.getActiveCharacter(intr);
		if (!character) {
			return [];
		}

		// add skills
		const matchedSkills = CharacterUtils.findPossibleSkillFromString(character, matchText).map(
			skill => skill.name
		);
		for (const skill of matchedSkills) {
			choices.add(_.capitalize(skill));
		}

		// add saves
		const matchedSaves = CharacterUtils.findPossibleSaveFromString(character, matchText).map(
			save => save.name
		);
		for (const save of matchedSaves) {
			choices.add(_.capitalize(save));
		}
		// add abilities
		const matchedAbilities = CharacterUtils.findPossibleAbilityFromString(
			character,
			matchText
		).map(ability => ability.name);
		for (const ability of matchedAbilities) {
			choices.add(_.capitalize(ability));
		}

		choices.delete('');

		const results = [];
		let counter = 0;
		for (const value of choices.values()) {
			if (counter > 90) continue;
			results.push({ name: value, value: value });
			counter++;
		}
		return results;
	}

	public static async getAllMatchingRollsMacrosForCharacter(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			//no choices if we don't have a character to match against
			return [];
		}
		//find a save on the character matching the autocomplete string
		const matchedRollMacros = CharacterUtils.findPossibleRollMacroFromString(
			activeCharacter,
			matchText
		).map(modifier => ({
			name: modifier.name,
			value: modifier.name,
		}));
		//return the matched saves
		return matchedRollMacros;
	}

	public static async getAllControllableInitiativeActors(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (!currentInitResponse) {
			return [];
		}
		//get the character matches
		let actorOptions = InitiativeUtils.getControllableInitiativeActors(
			currentInitResponse.init,
			intr.user.id
		);
		actorOptions = actorOptions.filter(actor =>
			actor.name.toLowerCase().includes(matchText.toLowerCase())
		);

		//return the matched skills
		return actorOptions.map(actor => ({
			name: actor.name,
			value: actor.name,
		}));
	}

	public static async getInitTargetOptions(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (currentInitResponse.errorMessage) {
			return [];
		}

		const actorOptions = currentInitResponse.init.actors.filter(actor =>
			actor.name.toLocaleLowerCase().includes(matchText.toLocaleLowerCase())
		);

		//return the matched actors
		return [
			{ name: '(None)', value: '__NONE__' },
			...actorOptions.map(actor => ({
				name: actor.name,
				value: actor.name,
			})),
		];
	}

	public static async getMatchingRollsForInitiativeSheet(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string,
		targetCharacterName: string
	) {
		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL: Language.LL,
		});
		if (initResult.errorMessage) {
			return [];
		}

		const actorResponse = InitiativeUtils.getNameMatchActorFromInitiative(
			initResult.init.gmUserId,
			initResult.init,
			targetCharacterName,
			Language.LL
		);
		if (actorResponse.errorMessage) {
			return [];
		}

		const actor = actorResponse.actor;

		if (!actor?.sheet) {
			return [];
		}
		const creature = new Creature(actor.sheet);

		const allRolls = _.uniq([
			..._.keys(creature.attackRolls),
			...creature.actions.map(action => action.name),
			...(actor.character?.actions ?? []).map(action => action.name),
			..._.keys(creature.rolls),
		]);

		const matchedRolls = allRolls.filter(roll =>
			roll.toLowerCase().includes(matchText.toLowerCase())
		);
		return matchedRolls.map(roll => ({
			name: roll,
			value: roll,
		}));
	}

	public static async getAllUsersInInitiative(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (!currentInitResponse) {
			return [];
		}
		//get the character matches
		let actorOptions = InitiativeUtils.getControllableInitiativeActors(
			currentInitResponse.init,
			intr.user.id
		);

		const guildMemberOptions = actorOptions.map(actor => {
			return intr.guild.members.cache.find(guildMember => guildMember.id === actor.userId);
		});

		return guildMemberOptions.map(guildMember => ({
			name: guildMember.displayName,
			value: guildMember.id.toString(),
		}));
	}

	public static async getGameplayTargetCharacters(
		intr: AutocompleteInteraction<CacheType>,
		matchText: string
	) {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);

		let results = [];

		//get the character matches
		let actorOptions = currentInitResponse.init.actors;

		//return the matched skills
		results.push(
			...actorOptions.map(actor => ({
				name: actor.name,
				value: 'init-' + actor.id.toString(),
			}))
		);

		if (
			activeCharacter &&
			!actorOptions.find(actor => actor.characterId === activeCharacter.id)
		) {
			results.unshift({
				name: activeCharacter.name,
				value: 'char-' + activeCharacter.id.toString(),
			});
		}

		return results.filter(result =>
			result.name.toLowerCase().includes(matchText.toLowerCase())
		);
	}
}
