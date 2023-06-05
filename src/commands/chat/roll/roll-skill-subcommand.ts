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
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { Creature } from '../../../utils/creature.js';
import _ from 'lodash';

export class RollSkillSubCommand implements Command {
	public names = [Language.LL.commands.roll.skill.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.skill.name(),
		description: Language.LL.commands.roll.skill.description(),
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
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = CharacterUtils.findPossibleSkillFromString(
				activeCharacter,
				match
			).map(skill => ({ name: skill.name, value: skill.name }));
			//return the matched skills
			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const secretRoll = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secret.value() ||
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();
		const notifyRoll =
			secretRoll === Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value();

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.noActiveCharacter(),
				isSecretRoll
			);
			return;
		}

		const creature = Creature.fromCharacter(activeCharacter);

		const targetRoll = StringUtils.findBestValueByKeyMatch(skillChoice, creature.skillRolls);

		const rollResult = await DiceUtils.rollSimpleCreatureRoll({
			actorName: creature.sheet.info.name,
			creature,
			attributeName: targetRoll.name,
			rollNote,
			modifierExpression,
			LL,
		});

		const embed = rollResult.compileEmbed();

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		await InteractionUtils.send(intr, embed, isSecretRoll);
	}
}
