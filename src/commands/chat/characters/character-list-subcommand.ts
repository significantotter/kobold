import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { MessageEmbed } from 'discord.js';

export class CharacterListSubCommand implements Command {
	public names = ['list'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'list',
		description: `lists all active characters`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		// try and find that charcter
		const targetCharacter = await Character.query().where({
			userId: intr.user.id,
		});

		if (!targetCharacter.length) {
			//send success message
			await InteractionUtils.send(
				intr,
				`Yip! You have no characters yet! Use /import to import some!`
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
					name:
						character.characterData.name +
						(character.isActiveCharacter ? ' (active)' : ''),
					value: `Level ${level} ${heritage} ${ancestry} ${classes}`,
				});
			}

			const characterListEmbed = new MessageEmbed()
				.setColor('GREEN')
				.setTitle('Characters')
				.addFields(characterFields);
			await InteractionUtils.send(intr, characterListEmbed);
		}
	}
}
