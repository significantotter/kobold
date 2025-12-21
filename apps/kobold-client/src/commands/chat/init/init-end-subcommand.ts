import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { Kobold } from '@kobold/db';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class InitEndSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.end
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const prompt = await intr.reply({
			content: InitDefinition.strings.end.confirmation.text,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: InitDefinition.strings.end.confirmation.confirmButton,
							customId: 'end',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: InitDefinition.strings.end.confirmation.cancelButton,
							customId: 'cancel',
							style: ButtonStyle.Primary,
						},
					],
				},
			],
			flags: [MessageFlags.Ephemeral],
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
						content: InitDefinition.strings.end.confirmation.expired,
						components: [],
					});
				},
			}
		);
		if (result && result.value === 'cancel') {
			await InteractionUtils.editReply(intr, {
				content: InitDefinition.strings.shared.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			await InteractionUtils.send(intr, InitDefinition.strings.end.cancel);
			return;
		} else if (result && result.value === 'end') {
			await InteractionUtils.editReply(intr, {
				content: InitDefinition.strings.shared.choiceRegistered({
					choice: 'End',
				}),
				components: [],
			});
			try {
				await kobold.initiative.delete({ id: currentInitiative.id });
				await InteractionUtils.send(intr, InitDefinition.strings.end.success);
				await kobold.sheetRecord.deleteOrphaned();
				return;
			} catch (err) {
				await InteractionUtils.send(intr, InitDefinition.strings.end.error);
				console.error(err);
			}
		} else {
			return;
		}
	}
}
