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

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { RollMacroOptions } from './roll-macro-command-options.js';
import { DiceRollResult } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Kobold } from '../../../services/kobold/kobold.model.js';

export class RollMacroUpdateSubCommand implements Command {
	public names = [L.en.commands.rollMacro.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.update.name(),
		description: L.en.commands.rollMacro.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === RollMacroOptions.MACRO_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const { autocompleteUtils } = new KoboldUtils(kobold);
			const match = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name) ?? '';
			return await autocompleteUtils.getAllMatchingRollsMacrosForCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const rollMacroName = intr.options
			.getString(RollMacroOptions.MACRO_NAME_OPTION.name, true)
			.trim();
		let macro = intr.options
			.getString(RollMacroOptions.MACRO_VALUE_OPTION.name, true)
			.toLocaleLowerCase()
			.trim();

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		let updateValue: string | string[] | number;

		const targetRollMacro = koboldUtils.characterUtils.getRollMacroByName(
			activeCharacter,
			rollMacroName
		);

		if (!targetRollMacro) {
			// no matching roll macro found
			await InteractionUtils.send(intr, LL.commands.rollMacro.interactions.notFound());
			return;
		}

		// test that the macro is a valid roll
		const rollBuilder = new RollBuilder({ character: activeCharacter, LL });
		rollBuilder.addRoll({ rollExpression: macro, rollTitle: 'test' });
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

		kobold.character.update(
			{ id: activeCharacter.id },
			{ rollMacros: activeCharacter.rollMacros }
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.rollMacro.update.interactions.successEmbed.title({
				characterName: activeCharacter.sheet.staticInfo.name,
				macroName: targetRollMacro.name,
				newMacroValue: macro,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
