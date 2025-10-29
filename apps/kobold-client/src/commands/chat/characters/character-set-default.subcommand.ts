import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { CharacterCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterSetDefaultSubCommand extends BaseCommandClass(
	CharacterCommand,
	CharacterCommand.subCommandEnum.setDefault
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CharacterOptions.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(CharacterOptions.SET_ACTIVE_NAME_OPTION.name) ?? '';

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
		const charName = intr.options.getString(CharacterOptions.SET_ACTIVE_NAME_OPTION.name, true);
		const currentGuildId = intr.guildId;
		const currentChannelId = intr.channelId;

		const { characterUtils } = new KoboldUtils(kobold);

		// try and find that character
		const targetCharacter = (
			await characterUtils.findOwnedCharacterByName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			if (defaultScope === L.en.commandOptions.setDefaultScope.choices.channel.value()) {
				if (!currentChannelId) {
					throw new KoboldError(
						'Yip! You must be in a server to set a channel default character.'
					);
				}

				//set all other characters as not the default for this user in this channel
				await kobold.channelDefaultCharacter.deleteIfExists({
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
				if (!currentGuildId) {
					throw new KoboldError(
						'Yip! You must be in a server to set a server default character.'
					);
				}

				//set all other characters as not the default for this user in this guild
				await kobold.guildDefaultCharacter.deleteIfExists({
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
					if (!currentChannelId) {
						throw new KoboldError(
							'Yip! You must be in a server to set a channel default character.'
						);
					}
					try {
						await kobold.channelDefaultCharacter.delete({
							userId: intr.user.id,
							channelId: currentChannelId,
						});
					} catch (err) {
						if (
							err instanceof Error &&
							err.message.toLowerCase() === 'no rows deleted'
						) {
							InteractionUtils.send(
								intr,
								"Yip! You already didn't have a default character in this channel."
							);
							return;
						} else throw err;
					}
				} else if (
					defaultScope === L.en.commandOptions.setDefaultScope.choices.server.value()
				) {
					if (!currentGuildId) {
						throw new KoboldError(
							'Yip! You must be in a server to set a server default character.'
						);
					}

					try {
						await await kobold.guildDefaultCharacter.delete({
							userId: intr.user.id,
							guildId: currentGuildId,
						});
					} catch (err) {
						if (
							err instanceof Error &&
							err.message.toLowerCase() === 'no rows deleted'
						) {
							InteractionUtils.send(
								intr,
								"Yip! You already didn't have a default character in this channel."
							);
							return;
						} else throw err;
					}
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
