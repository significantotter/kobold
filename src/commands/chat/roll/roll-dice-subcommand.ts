import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';

export class RollDiceSubCommand implements Command {
	public names = [L.en.commands.roll.dice.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.dice.name(),
		description: L.en.commands.roll.dice.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name, true);

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';

		let [activeCharacter, userSettings, activeGame] = await Promise.all([
			CharacterUtils.getActiveCharacter(intr),
			SettingsUtils.getSettingsForUser(intr),
			GameUtils.getActiveGame(intr.user.id, intr.guildId ?? ''),
		]);

		//only use the active character if the roll uses character attributes
		if (!/(\[[\w \-_\.]{2,}\])/g.test(diceExpression)) {
			activeCharacter = null;
		}

		const rollBuilder = new RollBuilder({
			character: activeCharacter || null,
			actorName: intr.user.username,
			rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
			rollNote,
			userSettings,
			LL,
		});
		rollBuilder.addRoll({ rollExpression: diceExpression, rollTitle: '' });
		const response = rollBuilder.compileEmbed();

		await EmbedUtils.dispatchEmbeds(intr, [response], secretRoll, activeGame?.gmUserId);
	}
}
