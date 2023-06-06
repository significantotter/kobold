import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils';
import { ChatArgs } from '../../../constants/chat-args';
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
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { getEmoji } from '../../../constants/emoji.js';

export class InitRollSubCommand implements Command {
	public names = [Language.LL.commands.init.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.roll.name(),
		description: Language.LL.commands.init.roll.description(),
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
		if (option.name === ChatArgs.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			return await AutocompleteUtils.getAllControllableInitiativeActors(intr, match);
		} else if (option.name === ChatArgs.INIT_ROLL_CHOICE_OPTION.name) {
			const match = intr.options.getString(ChatArgs.INIT_ROLL_CHOICE_OPTION.name);
			const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			return await AutocompleteUtils.getMatchingRollsForInitiativeSheet(
				intr,
				match,
				targetCharacterName
			);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const rollChoice = intr.options.getString(ChatArgs.INIT_ROLL_CHOICE_OPTION.name);
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const damageModifierExpression = intr.options.getString(
			ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name
		);
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secret.value() ||
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();
		const notifyRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();

		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const actorResponse = InitiativeUtils.getNameMatchActorFromInitiative(
			initResult.init.gmUserId,
			initResult.init,
			targetCharacterName,
			LL
		);
		if (actorResponse.errorMessage) {
			await InteractionUtils.send(intr, actorResponse.errorMessage);
			return;
		}

		const actor = actorResponse.actor;

		if (!actor.sheet) {
			if (rollChoice.toLowerCase().trim() === 'dice') {
				// a simple dice roll doesn't require a sheet
				const rollBuilder = new RollBuilder({
					creature: null,
					actorName: intr.user.username,
					rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
					rollNote,
					LL,
				});
				rollBuilder.addRoll({ rollExpression: modifierExpression ?? 'd20' });
				const response = rollBuilder.compileEmbed();

				if (notifyRoll) {
					await InteractionUtils.send(
						intr,
						Language.LL.commands.roll.interactions.secretRollNotification()
					);
				} else await InteractionUtils.send(intr, response, isSecretRoll);
				return;
			} else {
				await InteractionUtils.send(intr, LL.commands.init.roll.interactions.noSheet());
				return;
			}
		}
		const creature = new Creature(actor.sheet);

		const targetRoll = creature.rolls[rollChoice] ?? creature.attackRolls[rollChoice];

		const targetAction = creature.keyedActions[rollChoice];

		if (!targetRoll) {
			await InteractionUtils.send(intr, LL.commands.init.roll.interactions.invalidRoll());
			return;
		}

		let embed: KoboldEmbed;

		if (['skill', 'ability', 'save', 'spell'].includes(targetRoll.type)) {
			const response = await DiceUtils.rollSimpleCreatureRoll({
				userName: intr.user.username,
				actorName: actor.name,
				creature,
				attributeName: targetRoll.name,
				rollNote,
				modifierExpression,
				LL,
			});

			embed = response.compileEmbed();

			await InteractionUtils.send(intr, response.compileEmbed(), isSecretRoll);
		} else if (targetRoll.type === 'attack') {
			const response = DiceUtils.rollCreatureAttack({
				creature: creature,
				attackName: targetRoll.name,
				rollNote,
				attackModifierExpression: modifierExpression,
				damageModifierExpression,
				targetAC,
				LL,
			});

			embed = response.compileEmbed({ forceFields: true });
		} else if (targetAction) {
			const actionRoller = new ActionRoller(targetAction, creature, null);

			const builtRoll = actionRoller.buildRoll(rollNote, targetAction.description, {
				attackModifierExpression: modifierExpression,
				damageModifierExpression,
				title: `${getEmoji(intr, targetAction.actionCost)} ${
					creature.sheet.info.name
				} used ${targetAction.name}!`,
			});

			embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});
		}
		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}

		await embed.sendBatches(intr, isSecretRoll);
	}
}
