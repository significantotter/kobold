import { Character } from '../../../services/kobold/models/index.js';
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
import { getActiveCharacter } from '../../../utils/character-utils.js';
import { CollectorUtils } from 'discord.js-collector-utils';

export class CharacterRemoveSubCommand implements Command {
	public names = ['remove'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'remove',
		description: `removes an already imported character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have an active character
		const activeCharacter = await getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		const prompt = await InteractionUtils.send(intr, {
			content: `Are you sure you want to remove ${activeCharacter.characterData.name}?`,
			components: [
				{
					type: 'ACTION_ROW',
					components: [
						{
							type: 'BUTTON',
							label: 'REMOVE',
							customId: 'remove',
							style: 'DANGER',
						},
						{
							type: 'BUTTON',
							label: 'CANCEL',
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
					await InteractionUtils.send(intr, 'Yip! Character removal request expired.');
				},
			}
		);
		if (result.value === 'remove') {
			//delete the character
			await Character.query().deleteById(activeCharacter.id);

			//set another character as active
			const newActive = await Character.query().first().where({ userId: intr.user.id });
			await Character.query().updateAndFetchById(newActive.id, { isActiveCharacter: true });

			//send success message

			await InteractionUtils.editReply(intr, {
				content: `Yip! I've successfully removed ${activeCharacter.characterData.name}! You can import them again at any time.`,
				components: [],
			});
		} else {
			// cancel
			await InteractionUtils.editReply(intr, {
				content: `Yip! Canceled the request to remove ${activeCharacter.characterData.name}!`,
				components: [],
			});
		}
	}
}
