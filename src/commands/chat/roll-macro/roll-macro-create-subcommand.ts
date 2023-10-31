import { RollMacroOptions } from './roll-macro-command-options.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Character, CharacterModel } from '../../../services/kobold/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

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
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let name = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name, true).trim();
		const macro = intr.options.getString(RollMacroOptions.MACRO_VALUE_OPTION.name, true);

		// make sure the name does't already exist in the character's rollMacros
		if (activeCharacter.getRollMacroByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.rollMacro.create.interactions.alreadyExists({
					macroName: name,
					characterName: activeCharacter.sheet.staticInfo.name,
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

		await CharacterModel.query().updateAndFetchById(activeCharacter.id, {
			rollMacros: [
				...activeCharacter.rollMacros,
				{
					name,
					macro,
				},
			],
		});

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.rollMacro.create.interactions.created({
				macroName: name,
				characterName: activeCharacter.sheet.staticInfo.name,
			})
		);
		return;
	}
}
