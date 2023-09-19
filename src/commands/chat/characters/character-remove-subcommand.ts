import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ButtonStyle,
	ComponentType,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { CollectorUtils } from './../../../utils/collector-utils.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { refs } from '../../../constants/common-text.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class CharacterRemoveSubCommand implements Command {
	public names = [L.en.commands.character.remove.name()];
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
		LL: TranslationFunctions
	): Promise<void> {
		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

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
			await Character.query().deleteById(activeCharacter.id);

			//set another character as active
			const newActive = await Character.query().first().where({ userId: intr.user.id });
			if (newActive) {
				await Character.query().patchAndFetchById(newActive.id, {
					isActiveCharacter: true,
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
