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
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils, MultiRollResult, RollBuilder } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { ActionOptions } from '../action/action-command-options.js';
import _ from 'lodash';
import { ActionRoller } from '../../../utils/action-roller.js';

export class RollActionSubCommand implements Command {
	public names = [Language.LL.commands.roll.action.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.action.name(),
		description: Language.LL.commands.roll.action.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = CharacterUtils.findPossibleActionFromString(
				activeCharacter,
				match
			).map(action => ({
				name: action.name,
				value: action.name,
			}));
			//return the matched actions
			return matchedActions;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetActionName = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);
		const attackModifierExpression = intr.options.getString(
			ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name
		);
		const damageModifierExpression = intr.options.getString(
			ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name
		);
		const heightenLevel = intr.options.getInteger(ChatArgs.HEIGHTEN_LEVEL_OPTION.name);
		const targetDC = intr.options.getInteger(ChatArgs.ROLL_TARGET_DC_OPTION.name);
		const saveDiceRoll = intr.options.getString(ChatArgs.ROLL_SAVE_DICE_ROLL_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secret.value() ||
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();
		const notifyRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.noActiveCharacter(),
				isSecretRoll
			);
			return;
		}

		const targetAction = activeCharacter.actions.find(
			action => action.name.toLocaleLowerCase() === targetActionName.toLocaleLowerCase()
		);

		const actionRoller = new ActionRoller(targetAction, activeCharacter, null, {
			heightenLevel,
		});

		const builtRoll = await actionRoller.buildRoll(rollNote, targetAction.description, {
			heightenLevel,
			targetDC,
			saveDiceRoll,
			attackModifierExpression,
			damageModifierExpression,
		});

		const response = builtRoll.compileEmbed({ forceFields: true, showTags: false });

		const descriptionArr = [];
		if (heightenLevel) {
			descriptionArr.push(`Heightened to level ${heightenLevel}`);
		}
		if (saveDiceRoll) {
			let rollType = '';
			for (const roll of targetAction.rolls) {
				if (roll.type === 'save') {
					rollType = ` ${roll.saveRollType}`;
					break;
				}
			}
			descriptionArr.push(`The target rolls${rollType} ${saveDiceRoll}`);
		}
		if (targetDC) {
			let saveType = ' DC';
			for (const roll of targetAction.rolls) {
				if (roll.type === 'save' || roll.type === 'attack') {
					saveType = ` ${roll.saveTargetDC ?? roll.targetDC}`;
					// add the word DC if we aren't checking vs the AC
					if (
						saveType.toLocaleLowerCase() !== ' ac' &&
						!_.endsWith(saveType.toLocaleLowerCase(), ' dc')
					)
						saveType += ' DC';
					// change a to an if the next letter is a vowel
					if (['a', 'e', 'i', 'o', 'u'].includes(saveType[1].toLocaleLowerCase()))
						saveType = `n${saveType}`;
					break;
				}
			}
			descriptionArr.push(`VS a${saveType} of ${targetDC}`);
		}
		response.setDescription(descriptionArr.join('\n'));

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		await InteractionUtils.send(intr, response, isSecretRoll);
	}
}
