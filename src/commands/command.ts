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
import _ from 'lodash';
import { CompendiumModel } from '../services/pf2etools/compendium.model.js';
import { Kobold } from '../services/kobold/kobold.model.js';

export interface InjectedCommandData {}

export interface Command {
	names: String[];
	metadata: RESTPostAPIApplicationCommandsJSONBody;
	cooldown?: RateLimiter;
	deferType: CommandDeferType;
	requireClientPerms: PermissionsString[];
	restrictedGuilds?: string[];
	commands?: Command[];
	autocomplete?(
		intr: AutocompleteInteraction,
		option: AutocompleteFocusedOption,
		services?: Partial<InjectedServices>
	): Promise<ApplicationCommandOptionChoiceData[] | undefined>;
	execute(
		intr: CommandInteraction,
		LL: TranslationFunctions,
		services?: Partial<InjectedServices>
	): Promise<void>;
}

export interface InjectedServices {
	compendium: CompendiumModel;
	kobold: Kobold;
}

export enum CommandDeferType {
	PUBLIC = 'PUBLIC',
	HIDDEN = 'HIDDEN',
	NONE = 'NONE',
}
