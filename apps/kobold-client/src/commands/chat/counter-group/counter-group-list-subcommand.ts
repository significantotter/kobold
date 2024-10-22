import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterGroupHelpers } from './counter-group-helpers.js';

export class CounterGroupListSubCommand implements Command {
	public name = L.en.commands.counterGroup.list.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counterGroup.list.name(),
		description: L.en.commands.counterGroup.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Counter Groups`);
		embed.setFields(
			activeCharacter.sheetRecord.sheet.counterGroups.map(counterGroup => ({
				name: counterGroup.name,
				value: CounterGroupHelpers.detailCounterGroup(counterGroup),
			}))
		);
		await embed.sendBatches(intr);
	}
}
