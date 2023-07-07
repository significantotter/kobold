import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';
import _ from 'lodash';
import { GameOptions } from './game-command-options.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { Creature } from '../../../utils/creature.js';
import { InitOptions } from '../init/init-command-options.js';
import { InitiativeUtils } from '../../../utils/initiative-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { getEmoji } from '../../../constants/emoji.js';

export class GameRollSubCommand implements Command {
	public names = [Language.LL.commands.game.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.game.roll.name(),
		description: Language.LL.commands.game.roll.description(),
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
		if (option.name === GameOptions.GAME_TARGET_CHARACTER.name) {
			const targetCharacter = intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name);

			const activeGame = await GameUtils.getActiveGame(intr.user.id, intr.guildId);
			return GameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		} else if (option.name === GameOptions.GAME_ROLL_TYPE.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(GameOptions.GAME_ROLL_TYPE.name);

			const activeGame = await GameUtils.getActiveGame(intr.user.id, intr.guildId);

			if (!activeGame) return [];

			const choices: Set<string> = new Set();
			if (match === '' || 'dice'.includes(match.toLocaleLowerCase())) choices.add('Dice');

			let results: { name: string; value: string }[] = [];
			for (const character of activeGame?.characters || []) {
				const creature = new Creature(character.sheet);

				const allRolls = [
					..._.keys(creature.attackRolls),
					...character.actions.map(action => action?.name),
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
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);

			return await AutocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const rollType = intr.options.getString(GameOptions.GAME_ROLL_TYPE.name);
		const diceExpression = intr.options.getString(GameOptions.GAME_DICE_ROLL_OR_MODIFIER.name);
		const targetCharacter = intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name);
		const targetInitActor = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secret.value() ||
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();
		const notifyRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();

		const activeGame = await GameUtils.getActiveGame(intr.user.id, intr.guildId);

		if (!activeGame) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.game.interactions.activeGameNotFound()
			);
			return;
		}
		const embeds: KoboldEmbed[] = [];

		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActor | undefined;

		if (targetInitActor && targetInitActor !== '__NONE__') {
			targetActor = await InitiativeUtils.getInitActorByName(intr, targetInitActor);
			targetCreature = Creature.fromInitActor(targetActor);
		}

		for (const character of activeGame.characters) {
			if (
				targetCharacter &&
				targetCharacter.toLocaleLowerCase().trim().length > 0 &&
				targetCharacter.toLocaleLowerCase().trim() !==
					character.sheet.info.name.toLocaleLowerCase().trim()
			) {
				continue;
			}

			const creature = Creature.fromCharacter(character);
			const rollOptions = {
				...creature.rolls,
				...creature.attackRolls,
			};
			const targetAction = character.actions.find(action => {
				action.name.toLocaleLowerCase().trim() === rollType.toLocaleLowerCase().trim();
			});
			if (targetAction) {
				const actionRoller = new ActionRoller(targetAction, creature, targetCreature);

				const builtRoll = actionRoller.buildRoll(null, targetAction.description, {
					attackModifierExpression: diceExpression,
					damageModifierExpression: '',
					title: `${getEmoji(intr, targetAction.actionCost)} ${
						creature.sheet.info.name
					} used ${targetAction.name}!`,
				});

				let embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

				embed = EmbedUtils.describeActionResult({
					embed,
					action: targetAction,
				});

				if (targetCreature && actionRoller.shouldDisplayDamageText()) {
					await targetActor.saveSheet(actionRoller.targetCreature.sheet);

					const damageField = await EmbedUtils.getOrSendActionDamageField({
						intr,
						actionRoller,
						hideStats: targetActor.hideStats,
						targetNameOverwrite: targetActor.name,
						LL,
					});

					embed.addFields(damageField);
				}
				embeds.push(embed);
			} else if (rollOptions[rollType.trim().toLocaleLowerCase()]) {
				const rollResult = await DiceUtils.rollCreatureDice(creature, rollType, intr, {
					modifierExpression: diceExpression,
					targetCreature,
				});
				let embed: KoboldEmbed;

				if (_.isString(rollResult.message)) {
					embed = new KoboldEmbed().setDescription(rollResult.message);
				} else {
					embed = rollResult.message;
				}

				if (
					targetCreature &&
					rollResult.actionRoller &&
					rollResult.actionRoller.shouldDisplayDamageText()
				) {
					await targetActor.saveSheet(rollResult.actionRoller.targetCreature.sheet);

					const damageField = await EmbedUtils.getOrSendActionDamageField({
						intr,
						actionRoller: rollResult.actionRoller,
						hideStats: targetActor.hideStats,
						targetNameOverwrite: targetActor.name,
						LL,
					});

					embed.addFields(damageField);
				}
				embeds.push(embed);
			} else if (rollType.toLocaleLowerCase() === 'dice') {
				const rollBuilder = new RollBuilder({
					creature: creature,
					actorName: intr.user.username,
					rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
					LL,
				});
				rollBuilder.addRoll({ rollExpression: diceExpression });
				embeds.push(rollBuilder.compileEmbed());
			}
		}

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		if (intr.replied) {
			intr.followUp({ embeds: embeds, ephemeral: isSecretRoll });
		} else {
			intr.reply({ embeds: embeds, ephemeral: isSecretRoll });
		}
	}
}
