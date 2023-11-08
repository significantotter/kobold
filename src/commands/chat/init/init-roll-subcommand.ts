import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { ChatArgs } from '../../../constants/chat-args.js';
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
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { getEmoji } from '../../../constants/emoji.js';
import { InitOptions } from './init-command-options.js';
import {
	Character,
	CharacterModel,
	InitiativeActor,
	InitiativeActorModel,
} from '../../../services/kobold/index.js';
import { GameUtils } from '../../../utils/kobold-service-utils/game-utils.js';
import { SettingsUtils } from '../../../utils/kobold-service-utils/user-settings-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { koboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

export class InitRollSubCommand implements Command {
	public names = [L.en.commands.init.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.roll.name(),
		description: L.en.commands.init.roll.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{kobold}: {kobold: Kobold}
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			return await AutocompleteUtils.getAllControllableInitiativeActors(intr, match);
		} else if (option.name === InitOptions.INIT_ROLL_CHOICE_OPTION.name) {
			const match = intr.options.getString(InitOptions.INIT_ROLL_CHOICE_OPTION.name) ?? '';
			const targetCharacterName =
				intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			return await AutocompleteUtils.getMatchingRollsForInitiativeSheet(
				intr,
				match,
				targetCharacterName
			);
		} else if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name) ?? '';

			return await AutocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
		data: any,
		{ kobold }: { kobold: any }
	): Promise<void> {
		const rollChoice = intr.options.getString(InitOptions.INIT_ROLL_CHOICE_OPTION.name, true);
		const targetCharacterName = intr.options.getString(
			InitOptions.INIT_CHARACTER_OPTION.name,
			true
		);
		const targetInitActorName = intr.options.getString(
			InitOptions.INIT_CHARACTER_TARGET.name,
			true
		);

		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name) ?? '';
		const damageModifierExpression =
			intr.options.getString(ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name) ?? '';
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name) ?? undefined;

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';

		const { gameUtils } = koboldUtils(kobold);

		const [currentInit, userSettings, activeGame] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			SettingsUtils.getSettingsForUser(intr),
			gameUtils.getActiveGame(intr.user.id, intr.guildId ?? ''),
		]);

		const actor = InitiativeUtils.getNameMatchActorFromInitiative(
			currentInit.gmUserId,
			currentInit,
			targetCharacterName,
			LL,
			true
		);

		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActorModel | CharacterModel | undefined;

		if (targetInitActorName && targetInitActorName !== '__NONE__') {
			const { targetCharacter, targetInitActor } =
				await gameUtils.getCharacterOrInitActorTarget(intr, targetInitActorName);
			targetActor = targetInitActor ?? targetCharacter ?? undefined;
			if (targetActor) targetCreature = Creature.fromModelWithSheet(targetActor);
		}

		if (!actor.sheet) {
			if (rollChoice.toLowerCase().trim() === 'dice') {
				// a simple dice roll doesn't require a sheet
				const rollBuilder = new RollBuilder({
					actorName: intr.user.username,
					rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
					rollNote,
					userSettings,
					LL,
				});
				rollBuilder.addRoll({ rollExpression: modifierExpression ?? 'd20' });
				const response = rollBuilder.compileEmbed();

				await EmbedUtils.dispatchEmbeds(intr, [response], secretRoll, activeGame?.gmUserId);
				return;
			} else {
				await InteractionUtils.send(intr, LL.commands.init.roll.interactions.noSheet());
				return;
			}
		}
		const creature = new Creature(actor.sheet);

		const targetRoll = creature.attackRolls[rollChoice] ?? creature.rolls[rollChoice];

		const targetAction =
			(actor?.character?.actions ?? []).find(
				action => action.name.toLowerCase().trim() === rollChoice.toLowerCase().trim()
			) ?? creature.keyedActions[rollChoice];

		if (!targetRoll && !targetAction) {
			await InteractionUtils.send(intr, LL.commands.init.roll.interactions.invalidRoll());
			return;
		}

		let embed: KoboldEmbed;

		if (targetAction) {
			const actionRoller = new ActionRoller(
				userSettings,
				targetAction,
				creature,
				targetCreature
			);

			const builtRoll = actionRoller.buildRoll(rollNote, targetAction.description ?? '', {
				attackModifierExpression: modifierExpression,
				damageModifierExpression,
				title: `${getEmoji(intr, targetAction.actionCost)} ${
					creature.sheet.staticInfo.name
				} used ${targetAction.name}!`,
			});

			embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});

			if (targetActor && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await targetActor.saveSheet(intr, (actionRoller.targetCreature as Creature).sheet);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats: targetActor.hideStats,
					targetNameOverwrite: targetActor.name,
					LL,
				});

				embed.addFields(damageField);
			}
		} else if (['skill', 'ability', 'save', 'spell'].includes(targetRoll.type)) {
			const response = await RollBuilder.fromSimpleCreatureRoll({
				userName: intr.user.username,
				actorName: actor.name,
				creature,
				attributeName: targetRoll.name,
				rollNote,
				modifierExpression,
				userSettings,
				LL,
			});

			embed = response.compileEmbed();
		} else if (targetRoll.type === 'attack') {
			const { builtRoll, actionRoller } = ActionRoller.fromCreatureAttack({
				creature,
				targetCreature,
				attackName: targetRoll.name,
				rollNote,
				attackModifierExpression: modifierExpression,
				damageModifierExpression,
				targetAC,
				userSettings,
				LL,
			});

			embed = builtRoll.compileEmbed({ forceFields: true });

			if (targetActor && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await targetActor.saveSheet(intr, (actionRoller.targetCreature as Creature).sheet);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats: targetActor.hideStats,
					targetNameOverwrite: targetActor.name,
					LL,
				});

				embed.addFields(damageField);
			}
		} else {
			throw new KoboldError(`Yip! I ran into trouble rolling ${targetRoll}`);
		}
		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeGame?.gmUserId);
	}
}
