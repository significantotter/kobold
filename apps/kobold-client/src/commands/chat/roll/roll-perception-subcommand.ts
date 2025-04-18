import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import { RollOptions } from './roll-command-options.js';

export class RollPerceptionSubCommand implements Command {
	public name = L.en.commands.roll.perception.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.perception.name(),
		description: L.en.commands.roll.perception.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const modifierExpression =
			intr.options.getString(RollOptions.ROLL_MODIFIER_OPTION.name) ?? '';
		const rollNote = intr.options.getString(RollOptions.ROLL_NOTE_OPTION.name) ?? '';

		const secretRoll =
			intr.options.getString(RollOptions.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);

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
				String(creature.statBonuses.perception),
				modifierExpression
			),
			rollTitle: '',
			tags: ['skill', 'perception'],
		});
		const response = rollBuilder.compileEmbed();

		await EmbedUtils.dispatchEmbeds(
			intr,
			[response],
			secretRoll,
			activeCharacter?.game?.gmUserId
		);
	}
}
