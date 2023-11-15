import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import { ChatArgs } from '../../../constants/index.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';

export class CharacterSetDefaultSubCommand implements Command {
	public names = [L.en.commands.character.setDefault.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.setDefault.name(),
		description: L.en.commands.character.setDefault.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name) ?? '';

			const { characterUtils } = new KoboldUtils(kobold);
			const matchedCharacters = await characterUtils.findOwnedCharacterByName(
				match,
				intr.user.id
			);
			//get the character matches
			const options = matchedCharacters.map(character => ({
				name: character.name,
				value: character.name,
			}));

			if (match == '' || L.en.commands.character.setDefault.noneOption().includes(match)) {
				options.push({
					name: L.en.commands.character.setDefault.noneOption().toString(),
					value: '__NONE__',
				});
			}

			//return the matched characters
			return options;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const defaultScope = intr.options.getString(
			CharacterOptions.CHARACTER_SET_DEFAULT_SCOPE.name,
			true
		);
		const charName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name, true);
		const currentGuildId = intr.guildId;
		const currentChannelId = intr.channelId;

		const { characterUtils } = new KoboldUtils(kobold);

		// try and find that character
		const targetCharacter = (
			await characterUtils.findOwnedCharacterByName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			if (defaultScope === L.en.commandOptions.setDefaultScope.choices.channel.value()) {
				if (!currentChannelId)
					throw new KoboldError(
						'Yip! You must be in a server to set a channel default character.'
					);

				//set all other characters as not the default for this user in this channel
				await kobold.channelDefaultCharacter.delete({
					userId: intr.user.id,
					channelId: currentChannelId,
				});

				//set the character as the default for this channel
				await kobold.channelDefaultCharacter.create({
					userId: intr.user.id,
					channelId: currentChannelId,
					characterId: targetCharacter.id,
				});
			} else if (
				defaultScope === L.en.commandOptions.setDefaultScope.choices.server.value()
			) {
				if (!currentGuildId)
					throw new KoboldError(
						'Yip! You must be in a server to set a server default character.'
					);

				//set all other characters as not the default for this user in this guild
				await kobold.guildDefaultCharacter.delete({
					userId: intr.user.id,
					guildId: currentGuildId,
				});
				//set the character as the default for this guild
				await kobold.guildDefaultCharacter.create({
					userId: intr.user.id,
					guildId: currentGuildId,
					characterId: targetCharacter.id,
				});
			}
			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.setDefault.interactions.success({
					characterName: targetCharacter.name,
					scope: defaultScope,
				})
			);
		} else {
			if ('__NONE__'.includes(charName)) {
				//unset the server default character.
				if (defaultScope === L.en.commandOptions.setDefaultScope.choices.channel.value()) {
					if (!currentChannelId)
						throw new KoboldError(
							'Yip! You must be in a server to set a channel default character.'
						);
					await kobold.channelDefaultCharacter.delete({
						userId: intr.user.id,
						channelId: currentChannelId,
					});
				} else if (
					defaultScope === L.en.commandOptions.setDefaultScope.choices.server.value()
				) {
					if (!currentGuildId)
						throw new KoboldError(
							'Yip! You must be in a server to set a server default character.'
						);

					await await kobold.guildDefaultCharacter.delete({
						userId: intr.user.id,
						guildId: currentGuildId,
					});
				}
				await InteractionUtils.send(
					intr,
					LL.commands.character.setDefault.interactions.removed({
						scope: defaultScope,
					})
				);
			} else {
				await InteractionUtils.send(
					intr,
					LL.commands.character.setDefault.interactions.notFound()
				);
			}
		}
	}
}
