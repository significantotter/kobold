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
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { ActionOptions } from '../action/action-command-options.js';
import _ from 'lodash';
import { ActionRoller } from '../../../utils/action-roller.js';
import { getEmoji } from '../../../constants/emoji.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { InitOptions } from '../init/init-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import { InitiativeUtils } from '../../../utils/initiative-utils.js';

export class RollActionSubCommand implements Command {
	public names = [Language.LL.commands.roll.action.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.action.name(),
		description: Language.LL.commands.roll.action.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
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
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
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
		if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);

			return await AutocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetActionName = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);
		const targetInitActor = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);
		const attackModifierExpression = intr.options.getString(
			ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name
		);
		const damageModifierExpression = intr.options.getString(
			ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name
		);
		const heightenLevel = intr.options.getInteger(ChatArgs.HEIGHTEN_LEVEL_OPTION.name);
		const targetDC = intr.options.getInteger(ChatArgs.ROLL_TARGET_DC_OPTION.name);
		const saveRollType = intr.options.getString(ChatArgs.ROLL_SAVE_DICE_ROLL_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secret.value() ||
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();
		const notifyRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
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

		const creature = Creature.fromCharacter(activeCharacter);
		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActor | undefined;

		if (targetInitActor && targetInitActor != '__NONE__') {
			targetActor = await InitiativeUtils.getInitActorByName(intr, targetInitActor);
			targetCreature = Creature.fromInitActor(targetActor);
		}

		const actionRoller = new ActionRoller(targetAction, creature, targetCreature, {
			heightenLevel,
		});

		const builtRoll = actionRoller.buildRoll(rollNote, targetAction.description, {
			heightenLevel,
			targetDC,
			saveDiceRoll: saveRollType,
			attackModifierExpression,
			damageModifierExpression,
			title: `${getEmoji(intr, targetAction.actionCost)} ${creature.sheet.info.name} used ${
				targetAction.name
			}!`,
		});

		const appliedDamage = actionRoller.totalDamageDealt;

		const embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

		const response = EmbedUtils.describeActionResult({
			embed,
			action: targetAction,
			heightenLevel,
			saveRollType,
			targetDC,
		});

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		await response.sendBatches(intr, isSecretRoll);

		if (
			targetCreature &&
			targetAction.rolls.some(
				roll => roll.type === 'damage' || roll.type === 'advanced-damage'
			)
		) {
			// apply any damage effects from the action to the creature
			let promises = [targetActor.$query().patch({ sheet: targetCreature.sheet })];
			if (targetActor.characterId) {
				promises.push(
					targetActor
						.$relatedQuery<Character>('character')
						.patch({ sheet: targetCreature.sheet })
				);
			}
			await Promise.all(promises);

			let message = actionRoller.buildResultText();

			// inform the channel that damage was dealt
			await InteractionUtils.send(intr, message);
		}
	}
}
