import { DiceUtils } from '../../../utils/dice-utils.js';
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

import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { Creature } from '../../../utils/creature.js';
import _ from 'lodash';
import { SettingsUtils } from '../../../utils/settings-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';

export class RollAbilitySubCommand implements Command {
	public names = [L.en.commands.roll.ability.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.ability.name(),
		description: L.en.commands.roll.ability.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.ABILITY_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ABILITY_CHOICE_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a ability on the character matching the autocomplete string
			const matchedAbilities = CharacterUtils.findPossibleAbilityFromString(
				activeCharacter,
				match
			).map(ability => ({
				name: ability.name,
				value: ability.name,
			}));
			//return the matched abilities
			return matchedAbilities;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const abilityChoice = intr.options.getString(ChatArgs.ABILITY_CHOICE_OPTION.name, true);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name) ?? '';
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';
		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const [activeCharacter, userSettings, activeGame] = await Promise.all([
			CharacterUtils.getActiveCharacter(intr),
			SettingsUtils.getSettingsForUser(intr),
			GameUtils.getActiveGame(intr.user.id, intr.guildId ?? ''),
		]);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, L.en.commands.roll.interactions.noActiveCharacter());
			return;
		}

		const creature = Creature.fromCharacter(activeCharacter);

		const targetRoll = StringUtils.findBestValueByKeyMatch(
			abilityChoice,
			creature.abilityRolls
		);

		const rollResult = await DiceUtils.rollSimpleCreatureRoll({
			actorName: creature.sheet.info.name,
			creature,
			attributeName: targetRoll.name,
			rollNote,
			modifierExpression,
			userSettings,
			LL,
		});

		const embed = rollResult.compileEmbed();

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeGame?.gmUserId);
	}
}
