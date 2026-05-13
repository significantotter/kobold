import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { Command } from '../../index.js';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { RollContextService, RollEngine } from '../../../utils/roll-engine.js';
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

		const contextService = new RollContextService(kobold);
		if (
			RollEngine.isPureDiceExpression(diceExpression) &&
			!RollEngine.secretRequiresGm(secretRoll)
		) {
			const { builder } = RollEngine.rollPure({
				rollExpression: diceExpression,
				rollTitle: '',
				actorName: intr.user.username,
				rollDescription: RollDefinition.strings.dice.rolledDice,
				rollNote,
			});
			await EmbedUtils.dispatchEmbeds(intr, [builder.compileEmbed()], secretRoll, undefined);
			return;
		}

		const context = await contextService.getExpansionContext({
			userId: intr.user.id,
			guildId: intr.guildId ?? undefined,
			channelId: intr.channelId ?? undefined,
			includeGmUserId: RollEngine.secretRequiresGm(secretRoll),
		});
		const { builder } = await RollEngine.rollWithContext({
			context,
			attributeContextService: contextService,
			options: {
				rollExpression: diceExpression,
				rollTitle: '',
				actorName: context.subject?.character.name ?? intr.user.username,
				rollDescription: RollDefinition.strings.dice.rolledDice,
				rollNote,
			},
		});

		await EmbedUtils.dispatchEmbeds(
			intr,
			[builder.compileEmbed()],
			secretRoll,
			context.subject?.gmUserId
		);
	}
}
