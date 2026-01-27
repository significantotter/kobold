import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;

export class RollPerceptionSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.perception
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const modifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.rollModifier].name) ?? '';
		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name) ?? '';

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

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
			rollDescription: RollDefinition.strings.perception.rolledPerception,
			userSettings,
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
