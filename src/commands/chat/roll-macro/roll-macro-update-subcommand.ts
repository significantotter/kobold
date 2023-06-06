import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { RollMacroOptions } from './roll-macro-command-options.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character } from '../../../services/kobold/models/index.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { DiceRollResult } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

export class RollMacroUpdateSubCommand implements Command {
	public names = [Language.LL.commands.rollMacro.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.rollMacro.update.name(),
		description: Language.LL.commands.rollMacro.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === RollMacroOptions.MACRO_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name);
			return await AutocompleteUtils.getAllMatchingRollsMacrosForCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const rollMacroName = (
			intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name) ?? ''
		).trim();
		let macro = (intr.options.getString(RollMacroOptions.MACRO_VALUE_OPTION.name) ?? '')
			.toLocaleLowerCase()
			.trim();

		let updateValue: string | string[] | number;

		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		const targetRollMacro = activeCharacter.getRollMacroByName(rollMacroName);
		if (!targetRollMacro) {
			// no matching roll macro found
			await InteractionUtils.send(intr, LL.commands.rollMacro.interactions.notFound());
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

		// still references the deep values in characterRollMacros
		let targetIndex = _.indexOf(activeCharacter.rollMacros, targetRollMacro);

		activeCharacter.rollMacros[targetIndex].macro = macro;

		await Character.query().patchAndFetchById(activeCharacter.id, {
			rollMacros: activeCharacter.rollMacros,
		});

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.rollMacro.update.interactions.successEmbed.title({
				characterName: activeCharacter.sheet.info.name,
				macroName: targetRollMacro.name,
				newMacroValue: macro,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
