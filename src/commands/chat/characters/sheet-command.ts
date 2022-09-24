import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString, MessageEmbed } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import type { WG } from '../../../services/wanderers-guide/wanderers-guide.js';

export class SheetCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'sheet',
		description: `displays the active character's sheet`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have a token
		const existingCharacter = await Character.query().where({
			isActiveCharacter: true,
			userId: intr.user.id,
		});

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			const characterData = character.characterData as WG.CharacterApiResponse;
			const calculatedStats =
				character.calculatedStats as WG.CharacterCalculatedStatsApiResponse;

			const imageUrl = characterData.infoJSON?.imageURL || '';
			const imageEmbed = imageUrl ? `![${characterData.name}](${imageUrl})` : '';
			const characterUrl = `https://wanderersguide.app/profile/characters/${characterData.id}`;
			const level = characterData.level;
			const heritage = [characterData.vHeritageName, characterData.heritageName]
				.join(' ')
				.trim();
			const ancestry = characterData.ancestryName;
			const classes = [characterData.className, characterData.className2].join(' ').trim();

			let messageEmbed = new MessageEmbed().setTitle(characterData.name).setURL(characterUrl);

			if (imageEmbed) {
				messageEmbed = messageEmbed.setThumbnail(imageEmbed);
			}
			messageEmbed.addFields([
				{
					name: `Level ${level} ${heritage} ${ancestry} ${classes}`,
					value: `
                    Max HP ${calculatedStats.maxHP}
                    AC ${calculatedStats.totalAC}
                    Perception +${calculatedStats.totalPerception}
                    ${classes} DC ${calculatedStats.totalClassDC}
                    Speed ${calculatedStats.totalSpeed}

                    Background: ${characterData.backgroundName || 'None'}`,
				},
			]);
			messageEmbed.addFields([
				{
					name: 'Abilities',
					value: calculatedStats.totalAbilityScores
						.map(ability => `${ability.Name}: ${ability.Score}`)
						.join('\n'),
					inline: true,
				},
				{
					name: 'Saves',
					value: calculatedStats.totalSaves
						.map(save => `${save.Name} +${save.Bonus}`)
						.join('\n'),
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },
			]);

			const thirdSkillsArr = calculatedStats.totalSkills.map(
				skill => `${skill.Name} +${skill.Bonus}`
			);
			const skillsPerField = Math.ceil(thirdSkillsArr.length / 3);
			const firstSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
			const secondSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
			const skillFields = [];
			if (firstSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: firstSkillsArr.join('\n'),
					inline: true,
				});
			if (secondSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: secondSkillsArr.join('\n'),
					inline: true,
				});
			if (thirdSkillsArr.length)
				skillFields.push({
					name: 'Skills',
					value: thirdSkillsArr.join('\n'),
					inline: true,
				});

			messageEmbed.addFields(skillFields);

			await InteractionUtils.send(intr, messageEmbed);
		} else {
			// the user needs to import a character!
			await InteractionUtils.send(
				intr,
				`Yip! I can't find an active character. /import a character before you can look at its sheet.`
			);
		}
	}
}
