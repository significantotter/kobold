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
import { Language } from '../../../models/enum-helpers/index.js';
import { Lang } from '../../../services/index.js';

export class CharacterSetActiveSubCommand implements Command {
	public names = [Language.LL.commands.character.setActive.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.setActive.name(),
		description: Language.LL.commands.character.setActive.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
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
			await Character.query()
				.update({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

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
