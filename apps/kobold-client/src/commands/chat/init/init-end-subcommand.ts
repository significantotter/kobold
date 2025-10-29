import { ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitEndSubCommand extends BaseCommandClass(
	InitCommand,
	InitCommand.subCommandEnum.end
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

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
				await kobold.initiative.delete({ id: currentInitiative.id });
				await InteractionUtils.send(intr, L.en.commands.init.end.interactions.success());
				await kobold.sheetRecord.deleteOrphaned();
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
