import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	ChannelType,
	Message,
} from 'discord.js';

import { GameplayOptions } from './gameplay-command-options.js';

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import _ from 'lodash';
import { Creature } from '../../../utils/creature.js';
import { Character, CharacterModel } from '../../../services/kobold/index.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { CharacterUtils } from '../../../utils/kobold-service-utils/character-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class GameplayTrackerSubCommand implements Command {
	public names = [L.en.commands.gameplay.tracker.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.tracker.name(),
		description: L.en.commands.gameplay.tracker.description(),
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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);
		const trackerMode =
			intr.options.getString(GameplayOptions.GAMEPLAY_TRACKER_MODE.name) ?? 'basic_stats';
		const gameplayTargetChannel = intr.options.getChannel(
			GameplayOptions.GAMEPLAY_TARGET_CHANNEL.name,
			false,
			[ChannelType.GuildText]
		);

		// try and find that charcter
		let targetCharacter: CharacterModel | null;
		if (targetCharacterName) {
			targetCharacter = (
				await CharacterUtils.findCharacterByName(targetCharacterName, intr.user.id)
			)[0];
			if (!targetCharacter) {
				throw new KoboldError(
					`Yip! I could not find your character ${targetCharacterName}.`
				);
			}
		} else {
			targetCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!targetCharacter) {
				throw new KoboldError(LL.commands.character.interactions.noActiveCharacter());
			}
		}
		const chosenCharacter = targetCharacter;

		if (chosenCharacter.trackerMessageId) {
			// if we already have a tracker, confirm that we want to make a new one
			// then edit the old one to mark it as outdated
			if (
				chosenCharacter.trackerMessageId &&
				chosenCharacter.trackerChannelId &&
				chosenCharacter.trackerGuildId
			) {
				// allow this to be async. We don't need to rush
				intr.client.guilds.fetch(chosenCharacter.trackerGuildId).then(guild => {
					return guild.channels
						.fetch(chosenCharacter.trackerChannelId ?? '')
						.then(channel => {
							if (channel?.isTextBased()) {
								return channel.messages
									.fetch(chosenCharacter.trackerMessageId ?? '')
									.then(message => {
										return message.edit({
											content:
												`\`\`\`ansi
\u001b[0;33mYip! This tracker is outdated and will no longer update.\u001b[0;0m
\`\`\`\n` + message.content,
										});
									});
							}
						});
				});
			}
		}

		const sheet = chosenCharacter.sheet;
		const creature = new Creature(sheet);

		const trackerDisplay = creature.compileTracker(trackerMode);

		let trackerResponse: Message<boolean> | undefined;
		if (!gameplayTargetChannel) {
			trackerResponse = await InteractionUtils.send(intr, trackerDisplay);
		} else {
			trackerResponse = await gameplayTargetChannel.send(trackerDisplay);
			await InteractionUtils.send(intr, `Yip! I created the tracker for ${creature.name}.`);
		}
		if (!trackerResponse) {
			throw new KoboldError(
				`Yip! If I created a tracker, I can't see it anymore! Check my permissions to make sure I can access this channel.`
			);
		}

		await chosenCharacter.$query().patch({
			trackerMessageId: trackerResponse.id,
			trackerGuildId: trackerResponse.guildId,
			trackerChannelId: trackerResponse.channelId,
			trackerMode: trackerMode,
		});
	}
}
