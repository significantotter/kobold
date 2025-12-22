import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;

export class RollDiceSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.dice
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const diceExpression = intr.options.getString(
			commandOptions[commandOptionsEnum.rollExpression].name,
			true
		);

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name) ?? '';

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
			rollDescription: RollDefinition.strings.dice.rolledDice,
			rollNote,
			userSettings,
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
