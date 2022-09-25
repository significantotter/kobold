import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { Dice } from 'dice-typescript';

export class RollCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'roll',
		description: `rolls some dice`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				...ChatArgs.ROLL_EXPRESSION_OPTION,
				required: true,
			},
			{
				...ChatArgs.ROLL_NOTE_OPTION,
				required: false,
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);
		let roll;
		try {
			roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(diceExpression);
			if (roll.errors?.length) {
				await InteractionUtils.send(
					intr,
					`Yip! We didn't understand the dice roll.\n` + roll.errors.join('\n')
				);
			} else {
				let response = `Rolled ${diceExpression}\n${roll.renderedExpression.toString()} = ${
					roll.total
				}`;
				if (rollNote) response += `\n${rollNote}`;

				//send a message about the total
				await InteractionUtils.send(intr, response);
			}
		} catch (err) {
			await InteractionUtils.send(
				intr,
				`Yip! We didn't understand the dice roll "${diceExpression}".`
			);
		}
	}
}
