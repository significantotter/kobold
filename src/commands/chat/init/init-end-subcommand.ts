import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils } from '../../../utils/initiative-utils.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { refs } from '../../../constants/common-text.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class InitEndSubCommand implements Command {
	public names = [L.en.commands.init.end.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.end.name(),
		description: L.en.commands.init.end.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const currentInit = await InitiativeUtils.getInitiativeForChannel(intr.channel);

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
		if (result && result.value === 'cancel') {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			await InteractionUtils.send(intr, L.en.commands.init.end.interactions.cancel());
			return;
		} else if (result && result.value === 'end') {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: 'End',
				}),
				components: [],
			});
			try {
				await Initiative.query().deleteById(currentInit.id);
				await InteractionUtils.send(intr, L.en.commands.init.end.interactions.success());
				return;
			} catch (err) {
				await InteractionUtils.send(intr, L.en.commands.init.end.interactions.error());
				console.error(err);
			}
		} else {
			return;
		}
	}
}
