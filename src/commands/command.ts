import { TranslationFunctions } from './../i18n/i18n-types.js';
import {
	RESTPostAPIApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { Kobold } from '../services/kobold/models/koboldORM.js';
import { Character } from '../services/kobold/models/index.js';
import { ConditionalPick } from 'type-fest';
import { CharacterUtils } from '../utils/character-utils.js';
import _ from 'lodash';
import { ZCharacter } from '../services/kobold/models/character/character.model.js';

export interface InjectedCommandData {
	kobold: Kobold;
}

export interface Command {
	names: String[];
	metadata: RESTPostAPIApplicationCommandsJSONBody;
	cooldown?: RateLimiter;
	deferType: CommandDeferType;
	requireClientPerms: PermissionsString[];
	restrictedGuilds?: string[];
	commands?: Command[];
	usesData?: object;
	fetchInjectedDataForCommand?(intr: CommandInteraction): any;
	autocomplete?(
		intr: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined>;
	execute(
		intr: CommandInteraction,
		LL: TranslationFunctions,
		data?: Partial<InjectData>,
		services?: Partial<InjectedServices>
	): Promise<void>;
}

export interface InjectedServices {}

export interface InjectData {
	activeCharacter: ZCharacter | null;
	ownedCharacters: ZCharacter[];
}

export interface InjectableCommandData {
	activeCharacter?: boolean;
	ownedCharacters?: boolean;
}

export function UsingData<T extends InjectableCommandData>(usesData: T) {
	type targetData = ConditionalPick<InjectData, keyof T>;
	return class {
		public usesData: T = usesData;

		public async fetchInjectedDataForCommand(intr: CommandInteraction): Promise<targetData> {
			let activeCharacterPromise: Promise<Character | null> | undefined = undefined;
			if (this.usesData.activeCharacter) {
				activeCharacterPromise = CharacterUtils.getActiveCharacter(intr);
			}
			let ownedCharactersPromise: Promise<Character[]> | undefined = undefined;
			if (this.usesData.ownedCharacters) {
				ownedCharactersPromise = Character.query().where({
					userId: intr.user.id,
				}) as any as Promise<Character[]>;
			}
			let [activeCharacter, ownedCharacters] = await Promise.all([
				activeCharacterPromise,
				ownedCharactersPromise,
			]);
			const parsedOwnedCharacters = ownedCharacters?.map?.(character => character.parse());
			const parsedActiveCharacter = activeCharacter?.parse?.() ?? null;

			return _.pickBy(
				{
					activeCharacter: parsedActiveCharacter,
					ownedCharacters: parsedOwnedCharacters,
				},
				_.identity
			) as targetData;
		}

		public async execute(
			intr: CommandInteraction,
			LL: TranslationFunctions,
			data?: targetData,
			services?: Partial<InjectedServices>
		): Promise<void> {
			return;
		}
	};
}

export enum CommandDeferType {
	PUBLIC = 'PUBLIC',
	HIDDEN = 'HIDDEN',
	NONE = 'NONE',
}
