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

import { ChatArgs } from '../../../constants/index.js';

import _ from 'lodash';
import { getEmoji } from '../../../constants/emoji.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecord } from 'kobold-db';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from '../init/init-command-options.js';
import { GameOptions } from './game-command-options.js';

export class GameRollSubCommand implements Command {
	public names = [L.en.commands.game.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.roll.name(),
		description: L.en.commands.game.roll.description(),
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
		if (option.name === GameOptions.GAME_TARGET_CHARACTER.name) {
			const targetCharacter =
				intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === GameOptions.GAME_ROLL_TYPE.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(GameOptions.GAME_ROLL_TYPE.name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');

			if (!activeGame) return [];

			const choices: Set<string> = new Set();
			if (match === '' || 'dice'.includes(match.toLocaleLowerCase())) choices.add('Dice');

			let results: { name: string; value: string }[] = [];
			for (const character of activeGame?.characters || []) {
				const creature = Creature.fromSheetRecord(character.sheetRecord);

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
		if (!intr.isChatInputCommand()) return;
		const rollType = intr.options.getString(GameOptions.GAME_ROLL_TYPE.name, true);
		const diceExpression =
			intr.options.getString(GameOptions.GAME_DICE_ROLL_OR_MODIFIER.name) ?? '';
		const targetCharacterName = intr.options.getString(
			GameOptions.GAME_TARGET_CHARACTER.name,
			true
		);
		const targetSheetName = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

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

		let targetSheetRecord: SheetRecord | null = null;
		let targetCreature: Creature | null = null;
		let targetName: string | null = targetSheetName;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			targetSheetRecord = results.targetSheetRecord;
			hideStats = results.hideStats;
			targetName = results.targetName;
			targetCreature = Creature.fromSheetRecord(targetSheetRecord);
		}

		if (activeGame.characters.length === 0) {
			await InteractionUtils.send(
				intr,
				`You have no characters in this game. Have players join using \`/game manage manage-option:join manage-value:${activeGame.name}\`.`
			);
			return;
		}

		for (const character of _.uniqBy(activeGame.characters, 'id')) {
			if (
				targetCharacterName !== 'All Players' &&
				targetCharacterName.toLocaleLowerCase().trim().length > 0 &&
				targetCharacterName.toLocaleLowerCase().trim() !==
					character.name.toLocaleLowerCase().trim()
			) {
				continue;
			}

			const creature = Creature.fromSheetRecord(character.sheetRecord);
			const rollOptions = {
				...creature.rolls,
				...creature.attackRolls,
			};
			const targetAction = creature.actions.find(action => {
				return (
					action.name.toLocaleLowerCase().trim() === rollType.toLocaleLowerCase().trim()
				);
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
					rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
					userSettings,
				});
				rollBuilder.addRoll({ rollExpression: diceExpression });
				embeds.push(rollBuilder.compileEmbed());
			} else {
				const noRollFoundEmbed = new KoboldEmbed();
				noRollFoundEmbed.setCharacter(character);
				noRollFoundEmbed.setTitle(
					`Yip! ${character.name} doesn't have a roll named ${rollType}.`
				);
				embeds.push(noRollFoundEmbed);
			}
		}
		await EmbedUtils.dispatchEmbeds(intr, embeds, secretRoll, activeGame.gmUserId);
	}
}
