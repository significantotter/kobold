import { Character, CharacterModel } from '../../../services/kobold/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';

import { ChatArgs } from '../../../constants/index.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

export class CharacterSetActiveSubCommand implements Command {
	public names = [L.en.commands.character.setActive.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.setActive.name(),
		description: L.en.commands.character.setActive.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name) ?? '';

			//get the character matches
			const options = await CharacterUtils.findCharacterByName(match, intr.user.id);

			//return the matched characters
			return options.map(character => ({
				name: character.name,
				value: character.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const charName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name, true);

		// try and find that charcter
		const targetCharacter = (
			await CharacterUtils.findCharacterByName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			//set all other characters as not active
			await CharacterModel.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			//set the character as active
			await CharacterModel.query().patchAndFetchById(targetCharacter.id, {
				isActiveCharacter: true,
			});

			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.setActive.interactions.success({
					characterName: targetCharacter.name,
				})
			);
		} else {
			await InteractionUtils.send(
				intr,
				LL.commands.character.setActive.interactions.notFound()
			);
		}
	}
}
