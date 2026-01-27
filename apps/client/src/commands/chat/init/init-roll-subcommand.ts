import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { getEmoji } from '../../../constants/emoji.js';
import { Kobold, SheetRecord } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitRollSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.roll
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.initCharacter].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.initCharacter].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllControllableInitiativeActors(intr, match);
		} else if (option.name === commandOptions[commandOptionsEnum.initRollChoice].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.initRollChoice].name) ??
				'';
			const targetCharacterName =
				intr.options.getString(commandOptions[commandOptionsEnum.initCharacter].name) ?? '';
			console.log(targetCharacterName);

			const { autocompleteUtils } = new KoboldUtils(kobold);
			const res = await autocompleteUtils.getMatchingRollsForInitiativeSheet(
				intr,
				match,
				targetCharacterName
			);
			console.log(res);
			return res;
		} else if (option.name === commandOptions[commandOptionsEnum.initCharacterTarget].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(
					commandOptions[commandOptionsEnum.initCharacterTarget].name
				) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const rollChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.initRollChoice].name,
			true
		);
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.initCharacter].name,
			true
		);
		const targetSheetName = intr.options.getString(
			commandOptions[commandOptionsEnum.initCharacterTarget].name,
			true
		);

		const attackRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteAttack].name) ??
			undefined;
		const saveRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteSave].name) ??
			undefined;
		const damageRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteDamage].name) ??
			undefined;
		const modifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.rollModifier].name) ?? '';
		const damageModifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.damageRollModifier].name) ??
			'';
		const targetAC =
			intr.options.getInteger(commandOptions[commandOptionsEnum.rollTargetAc].name) ??
			undefined;

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			InitDefinition.optionChoices.rollSecret.public;

		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.initNote].name) ?? '';

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
		console.log(actor.name, targetSheetName, targetCharacterName);

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
			await InteractionUtils.send(intr, InitDefinition.strings.roll.invalidRoll);
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
		} else if (['check', 'skill', 'ability', 'save', 'spell'].includes(targetRoll.type)) {
			const response = await RollBuilder.fromSimpleCreatureRoll({
				userName: intr.user.username,
				actorName: actor.name,
				creature,
				attributeName: targetRoll.name,
				rollNote,
				modifierExpression,
				userSettings,
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
			throw new KoboldError(`Yip! I ran into trouble rolling ${targetRoll.name}`);
		}

		await EmbedUtils.dispatchEmbeds(
			intr,
			[embed],
			secretRoll,
			actor?.game?.gmUserId ?? currentInitiative.gmUserId
		);
	}
}
