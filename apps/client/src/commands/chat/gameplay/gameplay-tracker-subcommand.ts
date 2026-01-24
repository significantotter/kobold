import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChannelType,
	ChatInputCommandInteraction,
	Message,
} from 'discord.js';

import { CharacterWithRelations, Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameplayDefinition, sharedStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { ValueOf } from 'type-fest';
const commandOptions = GameplayDefinition.options;
const commandOptionsEnum = GameplayDefinition.commandOptionsEnum;

export class GameplayTrackerSubCommand extends BaseCommandClass(
	GameplayDefinition,
	GameplayDefinition.subCommandEnum.tracker
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';

			//get the character matches
			const { characterUtils } = new KoboldUtils(kobold);
			const options = await characterUtils.findOwnedCharacterByName(match, intr.user.id);

			//return the matched characters
			return options.map(character => ({
				name: character.name,
				value: character.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name
		);
		const trackerMode = (intr.options.getString(
			commandOptions[commandOptionsEnum.trackerMode].name
		) ?? sharedStrings.options.sheetStyles.basicStats) as ValueOf<
			typeof sharedStrings.options.sheetStyles
		>;
		const gameplayTargetChannel = intr.options.getChannel(
			commandOptions[commandOptionsEnum.targetChannel].name,
			false,
			[ChannelType.GuildText]
		);
		const koboldUtils = new KoboldUtils(kobold);
		const { characterUtils } = koboldUtils;

		if (!Object.values(sharedStrings.options.sheetStyles).includes(trackerMode)) {
			throw new KoboldError(
				`Yip! Please use one of the suggested options ` +
					`for trackerMode! I didn't understand "${trackerMode}".`
			);
		}

		// try and find that character
		let targetCharacter: CharacterWithRelations | null;
		if (targetCharacterName) {
			targetCharacter = (
				await characterUtils.findOwnedCharacterByName(targetCharacterName, intr.user.id)
			)[0];
			if (!targetCharacter) {
				throw new KoboldError(
					`Yip! I could not find your character ${targetCharacterName}.`
				);
			}
		} else {
			targetCharacter = await characterUtils.getActiveCharacter(intr);
			if (!targetCharacter) {
				throw new KoboldError(GameplayDefinition.strings.shared.errors.noActiveCharacter);
			}
		}
		const targetSheetRecord = targetCharacter.sheetRecord;

		if (targetSheetRecord.trackerMessageId) {
			// if we already have a tracker, confirm that we want to make a new one
			// then edit the old one to mark it as outdated
			if (
				targetSheetRecord.trackerMessageId &&
				targetSheetRecord.trackerChannelId &&
				targetSheetRecord.trackerGuildId
			) {
				// allow this to be async. We don't need to rush
				intr.client.guilds.fetch(targetSheetRecord.trackerGuildId).then(guild => {
					return guild.channels
						.fetch(targetSheetRecord.trackerChannelId ?? '')
						.then(channel => {
							if (channel?.isTextBased()) {
								return channel.messages
									.fetch(targetSheetRecord.trackerMessageId ?? '')
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

		const creature = new Creature(targetSheetRecord, undefined, intr);

		const trackerDisplay = creature.compileEmbed('Tracker', trackerMode);

		let trackerResponse: Message<boolean> | undefined;
		if (!gameplayTargetChannel) {
			trackerResponse = await InteractionUtils.send(intr, trackerDisplay);
		} else {
			trackerResponse = await gameplayTargetChannel.send({
				content: trackerDisplay.data.description,
				embeds: [],
			});
			await InteractionUtils.send(intr, `Yip! I created the tracker for ${creature.name}.`);
		}
		if (!trackerResponse) {
			throw new KoboldError(
				`Yip! If I created a tracker, I can't see it anymore! Check my permissions to make sure I can access this channel.`
			);
		}

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				trackerMessageId: trackerResponse.id,
				trackerGuildId: trackerResponse.guildId,
				trackerChannelId: trackerResponse.channelId,
				trackerMode: trackerMode,
			}
		);
	}
}
