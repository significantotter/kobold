import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { Command } from '../../index.js';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { RollContextService, RollEngine } from '../../../utils/roll-engine.js';
import { KoboldError } from '@kobold/util';
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

		const contextService = new RollContextService(kobold);
		const context = await contextService.getExpansionContext({
			userId: intr.user.id,
			guildId: intr.guildId ?? undefined,
			channelId: intr.channelId ?? undefined,
			includeGmUserId: RollEngine.secretRequiresGm(secretRoll),
		});
		if (!context.subject) {
			throw new KoboldError("Yip! You don't have any characters! Use /import to import one.");
		}

		const rollName = 'perception';
		const attributeName = RollEngine.structuredAttributeName(rollName);
		const { builder } = await RollEngine.rollWithContext({
			context,
			attributeContextService: contextService,
			options: {
				rollExpression: DiceUtils.buildDiceExpression(
					'd20',
					`[${attributeName}]`,
					modifierExpression
				),
				rollTitle: '',
				actorName: context.subject.character.name,
				rollDescription: RollDefinition.strings.perception.rolledPerception,
				rollNote,
				baseTags: RollEngine.structuredTags({ rollName, rollKind: 'perception' }),
			},
		});

		await EmbedUtils.dispatchEmbeds(
			intr,
			[builder.compileEmbed()],
			secretRoll,
			context.subject.gmUserId
		);
	}
}
