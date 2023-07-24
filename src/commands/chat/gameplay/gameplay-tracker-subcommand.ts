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
import { EventData } from '../../../models/internal-models.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import _ from 'lodash';
import { Creature } from '../../../utils/creature.js';
import { Character } from '../../../services/kobold/models/index.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

export class GameplayTrackerSubCommand implements Command {
	public names = [Language.LL.commands.gameplay.tracker.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.gameplay.tracker.name(),
		description: Language.LL.commands.gameplay.tracker.description(),
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
			const match = intr.options.getString(ChatArgs.SET_ACTIVE_NAME_OPTION.name);

			//get the character matches
			const options = await Character.queryControlledCharacterByName(match, intr.user.id);

			//return the matched characters
			return options.map(character => ({
				name: character.name,
				value: character.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
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
		let targetCharacter: Character;
		if (targetCharacterName) {
			targetCharacter = (
				await Character.queryControlledCharacterByName(targetCharacterName, intr.user.id)
			)[0];
		} else {
			targetCharacter = await CharacterUtils.getActiveCharacter(intr);
		}

		if (targetCharacter.trackerMessageId) {
			// if we already have a tracker, confirm that we want to make a new one
			// then edit the old one to mark it as outdated
			if (
				targetCharacter.trackerMessageId &&
				targetCharacter.trackerChannelId &&
				targetCharacter.trackerGuildId
			) {
				// allow this to be async. We don't need to rush
				intr.client.guilds.fetch(targetCharacter.trackerGuildId).then(guild => {
					return guild.channels.fetch(targetCharacter.trackerChannelId).then(channel => {
						if (channel.isTextBased()) {
							return channel.messages
								.fetch(targetCharacter.trackerMessageId)
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
				targetCharacter.trackerMessageId,
					targetCharacter.trackerChannelId,
					targetCharacter.trackerGuildId,
					'Yip! This tracker is outdated. Please ignore it.';
			}
		}

		const sheet = targetCharacter.sheet;
		const creature = new Creature(sheet);

		const trackerDisplay = creature.compileTracker(trackerMode);

		let trackerResponse: Message<boolean>;
		if (!gameplayTargetChannel) {
			trackerResponse = await InteractionUtils.send(intr, trackerDisplay);
		} else {
			trackerResponse = await gameplayTargetChannel.send(trackerDisplay);
			await InteractionUtils.send(intr, `Yip! I created the tracker for ${creature.name}.`);
		}

		await targetCharacter.$query().patch({
			trackerMessageId: trackerResponse.id,
			trackerGuildId: trackerResponse.guildId,
			trackerChannelId: trackerResponse.channelId,
			trackerMode: trackerMode,
		});
	}
}
