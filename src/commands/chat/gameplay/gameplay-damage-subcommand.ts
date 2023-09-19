import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';

import { GameplayOptions } from './gameplay-command-options.js';

import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import _ from 'lodash';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';

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
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			return await AutocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacter = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const amount = intr.options.getNumber(GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT.name, true);
		const type = intr.options.getString(GameplayOptions.GAMEPLAY_DAMAGE_TYPE.name, true);

		const { characterOrInitActorTargets } = await GameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

		const sheet = characterOrInitActorTargets[0].sheet;
		const creature = new Creature(sheet);
		let message = '';
		if (amount >= 0) {
			const damageResult = creature.applyDamage(amount, type);

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
		await characterOrInitActorTargets[0].saveSheet(intr, creature.sheet);

		await InteractionUtils.send(intr, message);
	}
}
