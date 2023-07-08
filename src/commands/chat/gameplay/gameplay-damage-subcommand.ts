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
import { EventData } from '../../../models/internal-models.js';
import { Command, CommandDeferType } from '../../index.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { GameplayUtils } from '../../../utils/gameplay-utils.js';
import _ from 'lodash';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';

export class GameplayDamageSubCommand implements Command {
	public names = [Language.LL.commands.gameplay.damage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.gameplay.damage.name(),
		description: Language.LL.commands.gameplay.damage.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			return await AutocompleteUtils.getGameplayTargetCharacters(intr, option.value);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const compositeId = intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name);
		const amount = intr.options.getNumber(GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT.name);
		const type = intr.options.getString(GameplayOptions.GAMEPLAY_DAMAGE_TYPE.name);

		let targetCharacters = await GameplayUtils.fetchGameplayTargets(intr, compositeId);
		const sheet = targetCharacters[0].sheet;
		const creature = new Creature(sheet);
		let message = '';
		if (amount >= 0) {
			const damageResult = creature.applyDamage(amount, type);

			message = EmbedUtils.buildDamageResultText({
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
				targetCreatureName: creature.name,
				totalDamageDealt: -healingResult.totalHealed,
				targetCreatureSheet: creature.sheet,
			});
		}
		for (const target of targetCharacters) {
			await target.$query().patch({ sheet });
		}

		await InteractionUtils.send(intr, message);
	}
}
