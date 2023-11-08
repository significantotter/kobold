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

import { StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { Creature } from '../../../utils/creature.js';
import _ from 'lodash';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Kobold } from '../../../services/kobold/kobold.model.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';

export class RollSkillSubCommand implements Command {
	public names = [L.en.commands.roll.skill.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.skill.name(),
		description: L.en.commands.roll.skill.description(),
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
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name) ?? '';

			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchDataForCommand(intr, {
				activeCharacter: true,
			});

			//get the active character
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = koboldUtils.characterUtils
				.findPossibleSkillFromString(activeCharacter, match)
				.map(skill => ({ name: skill.name, value: skill.name }));
			//return the matched skills
			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name, true);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { activeGame, activeCharacter } = await koboldUtils.fetchDataForCommand(intr, {
			activeGame: true,
			activeCharacter: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = Creature.fromCharacter(activeCharacter);

		const targetRoll = StringUtils.findBestValueByKeyMatch(skillChoice, creature.skillRolls);

		const rollResult = await RollBuilder.fromSimpleCreatureRoll({
			actorName: creature.sheet.staticInfo.name,
			creature,
			attributeName: targetRoll.name,
			rollNote: rollNote ?? '',
			modifierExpression: modifierExpression ?? '',
			LL,
		});

		const embed = rollResult.compileEmbed();

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeGame?.gmUserId);
	}
}
