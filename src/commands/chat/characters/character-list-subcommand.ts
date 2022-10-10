import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class CharacterListSubCommand implements Command {
	public names = [Language.LL.commands.character.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.list.name(),
		description: Language.LL.commands.character.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const LL = Language.localize(data.lang());
		// try and find that charcter
		const targetCharacter = await Character.query().where({
			userId: intr.user.id,
		});

		if (!targetCharacter.length) {
			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.list.interactions.noCharacters()
			);
		} else {
			const characterFields = [];

			for (const character of targetCharacter) {
				const level = character.characterData.level;
				const heritage = [
					character.characterData.vHeritageName,
					character.characterData.heritageName,
				]
					.join(' ')
					.trim();
				const ancestry = character.characterData.ancestryName;
				const classes = [
					character.characterData.className,
					character.characterData.className2,
				]
					.join(' ')
					.trim();
				characterFields.push({
					name: LL.commands.character.list.interactions.characterListEmbed.characterFieldName(
						{
							characterName: character.characterData.name,
							activeText: character.isActiveCharacter ? ' (active)' : '',
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
			await InteractionUtils.send(intr, characterListEmbed);
		}
	}
}
