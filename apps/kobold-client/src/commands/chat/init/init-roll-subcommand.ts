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
import { ChatArgs } from '../../../constants/chat-args.js';

import { getEmoji } from '../../../constants/emoji.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecord } from 'kobold-db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

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
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllControllableInitiativeActors(intr, match);
		} else if (option.name === InitOptions.INIT_ROLL_CHOICE_OPTION.name) {
			const match = intr.options.getString(InitOptions.INIT_ROLL_CHOICE_OPTION.name) ?? '';
			const targetCharacterName =
				intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getMatchingRollsForInitiativeSheet(
				intr,
				match,
				targetCharacterName
			);
		} else if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const rollChoice = intr.options.getString(InitOptions.INIT_ROLL_CHOICE_OPTION.name, true);
		const targetCharacterName = intr.options.getString(
			InitOptions.INIT_CHARACTER_OPTION.name,
			true
		);
		const targetSheetName = intr.options.getString(
			InitOptions.INIT_CHARACTER_TARGET.name,
			true
		);

		const attackRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_ATTACK_OPTION.name) ?? undefined;
		const saveRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_SAVE_OPTION.name) ?? undefined;
		const damageRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_DAMAGE_OPTION.name) ?? undefined;

		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name) ?? '';
		const damageModifierExpression =
			intr.options.getString(ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name) ?? '';
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name) ?? undefined;

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';

		const { gameUtils, creatureUtils } = new KoboldUtils(kobold);

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			currentInitiative: true,
			userSettings: true,
		});
		koboldUtils.assertCurrentInitiativeNotNull(currentInitiative);

		const actor = InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			currentInitiative.gmUserId,
			currentInitiative,
			targetCharacterName,
			true
		);

		let targetSheetRecord: SheetRecord | null = null;
		let targetCreature: Creature | null = null;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			targetSheetRecord = results.targetSheetRecord;
			hideStats = results.hideStats;
			targetCreature = new Creature(targetSheetRecord, targetSheetName, intr);
		}

		const creature = new Creature(actor.sheetRecord, actor.name, intr);

		const targetRoll = creature.attackRolls[rollChoice] ?? creature.rolls[rollChoice];

		const targetAction = creature.actions.find(
			action => action.name.toLowerCase().trim() === rollChoice.toLowerCase().trim()
		);

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
				targetCreature,
				{
					attackRollOverwrite,
					saveRollOverwrite,
					damageRollOverwrite,
				}
			);

			const builtRoll = actionRoller.buildRoll(rollNote, targetAction.description ?? '', {
				attackModifierExpression: modifierExpression,
				damageModifierExpression,
				title: `${getEmoji(intr, targetAction.actionCost)} ${creature.name} used ${
					targetAction.name
				}!`,
			});

			embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});

			if (targetSheetRecord && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats,
					targetNameOverwrite: targetSheetName,
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
				attackRollOverwrite,
				damageRollOverwrite,
				targetAC,
				userSettings,
			});

			embed = builtRoll.compileEmbed({ forceFields: true });

			if (targetSheetRecord && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats: hideStats,
					targetNameOverwrite: targetSheetName,
				});

				embed.addFields(damageField);
			}
		} else {
			throw new KoboldError(`Yip! I ran into trouble rolling ${targetRoll}`);
		}
		await EmbedUtils.dispatchEmbeds(
			intr,
			[embed],
			secretRoll,
			actor?.game?.gmUserId ?? currentInitiative.gmUserId
		);
	}
}
