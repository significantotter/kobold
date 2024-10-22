import {
	ApplicationCommandType,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class CharacterRemoveSubCommand implements Command {
	public name = L.en.commands.character.remove.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.remove.name(),
		description: L.en.commands.character.remove.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const prompt = await intr.reply({
			content: LL.commands.character.remove.interactions.removeConfirmation.text({
				characterName: activeCharacter.name,
			}),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: LL.commands.character.remove.interactions.removeConfirmation.removeButton(),
							customId: 'remove',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: LL.commands.character.remove.interactions.removeConfirmation.cancelButton(),
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
						content:
							LL.commands.character.remove.interactions.removeConfirmation.expired(),
						components: [],
					});
				},
			}
		);
		if (result && result.value === 'remove') {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
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
				content: LL.commands.character.remove.interactions.success({
					characterName: activeCharacter.name,
				}),
				components: [],
			});
		} else if (timedOut) {
			return;
		} else {
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			// cancel
			await InteractionUtils.send(intr, {
				content: LL.commands.character.remove.interactions.cancelled({
					characterName: activeCharacter.name,
				}),
				components: [],
			});
		}
	}
}
