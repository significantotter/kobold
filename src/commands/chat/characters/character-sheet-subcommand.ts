import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	EmbedBuilder,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import type { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { Lang } from '../../../services/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

export class CharacterSheetSubCommand implements Command {
	public names = [Language.LL.commands.character.sheet.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.sheet.name(),
		description: Language.LL.commands.character.sheet.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		const characterData = activeCharacter.characterData as WG.CharacterApiResponse;
		const calculatedStats =
			activeCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;

		const imageUrl = characterData.infoJSON?.imageURL || '';
		const characterUrl = `https://wanderersguide.app/profile/characters/${characterData.id}`;
		const level = characterData.level;
		const heritage = [characterData.vHeritageName, characterData.heritageName].join(' ').trim();
		const ancestry = characterData.ancestryName;
		const classes = [characterData.className, characterData.className2].join(' ').trim();

		let EmbedBuilder = new KoboldEmbed().setTitle(characterData.name).setURL(characterUrl);

		if (imageUrl) {
			EmbedBuilder = EmbedBuilder.setThumbnail(imageUrl);
		}

		let maxHpText = String(calculatedStats.maxHP);
		if (maxHpText === 'null') maxHpText = 'none';
		let totalACText = String(calculatedStats.totalAC);
		if (totalACText === 'null') totalACText = 'none';
		let totalPerceptionText = String(calculatedStats.totalPerception);
		if (totalPerceptionText === 'null') totalPerceptionText = 'none';
		else if (calculatedStats.totalPerception >= 0)
			totalPerceptionText = `+${totalPerceptionText}`;
		else totalPerceptionText = `${totalPerceptionText}`;
		let totalClassDCText = String(calculatedStats.totalClassDC);
		if (totalClassDCText === 'null') totalClassDCText = 'none';
		let totalSpeedText = String(calculatedStats.totalSpeed);
		if (totalSpeedText === 'null') totalSpeedText = 'none';

		EmbedBuilder.addFields([
			{
				name: LL.commands.character.sheet.interactions.sheet.coreDataField.name({
					level,
					heritage,
					ancestry,
					classes,
				}),
				value: LL.commands.character.sheet.interactions.sheet.coreDataField.value({
					health: maxHpText,
					armorClass: totalACText,
					perceptionModifier: totalPerceptionText,
					perceptionDC: 10 + (Number(totalPerceptionText) || 0),
					classes,
					classDC: totalClassDCText,
					speed: totalSpeedText,
					background: characterData.backgroundName || 'none',
				}),
			},
		]);
		const abilitiesText = calculatedStats.totalAbilityScores
			.map(ability => {
				const symbol = ability.Score >= 0 ? '+' : '';
				return `${ability.Name.substring(0, 3)} \`${symbol}${ability.Score}\``;
			})
			.join(', ');
		const abilitiesEmbed = {
			name: LL.commands.character.sheet.interactions.sheet.abilitiesField.name(),
			value: abilitiesText,
			inline: false,
		};
		const savesText = calculatedStats.totalSaves
			.map(save => {
				const symbol = save.Bonus >= 0 ? '+' : '';
				return `${save.Name} \`${symbol}${save.Bonus}\` (DC ${10 + Number(save.Bonus)})`;
			})
			.join(', ');
		const savesEmbed = {
			name: LL.commands.character.sheet.interactions.sheet.savesField.name(),
			value: savesText,
			inline: false,
		};
		const skillAndSaveEmbeds = [];
		if (abilitiesText) skillAndSaveEmbeds.push(abilitiesEmbed);
		if (savesText) skillAndSaveEmbeds.push(savesEmbed);

		EmbedBuilder.addFields(skillAndSaveEmbeds);

		const thirdSkillsArr = calculatedStats.totalSkills.map(skill => {
			const symbol = skill.Bonus >= 0 ? '+' : '';
			return `${skill.Name} \`${symbol}${skill.Bonus}\``;
		});
		const skillsPerField = Math.ceil(thirdSkillsArr.length / 3);
		const firstSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
		const secondSkillsArr = thirdSkillsArr.splice(0, skillsPerField);
		const skillFields = [];
		if (firstSkillsArr.length)
			skillFields.push({
				name: LL.commands.character.sheet.interactions.sheet.skillsField.name(),
				value: firstSkillsArr.join('\n'),
				inline: true,
			});
		if (secondSkillsArr.length)
			skillFields.push({
				name: LL.commands.character.sheet.interactions.sheet.skillsField.name(),
				value: secondSkillsArr.join('\n'),
				inline: true,
			});
		if (thirdSkillsArr.length)
			skillFields.push({
				name: LL.commands.character.sheet.interactions.sheet.skillsField.name(),
				value: thirdSkillsArr.join('\n'),
				inline: true,
			});
		if (skillFields.length) EmbedBuilder.addFields(skillFields);

		await InteractionUtils.send(intr, EmbedBuilder);
	}
}
