import { WanderersGuide } from '../../../services/wanderers-guide/index';
import { Character, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
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
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

export class CharacterSetServerDefaultSubCommand implements Command {
	public names = [Language.LL.commands.character.setServerDefault.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.setServerDefault.name(),
		description: Language.LL.commands.character.setServerDefault.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);

			const matchedCharacters = await Character.queryLooseCharacterName(match, intr.user.id);
			//get the character matches
			const options = matchedCharacters.map(character => ({
				name: character.characterData.name,
				value: character.characterData.name,
			}));

			if (
				match == '' ||
				Language.LL.commands.character.setServerDefault.noneOption().includes(match)
			) {
				options.push({
					name: Language.LL.commands.character.setServerDefault.noneOption().toString(),
					value: '__NONE__',
				});
			}

			//return the matched characters
			return options;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const charName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);
		const currentGuildId = intr.guildId;

		// try and find that charcter
		const targetCharacter = (
			await Character.queryLooseCharacterName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			//set all other characters as not the default for this user in this guild
			await GuildDefaultCharacter.query()
				.delete()
				.where({ userId: intr.user.id, guildId: currentGuildId });

			//set the character as the default for this guild
			await GuildDefaultCharacter.query().insert({
				userId: intr.user.id,
				guildId: currentGuildId,
				characterId: targetCharacter.id,
			});

			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.setServerDefault.interactions.success({
					characterName: targetCharacter.characterData.name,
				})
			);
		} else {
			if ('__NONE__'.includes(charName)) {
				//unset the server default character.
				await GuildDefaultCharacter.query()
					.delete()
					.where({ userId: intr.user.id, guildId: currentGuildId });
				await InteractionUtils.send(
					intr,
					LL.commands.character.setServerDefault.interactions.removed()
				);
			} else {
				await InteractionUtils.send(
					intr,
					LL.commands.character.setServerDefault.interactions.notFound()
				);
			}
		}
	}
}
