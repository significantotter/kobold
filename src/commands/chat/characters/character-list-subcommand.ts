import {
	Character,
	CharacterModel,
	GuildDefaultCharacter,
	GuildDefaultCharacterModel,
} from '../../../services/kobold/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

export class CharacterListSubCommand implements Command {
	public names = [L.en.commands.character.list.name()];
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
		LL: TranslationFunctions
	): Promise<void> {
		// try and find that character
		const targetCharacter = await CharacterModel.query().where({
			userId: intr.user.id,
		});
		const serverDefault = (
			await GuildDefaultCharacterModel.query().where({
				userId: intr.user.id,
				guildId: intr.guildId,
			})
		)[0];

		if (!targetCharacter.length) {
			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.list.interactions.noCharacters()
			);
		} else {
			const characterFields = [];

			for (const character of targetCharacter) {
				const level = character.sheet.staticInfo.level;
				const heritage = character.sheet.info.heritage;
				const ancestry = character.sheet.info.ancestry;
				const classes = character.sheet.info.class;
				const isServerDefault = serverDefault.characterId == character.id;
				characterFields.push({
					name: LL.commands.character.list.interactions.characterListEmbed.characterFieldName(
						{
							characterName: character.name,
							activeText: character.isActiveCharacter ? ' (active)' : '',
							serverDefaultText: isServerDefault ? ' (server default)' : '',
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
