import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString, ButtonInteraction } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Lang } from '../../../services/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { CollectorUtils } from 'discord.js-collector-utils';
import { Language } from '../../../models/enum-helpers/index.js';

export class CharacterRemoveSubCommand implements Command {
	public names = [Language.LL.commands.character.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.remove.name(),
		description: Language.LL.commands.character.remove.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have an active character
		const LL = Language.localize(data.lang());
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		const prompt = await InteractionUtils.send(intr, {
			content: LL.commands.character.remove.interactions.removeConfirmation.text({
				characterName: activeCharacter.characterData.name,
			}),
			components: [
				{
					type: 'ACTION_ROW',
					components: [
						{
							type: 'BUTTON',
							label: LL.commands.character.remove.interactions.removeConfirmation.removeButton(),
							customId: 'remove',
							style: 'DANGER',
						},
						{
							type: 'BUTTON',
							label: LL.commands.character.remove.interactions.removeConfirmation.cancelButton(),
							customId: 'cancel',
							style: 'PRIMARY',
						},
					],
				},
			],
		});

		let result = await CollectorUtils.collectByButton(
			prompt,
			async buttonInteraction => {
				switch (buttonInteraction.customId) {
					case 'remove':
						return { intr: buttonInteraction, value: 'remove' };
					default:
						return { intr: buttonInteraction, value: 'cancel' };
				}
			},
			{
				time: 10000,
				reset: true,
				target: intr.user,
				stopFilter: message => message.content.toLowerCase() === 'stop',
				onExpire: async () => {
					await InteractionUtils.send(
						intr,
						LL.commands.character.remove.interactions.removeConfirmation.expired()
					);
				},
			}
		);
		if (result.value === 'remove') {
			//delete the character
			await Character.query().deleteById(activeCharacter.id);

			//set another character as active
			const newActive = await Character.query().first().where({ userId: intr.user.id });
			if (newActive) {
				await Character.query().updateAndFetchById(newActive.id, {
					isActiveCharacter: true,
				});
			}

			//send success message

			await InteractionUtils.editReply(intr, {
				content: LL.commands.character.remove.interactions.success({
					characterName: activeCharacter.characterData.name,
				}),
				components: [],
			});
		} else {
			// cancel
			await InteractionUtils.editReply(intr, {
				content: LL.commands.character.remove.interactions.cancelled({
					characterName: activeCharacter.characterData.name,
				}),
				components: [],
			});
		}
	}
}
