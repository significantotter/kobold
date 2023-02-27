import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';

export class ActionBuilderSubCommand implements Command {
	public names = [Language.LL.commands.action.builder.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.builder.name(),
		description: Language.LL.commands.action.builder.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		let counter = 0;
		const prompt = await intr.reply({
			content: `click me! ${counter}`,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: 'add click',
							customId: 'add',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: 'remove click',
							customId: 'remove',
							style: ButtonStyle.Primary,
						},
					],
				},
			],
			ephemeral: true,
			fetchReply: true,
		});

		let result;

		const collector = prompt.createMessageComponentCollector({
			filter: message => {
				return true;
			},
			time: 15000,
		});
		collector.on('collect', async collected => {
			if (collected.customId === 'add') {
				await collected.update({
					content: `click me! ${++counter}`,
				});
			} else if (collected.customId === 'remove') {
				await collected.update({
					content: `click me! ${--counter}`,
				});
			}
		});
		collector.on('end', async collected => {
			console.log(prompt);
			await (
				await prompt.fetch()
			).edit({
				content: `Timed out!`,
			});
		});

		// for (let i = 0; i < 5; i++) {
		// 	result = await CollectorUtils.collectByButton(
		// 		prompt,
		// 		// Retrieve Result
		// 		async buttonInteraction => {
		// 			switch (buttonInteraction.customId) {
		// 				case 'add':
		// 					await InteractionUtils.editReply(intr, {
		// 						content: `click me! ${++counter}`,
		// 					});
		// 					return { intr: buttonInteraction, value: 'Added' };
		// 				case 'remove':
		// 					await InteractionUtils.editReply(intr, {
		// 						content: `click me! ${--counter}`,
		// 					});
		// 					return { intr: buttonInteraction, value: 'Removed' };
		// 				default:
		// 					return;
		// 			}
		// 		},
		// 		// Options
		// 		{
		// 			time: 10000,
		// 			reset: true,
		// 			stopFilter: message => message.content.toLowerCase() === 'stop',
		// 		}
		// 	);
		// }
		await InteractionUtils.send(intr, 'done!');
	}
}
