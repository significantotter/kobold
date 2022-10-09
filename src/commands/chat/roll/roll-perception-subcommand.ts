import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils.getActiveCharacter } from '../../../utils/character-utils.js';
import { DiceUtils.buildDiceExpression, RollBuilder } from '../../../utils/dice-utils.js';

export class RollPerceptionSubCommand implements Command {
	public names = ['perception'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'perception',
		description: `rolls perception for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		const rollBuilder = new RollBuilder({
			character: activeCharacter,
			rollNote,
			rollDescription: `rolled Perception`,
		});
		rollBuilder.addRoll(
			DiceUtils.buildDiceExpression(
				'd20',
				String(activeCharacter.calculatedStats.totalPerception),
				modifierExpression
			)
		);
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}
