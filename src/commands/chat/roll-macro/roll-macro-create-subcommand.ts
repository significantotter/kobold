import { RollMacroOptions } from './roll-macro-command-options';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { Character, Initiative } from '../../../services/kobold/models/index.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceRollResult, RollBuilder } from '../../../utils/dice-utils.js';

export class RollMacroCreateSubCommand implements Command {
	public names = [Language.LL.commands.rollMacro.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.rollMacro.create.name(),
		description: Language.LL.commands.rollMacro.create.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let name = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name).trim();
		const macro = intr.options.getString(RollMacroOptions.MACRO_VALUE_OPTION.name);

		// make sure the name does't already exist in the character's rollMacros
		if (activeCharacter.getRollMacroByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.rollMacro.create.interactions.alreadyExists({
					macroName: name,
					characterName: activeCharacter.characterData.name,
				})
			);
			return;
		}

		// test that the macro is a valid roll
		const rollBuilder = new RollBuilder({ character: activeCharacter, LL });
		rollBuilder.addRoll({ rollExpression: macro });
		const result: DiceRollResult = rollBuilder.rollResults[0] as DiceRollResult;
		if (result.results.errors.length > 0) {
			await InteractionUtils.send(
				intr,
				LL.commands.rollMacro.interactions.doesntEvaluateError()
			);
			return;
		}

		if (activeCharacter.rollMacros.length + 1 > 50) {
			await InteractionUtils.send(intr, LL.commands.rollMacro.interactions.tooMany());
			return;
		}

		await Character.query().updateAndFetchById(activeCharacter.id, {
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
				characterName: activeCharacter.characterData.name,
			})
		);
		return;
	}
}
