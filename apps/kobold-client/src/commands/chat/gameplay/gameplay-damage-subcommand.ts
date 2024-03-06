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

import { GameplayOptions } from './gameplay-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class GameplayDamageSubCommand implements Command {
	public names = [L.en.commands.gameplay.damage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.damage.name(),
		description: L.en.commands.gameplay.damage.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
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
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const amount = intr.options.getNumber(GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT.name, true);
		const type = intr.options.getString(GameplayOptions.GAMEPLAY_DAMAGE_TYPE.name);

		const { gameUtils, creatureUtils } = new KoboldUtils(kobold);

		const { targetSheetRecord, hideStats, targetName } =
			await gameUtils.getCharacterOrInitActorTarget(intr, targetCharacter);

		const creature = Creature.fromSheetRecord(targetSheetRecord);

		let message = '';
		if (amount >= 0) {
			const damageResult = creature.applyDamage(amount, type ?? 'untyped');

			message = EmbedUtils.buildDamageResultText({
				initialDamageAmount: amount,
				targetCreatureName: creature.name,
				totalDamageDealt: damageResult.appliedDamage,
				targetCreatureSheet: creature.sheet,
				triggeredResistances: damageResult.appliedResistance
					? [damageResult.appliedResistance]
					: [],
				triggeredWeaknesses: damageResult.appliedWeakness
					? [damageResult.appliedWeakness]
					: [],
				triggeredImmunities: damageResult.appliedImmunity
					? [damageResult.appliedImmunity]
					: [],
			});
		} else {
			const healingResult = creature.heal(Math.abs(amount));

			message = EmbedUtils.buildDamageResultText({
				initialDamageAmount: amount,
				targetCreatureName: creature.name,
				totalDamageDealt: -healingResult.totalHealed,
				targetCreatureSheet: creature.sheet,
			});
		}
		await creatureUtils.saveSheet(intr, targetSheetRecord);

		await InteractionUtils.send(intr, message);
	}
}
