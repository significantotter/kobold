import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { Kobold } from '@kobold/db';

import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterRemoveSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.remove
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const response = await intr.reply({
			content: CharacterDefinition.strings.remove.confirmation.text({
				characterName: activeCharacter.name,
			}),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: CharacterDefinition.strings.remove.confirmation.removeButton,
							customId: 'remove',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: CharacterDefinition.strings.remove.confirmation.cancelButton,
							customId: 'cancel',
							style: ButtonStyle.Primary,
						},
					],
				},
			],
			flags: [MessageFlags.Ephemeral],
			withResponse: true,
		});
		const prompt = response.resource!.message!;
		let timedOut = false;
		let result = await CollectorUtils.collectByButton(
			prompt,
			async buttonInteraction => {
				if (buttonInteraction.user.id !== intr.user.id) {
					return;
				}
				switch (buttonInteraction.customId) {
					case 'remove':
						return { intr: buttonInteraction, value: 'remove' };
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
						content: CharacterDefinition.strings.remove.confirmation.expired,
						components: [],
					});
				},
			}
		);
		if (result && result.value === 'remove') {
			await InteractionUtils.editReply(intr, {
				content: CharacterDefinition.strings.shared.choiceRegistered({
					choice: 'Remove',
				}),
				components: [],
			});
			//delete the character

			await kobold.character.delete({ id: activeCharacter.id });
			const newActiveCharacter = await kobold.character.read({ userId: intr.user.id });
			if (newActiveCharacter) {
				await kobold.character.setIsActive({
					id: newActiveCharacter.id,
					userId: intr.user.id,
				});
			}

			//send success message

			await InteractionUtils.send(intr, {
				content: CharacterDefinition.strings.remove.success({
					characterName: activeCharacter.name,
				}),
				components: [],
			});
		} else if (timedOut) {
			return;
		} else {
			await InteractionUtils.editReply(intr, {
				content: CharacterDefinition.strings.shared.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			// cancel
			await InteractionUtils.send(intr, {
				content: CharacterDefinition.strings.remove.cancelled({
					characterName: activeCharacter.name,
				}),
				components: [],
			});
		}
	}
}
