import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { RollMacroOptions } from './roll-macro-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command, CommandDeferType } from '../../index.js';

export class RollMacroCreateSubCommand implements Command {
	public names = [L.en.commands.rollMacro.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.create.name(),
		description: L.en.commands.rollMacro.create.description(),
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

		let name = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name, true).trim();
		const macro = intr.options.getString(RollMacroOptions.MACRO_VALUE_OPTION.name, true);

		// make sure the name does't already exist in the character's rollMacros
		if (FinderHelpers.getRollMacroByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.rollMacro.create.interactions.alreadyExists({
					macroName: name,
					characterName: activeCharacter.name,
				})
			);
			return;
		}

		// test that the macro is a valid roll
		const rollBuilder = new RollBuilder({ character: activeCharacter, LL });
		rollBuilder.addRoll({ rollExpression: macro, rollTitle: 'test' });
		const result = rollBuilder.rollResults[0];
		if ((result as any)?.error || (result as any)?.results?.error?.length) {
			await InteractionUtils.send(
				intr,
				LL.commands.rollMacro.interactions.doesntEvaluateError()
			);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				rollMacros: [
					...activeCharacter.sheetRecord.rollMacros,
					{
						name,
						macro,
					},
				],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.rollMacro.create.interactions.created({
				macroName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
