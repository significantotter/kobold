import { ChatInputCommandInteraction } from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollOptions } from './roll-command-options.js';
import { RollCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class RollDiceSubCommand extends BaseCommandClass(
	RollCommand,
	RollCommand.subCommandEnum.dice
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const diceExpression = intr.options.getString(
			RollOptions.ROLL_EXPRESSION_OPTION.name,
			true
		);

		const secretRoll =
			intr.options.getString(RollOptions.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const rollNote = intr.options.getString(RollOptions.ROLL_NOTE_OPTION.name) ?? '';

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		let { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});

		// only use the active character in the roll if the roll uses character attributes
		// however, use a different variable so we don't break send-to-gm
		let characterForRoll = activeCharacter;
		if (!/(\[[\w \-_\.]{2,}\])/g.test(diceExpression)) {
			characterForRoll = null;
		}

		const rollBuilder = new RollBuilder({
			character: characterForRoll ?? null,
			actorName: intr.user.username,
			rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
			rollNote,
			userSettings,
			LL,
		});
		rollBuilder.addRoll({ rollExpression: diceExpression, rollTitle: '' });
		const response = rollBuilder.compileEmbed();

		await EmbedUtils.dispatchEmbeds(
			intr,
			[response],
			secretRoll,
			activeCharacter?.game?.gmUserId
		);
	}
}
