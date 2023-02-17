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
import { DiceUtils, RollBuilder } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';
import _ from 'lodash';
import { GameOptions } from './game-command-options.js';
import { Character } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

export class GameRollSubCommand implements Command {
	public names = [Language.LL.commands.game.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.game.roll.name(),
		description: Language.LL.commands.game.roll.description(),
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
		if (option.name === GameOptions.GAME_ROLL_TYPE.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(GameOptions.GAME_ROLL_TYPE.name);

			const activeGame = await GameUtils.getActiveGame(intr.user.id, intr.guildId);

			if (!activeGame) return [];

			const choices: Set<string> = new Set();
			if (match === '' || 'dice'.includes(match.toLocaleLowerCase())) choices.add('Dice');

			for (const character of activeGame?.characters || []) {
				// add skills
				const matchedSkills = CharacterUtils.findPossibleSkillFromString(
					character,
					match
				).map(skill => skill.Name);
				for (const skill of matchedSkills) {
					choices.add(_.capitalize(skill));
				}

				// add saves
				const matchedSaves = CharacterUtils.findPossibleSaveFromString(
					character,
					match
				).map(save => save.Name);
				for (const save of matchedSaves) {
					choices.add(_.capitalize(save));
				}
				// add abilities
				const matchedAbilities = CharacterUtils.findPossibleAbilityFromString(
					character,
					match
				).map(ability => ability.Name);
				for (const ability of matchedAbilities) {
					choices.add(_.capitalize(ability));
				}
			}
			choices.delete('');

			const results = [];
			let counter = 0;
			for (const value of choices.values()) {
				if (counter > 90) continue;
				results.push({ name: value, value: value });
				counter++;
			}
			return results;
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

		for (const character of activeGame.characters) {
			const matchingSkills = character.calculatedStats.totalSkills.filter(
				skill => skill.Name.toLocaleLowerCase() === rollType.toLocaleLowerCase()
			);
			const matchingSaves = character.calculatedStats.totalSaves.filter(
				save => save.Name.toLocaleLowerCase() === rollType.toLocaleLowerCase()
			);
			const matchingAbilities = character.calculatedStats.totalAbilityScores.filter(
				ability => ability.Name.toLocaleLowerCase() === rollType.toLocaleLowerCase()
			);

			if (matchingSkills.length) {
				const response = await DiceUtils.rollSkill({
					intr,
					activeCharacter: character,
					skillChoice: matchingSkills[0].Name,
					modifierExpression: diceExpression,
					LL,
				});
				embeds.push(response.compileEmbed());
			} else if (matchingSaves.length) {
				const targetSave = matchingSaves[0];
				const rollBuilder = new RollBuilder({
					actorName: intr.user.username,
					character,
					rollDescription: Language.LL.commands.roll.interactions.rolledDice({
						diceType: targetSave.Name,
					}),
					LL,
				});
				let targetSaveAttribute = character.attributes.find(
					attr =>
						attr.name.trim().toLocaleLowerCase() ===
						targetSave.Name.trim().toLocaleLowerCase()
				);
				let saveTags = targetSaveAttribute?.tags || [
					'save',
					targetSave.Name.toLocaleLowerCase(),
				];
				rollBuilder.addRoll({
					rollExpression: DiceUtils.buildDiceExpression(
						'd20',
						String(targetSave.Bonus),
						diceExpression
					),
					tags: saveTags,
				});
				embeds.push(rollBuilder.compileEmbed());
			} else if (matchingAbilities.length) {
				const targetAbility = matchingAbilities[0];
				const rollBuilder = new RollBuilder({
					actorName: intr.user.username,
					character,
					rollDescription: Language.LL.commands.roll.interactions.rolledDice({
						diceType: targetAbility.Name,
					}),
					LL,
				});
				let targetAbilityAttribute = character.attributes.find(
					attr =>
						attr.name.trim().toLocaleLowerCase() ===
						targetAbility.Name.trim().toLocaleLowerCase()
				);
				let abilityTags = targetAbilityAttribute?.tags || [
					'ability',
					targetAbility.Name.toLocaleLowerCase(),
				];
				rollBuilder.addRoll({
					rollExpression: DiceUtils.buildDiceExpression(
						'd20',
						String(Math.floor((Number(targetAbility.Score) - 10) / 2)),
						diceExpression
					),
					tags: abilityTags,
				});
				embeds.push(rollBuilder.compileEmbed());
			} else if (rollType.toLocaleLowerCase() === 'dice') {
				const rollBuilder = new RollBuilder({
					character: character || null,
					actorName: intr.user.username,
					rollDescription: LL.commands.roll.dice.interactions.rolledDice(),
					LL,
				});
				rollBuilder.addRoll({ rollExpression: diceExpression });
				embeds.push(rollBuilder.compileEmbed());
			}
			// otherwise, if we don't have a match, like on a lore skill that not every character has, we skip
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
