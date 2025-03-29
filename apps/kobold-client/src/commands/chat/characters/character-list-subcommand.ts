import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class CharacterListSubCommand implements Command {
	public name = L.en.commands.character.list.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.list.name(),
		description: L.en.commands.character.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		// try and find that character
		const { ownedCharacters } = await koboldUtils.fetchDataForCommand(intr, {
			ownedCharacters: true,
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
			await InteractionUtils.send(
				intr,
				LL.commands.character.list.interactions.noCharacters()
			);
		} else {
			const characterFields = [];

			for (const character of ownedCharacters) {
				const level = character.sheetRecord.sheet.staticInfo.level;
				const heritage = character.sheetRecord.sheet.info.heritage;
				const ancestry = character.sheetRecord.sheet.info.ancestry;
				const classes = character.sheetRecord.sheet.info.class;
				const isServerDefault = serverDefault?.id == character.id;
				characterFields.push({
					name: LL.commands.character.list.interactions.characterListEmbed.characterFieldName(
						{
							characterName: character.name,
							activeText: character.isActiveCharacter ? ' (active)' : '',
							serverDefaultText: isServerDefault ? ' (server default)' : '',
							channelDefaultText:
								channelDefault?.id == character.id ? ' (channel default)' : '',
						}
					),
					value: LL.commands.character.list.interactions.characterListEmbed.characterFieldValue(
						{
							level,
							heritage,
							ancestry,
							classes,
						}
					),
				});
			}

			const characterListEmbed = new KoboldEmbed()
				.setTitle(LL.commands.character.list.interactions.characterListEmbed.title())
				.addFields(characterFields);
			await characterListEmbed.sendBatches(intr);
		}
	}
}
