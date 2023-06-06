import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils } from '../../../utils/initiative-utils.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';

export class InitEndSubCommand implements Command {
	public names = [Language.LL.commands.init.end.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.end.name(),
		description: Language.LL.commands.init.end.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		const prompt = await intr.reply({
			content: LL.commands.init.end.interactions.confirmation.text(),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: LL.commands.init.end.interactions.confirmation.confirmButton(),
							customId: 'end',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: LL.commands.init.end.interactions.confirmation.cancelButton(),
							customId: 'cancel',
							style: ButtonStyle.Primary,
						},
					],
				},
			],
			ephemeral: true,
			fetchReply: true,
		});
		let timedOut = false;
		let result = await CollectorUtils.collectByButton(
			prompt,
			async buttonInteraction => {
				if (buttonInteraction.user.id !== intr.user.id) {
					return;
				}
				switch (buttonInteraction.customId) {
					case 'end':
						return { intr: buttonInteraction, value: 'end' };
					default:
						return { intr: buttonInteraction, value: 'cancel' };
				}
			},
			{
				time: 50000,
				reset: true,
				target: intr.user,
				stopFilter: message => message.content.toLowerCase() === 'stop',
				onExpire: async () => {
					timedOut = true;
					await InteractionUtils.editReply(intr, {
						content: LL.commands.init.end.interactions.confirmation.expired(),
						components: [],
					});
				},
			}
		);
		if (result.value === 'cancel') {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			await InteractionUtils.send(intr, Language.LL.commands.init.end.interactions.cancel());
			return;
		} else if (result.value === 'end') {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: 'End',
				}),
				components: [],
			});
			try {
				await Initiative.query().deleteById(currentInit.id);
				await InteractionUtils.send(
					intr,
					Language.LL.commands.init.end.interactions.success()
				);
				return;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					Language.LL.commands.init.end.interactions.error()
				);
				console.error(err);
			}
		} else {
			return;
		}
	}
}
