import { WanderersGuide } from '../../../services/wanderers-guide/index';
import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class CharacterSetActiveSubCommand implements Command {
	public names = ['set-active'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'set-active',
		description: `sets a character as the active character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);

			//get the character matches
			const options = await Character.queryLooseCharacterName(match, intr.user.id);

			//return the matched characters
			await InteractionUtils.respond(
				intr,
				options.map(character => ({
					name: character.characterData.name,
					value: character.characterData.name,
				}))
			);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const charName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);

		// try and find that charcter
		const targetCharacter = (
			await Character.queryLooseCharacterName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			//set all other characters as not active
			await Character.query().update({ isActiveCharacter: false });

			//set the character as active
			await Character.query().updateAndFetchById(targetCharacter.id, {
				isActiveCharacter: true,
			});

			//send success message
			await InteractionUtils.send(
				intr,
				`Yip! ${targetCharacter.characterData.name} is now your active character!`
			);
		} else {
			await InteractionUtils.send(
				intr,
				`Yip! I couldn't find a character matching that name! ` +
					`Check what characters you've imported using /character list`
			);
		}
	}
}
