import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { CharacterDefinition } from '@kobold/documentation';

import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command } from '../../index.js';
import { BaseCommandClass } from '../../command.js';

export class CharacterListSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.list
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const ownedCharacters = await kobold.character.readManyForList({
			userId: intr.user.id,
		});

		const serverDefault = ownedCharacters.find(character =>
			character.guildDefaultCharacters.find(
				serverDefault => serverDefault.guildId == intr.guildId
			)
		);

		const channelDefault = ownedCharacters.find(character =>
			character.channelDefaultCharacters.find(
				channelDefault => channelDefault.channelId == intr.channelId
			)
		);

		if (!ownedCharacters.length) {
			//send success message
			await InteractionUtils.send(intr, CharacterDefinition.strings.list.noCharacters);
		} else {
			const characterFields = [];

			for (const character of ownedCharacters) {
				const level = character.sheetInfo.level;
				const heritage = character.sheetInfo.heritage;
				const ancestry = character.sheetInfo.ancestry;
				const classes = character.sheetInfo.class;
				const isServerDefault = serverDefault?.id == character.id;
				characterFields.push({
					name: CharacterDefinition.strings.list.characterListEmbed.characterFieldName({
						characterName: character.name,
						activeText: character.isActiveCharacter ? ' (active)' : '',
						serverDefaultText: isServerDefault ? ' (server default)' : '',
						channelDefaultText:
							channelDefault?.id == character.id ? ' (channel default)' : '',
					}),
					value: CharacterDefinition.strings.list.characterListEmbed.characterFieldValue({
						level,
						heritage,
						ancestry,
						classes,
					}),
				});
			}

			const characterListEmbed = new KoboldEmbed()
				.setTitle(CharacterDefinition.strings.list.characterListEmbed.title)
				.addFields(characterFields);
			await characterListEmbed.sendBatches(intr);
		}
	}
}
