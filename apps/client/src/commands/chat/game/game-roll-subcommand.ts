import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { getEmoji } from '../../../constants/emoji.js';
import { Kobold, SheetRecord } from '@kobold/db';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GameRollSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.roll
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const targetCharacter =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === commandOptions[commandOptionsEnum.rollType].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.rollType].name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGameLite = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');

			if (!activeGameLite) return [];

			// Need full character data for roll enumeration
			const activeGame = await kobold.game.read({ id: activeGameLite.id });
			if (!activeGame) return [];

			const choices: Set<string> = new Set();
			if (match === '' || 'dice'.includes(match.toLocaleLowerCase())) choices.add('Dice');

			let results: { name: string; value: string }[] = [];
			for (const character of activeGame?.characters || []) {
				const creature = Creature.fromSheetRecord(character, undefined, intr);

				const allRolls = [
					..._.keys(creature.attackRolls),
					...creature.actions.map(action => action?.name),
					..._.keys(creature.rolls),
				];

				const matchedRolls = allRolls.filter(roll =>
					roll.toLowerCase().includes(match.toLowerCase())
				);
				results.push(
					...matchedRolls.map(roll => ({
						name: roll,
						value: roll,
					}))
				);
			}
			results = _.uniqBy(results, result => result.name);
			return results;
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
		if (!intr.isChatInputCommand()) return;
		const rollType = intr.options.getString(
			commandOptions[commandOptionsEnum.rollType].name,
			true
		);
		const diceExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.diceRollOrModifier].name) ??
			'';
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const targetSheetName = intr.options.getString(
			commandOptions[commandOptionsEnum.initCharacterTarget].name
		);

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			GameDefinition.optionChoices.rollSecret.public;

		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils, creatureUtils } = koboldUtils;
		const { activeGame, userSettings } = await koboldUtils.fetchNonNullableDataForCommand(
			intr,
			{
				activeGame: true,
				userSettings: true,
			}
		);

		const embeds: KoboldEmbed[] = [];

		let targetCreature: Creature | null = null;
		let targetSheetRecord: SheetRecord | null = null;
		let targetName: string | null = targetSheetName;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			hideStats = results.hideStats;
			targetSheetRecord = results.targetSheetRecord;
			targetName = results.targetName;
			targetCreature = Creature.fromSheetRecord(results.targetEntity, undefined, intr);
		}

		if (activeGame.characters.length === 0) {
			await InteractionUtils.send(
				intr,
				`You have no characters in this game. Have players join using \`/game manage manage-option:join manage-value:${activeGame.name}\`.`
			);
			return;
		}

		// Resolve targets (can be characters, minions, or both for "All Players")
		const { characters, minions } = await gameUtils.getGameTargets(
			targetCharacterName,
			activeGame
		);

		// Process characters
		for (const character of _.uniqBy(characters, 'id')) {
			const creature = Creature.fromSheetRecord(character, undefined, intr);
			const rollResult = await this.processCreatureRoll(
				intr,
				creature,
				rollType,
				diceExpression,
				userSettings,
				targetCreature,
				targetSheetRecord,
				targetSheetName,
				hideStats,
				creatureUtils
			);
			embeds.push(...rollResult);
		}

		// Process minions
		for (const minion of _.uniqBy(minions, 'id')) {
			const creature = Creature.fromSheetRecord(minion, minion.name, intr);
			const rollResult = await this.processCreatureRoll(
				intr,
				creature,
				rollType,
				diceExpression,
				userSettings,
				targetCreature,
				targetSheetRecord,
				targetSheetName,
				hideStats,
				creatureUtils
			);
			embeds.push(...rollResult);
		}

		if (embeds.length === 0) {
			await InteractionUtils.send(intr, 'Yip! No targets found matching that selection.');
			return;
		}

		await EmbedUtils.dispatchEmbeds(intr, embeds, secretRoll, activeGame.gmUserId);
	}

	private async processCreatureRoll(
		intr: ChatInputCommandInteraction,
		creature: Creature,
		rollType: string,
		diceExpression: string,
		userSettings: any,
		targetCreature: Creature | null,
		targetSheetRecord: SheetRecord | null,
		targetSheetName: string | null,
		hideStats: boolean,
		creatureUtils: any
	): Promise<KoboldEmbed[]> {
		const embeds: KoboldEmbed[] = [];
		const rollOptions = {
			...creature.rolls,
			...creature.attackRolls,
		};
		const targetAction = creature.actions.find(action => {
			return action.name.toLocaleLowerCase().trim() === rollType.toLocaleLowerCase().trim();
		});
		if (targetAction) {
			const actionRoller = new ActionRoller(
				userSettings,
				targetAction,
				creature,
				targetCreature
			);

			const builtRoll = actionRoller.buildRoll('', targetAction.description ?? '', {
				attackModifierExpression: diceExpression,
				damageModifierExpression: '',
				title: `${getEmoji(intr, targetAction.actionCost)} ${
					creature.sheet.staticInfo.name
				} used ${targetAction.name}!`,
			});

			let embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});

			if (targetSheetRecord && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats: hideStats,
					targetNameOverwrite: targetSheetName!,
				});
				embed.addFields(damageField);
			}
			embeds.push(embed);
		} else if (rollOptions[rollType.trim().toLocaleLowerCase()]) {
			const rollResult = await ActionRoller.fromCreatureRoll(creature, rollType, intr, {
				modifierExpression: diceExpression,
				targetCreature,
				hideStats: hideStats ?? false,
			});
			let embed: KoboldEmbed;

			if (_.isString(rollResult.message)) {
				embed = new KoboldEmbed().setDescription(rollResult.message);
			} else {
				embed = rollResult.message;
			}

			if (
				targetSheetRecord &&
				targetCreature &&
				rollResult.actionRoller &&
				rollResult.actionRoller.shouldDisplayDamageText()
			) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller: rollResult.actionRoller,
					hideStats: hideStats,
					targetNameOverwrite: targetSheetName!,
				});

				embed.addFields(damageField);
			}
			embeds.push(embed);
		} else if (rollType.toLocaleLowerCase() === 'dice') {
			const rollBuilder = new RollBuilder({
				creature: creature,
				actorName: intr.user.username,
				rollDescription: GameDefinition.strings.roll.rolledDice,
				userSettings,
			});
			rollBuilder.addRoll({ rollExpression: diceExpression });
			embeds.push(rollBuilder.compileEmbed());
		} else {
			const noRollFoundEmbed = new KoboldEmbed();
			noRollFoundEmbed.setTitle(
				`Yip! ${creature.name} doesn't have a roll named ${rollType}.`
			);
			embeds.push(noRollFoundEmbed);
		}
		return embeds;
	}
}
