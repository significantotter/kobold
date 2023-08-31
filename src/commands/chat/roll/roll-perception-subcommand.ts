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
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { Creature } from '../../../utils/creature.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';

export class RollPerceptionSubCommand implements Command {
	public names = [Language.LL.commands.roll.perception.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.perception.name(),
		description: Language.LL.commands.roll.perception.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);

		const [activeCharacter, userSettings, activeGame] = await Promise.all([
			CharacterUtils.getActiveCharacter(intr),
			SettingsUtils.getSettingsForUser(intr),
			GameUtils.getActiveGame(intr.user.id, intr.guildId),
		]);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, LL.commands.roll.interactions.noActiveCharacter());
			return;
		}

		const creature = Creature.fromCharacter(activeCharacter);

		const rollBuilder = new RollBuilder({
			character: activeCharacter,
			rollNote,
			rollDescription: LL.commands.roll.interactions.rolledDice({
				diceType: 'Perception',
			}),
			userSettings,
			LL,
		});
		rollBuilder.addRoll({
			rollExpression: DiceUtils.buildDiceExpression(
				'd20',
				String(creature.sheet.general.perception),
				modifierExpression
			),
			tags: ['skill', 'perception'],
		});
		const response = rollBuilder.compileEmbed();

		await EmbedUtils.dispatchEmbeds(intr, [response], secretRoll, activeGame.gmUserId);
	}
}
