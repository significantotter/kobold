import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { RollBuilder } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';

export class RollDiceSubCommand implements Command {
	public names = [Language.LL.commands.roll.dice.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.dice.name(),
		description: Language.LL.commands.roll.dice.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const isSecretRoll = intr.options.getBoolean(ChatArgs.ROLL_SECRET_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		let activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);

		//only use the active character if the roll uses character attributes
		if (!/(\[[\w \-_\.]{2,}\])/g.test(diceExpression)) {
			activeCharacter = null;
		}

		const rollBuilder = new RollBuilder({
			character: activeCharacter || null,
			actorName: intr.user.username,
			rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
			rollNote,
			LL,
		});
		rollBuilder.addRoll({ rollExpression: diceExpression });
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response, isSecretRoll);
	}
}
