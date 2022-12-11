import { TranslationFunctions } from './../i18n/i18n-types';
import {
	RESTPostAPIApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../models/internal-models.js';

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
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]>;
	execute(intr: CommandInteraction, data: EventData, LL: TranslationFunctions): Promise<void>;
}

export enum CommandDeferType {
	PUBLIC = 'PUBLIC',
	HIDDEN = 'HIDDEN',
	NONE = 'NONE',
}
