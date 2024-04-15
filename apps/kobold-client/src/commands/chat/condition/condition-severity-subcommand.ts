import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from '../modifier/modifier-command-options.js';
import { ModifierHelpers } from '../modifier/modifier-helpers.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionOptions } from './condition-command-options.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

export class ConditionSeveritySubCommand implements Command {
	public names = [L.en.commands.condition.severity.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.severity.name(),
		description: L.en.commands.condition.severity.description(),
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
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === ConditionOptions.CONDITION_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ConditionOptions.CONDITION_NAME_OPTION.name) ?? '';
			const targetCharacterName =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			try {
				return autocompleteUtils.getConditionsOnTarget(intr, targetCharacterName, match);
			} catch (err) {
				// failed to match a target, so return []
				return [];
			}
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const conditionName = intr.options
			.getString(ConditionOptions.CONDITION_NAME_OPTION.name, true)
			.trim();
		const newSeverity = intr.options
			.getString(ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION.name, true)
			.toLocaleLowerCase()
			.trim();
		const targetCharacterName = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const { gameUtils } = new KoboldUtils(kobold);
		const targetCharacter = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);

		//check if we have an active character

		const targetCondition = FinderHelpers.getConditionByName(
			targetCharacter.targetSheetRecord,
			conditionName
		);
		if (!targetCondition) {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.condition.interactions.notFound());
			return;
		}
		targetCondition.severity = InputParseUtils.parseAsNullableNumber(newSeverity);

		await kobold.sheetRecord.update(
			{ id: targetCharacter.targetSheetRecord.id },
			{
				conditions: targetCharacter.targetSheetRecord.conditions,
			}
		);

		if (targetCondition.severity === null) {
			await InteractionUtils.send(
				intr,
				`Yip! I removed the severity value from the modifier "${conditionName}".`
			);
		} else {
			await InteractionUtils.send(
				intr,
				`Yip! I updated the severity of the modifier "${conditionName}" to ${newSeverity}.`
			);
		}
	}
}
