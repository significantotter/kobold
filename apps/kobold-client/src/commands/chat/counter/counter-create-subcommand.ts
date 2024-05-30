import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { CounterOptions } from './counter-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class CounterCreateSubCommand implements Command {
	public names = [L.en.commands.counter.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.create.name(),
		description: L.en.commands.counter.create.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
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
		let name = intr.options.getString(CounterOptions.COUNTER_NAME_OPTION.name, true).trim();
		let description = intr.options.getString(CounterOptions.COUNTER_DESCRIPTION_OPTION.name);

		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		if (description && !InputParseUtils.isValidString(description, { maxLength: 300 })) {
			throw new KoboldError(
				`Yip! The counter group description must be less than 300 characters!`
			);
		}
		if (
			activeCharacter.sheetRecord.sheet.counters.find(
				group => group.name.toLowerCase() === name.toLowerCase()
			)
		) {
			throw new KoboldError(
				LL.commands.counter.create.interactions.alreadyExists({
					groupName: name,
					characterName: activeCharacter.name,
				})
			);
		}

		//create the counter group
		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: {
					...activeCharacter.sheetRecord.sheet,
					counters: [
						...activeCharacter.sheetRecord.sheet.counters,
						{
							name: name,
							description: description,
							counters: [],
						},
					],
				},
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.counter.create.interactions.created({
				groupName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
