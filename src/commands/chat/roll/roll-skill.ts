import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { Dice } from 'dice-typescript';
import { Character } from '../../../services/kobold/models/index.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import {
	findPossibleSkillFromString,
	getActiveCharacter,
	getBestNameMatch,
} from '../../../utils/character-utils.js';
import { rollDiceReturningMessage } from '../../../utils/dice-utils.js';

export class RollSkillCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'skill',
		description: `rolls a skill for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				...ChatArgs.SKILL_CHOICE_OPTION,
				required: true,
			},
			{
				...ChatArgs.ROLL_MODIFIER_OPTION,
				required: false,
			},
			{
				...ChatArgs.ROLL_NOTE_OPTION,
				required: false,
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;
		if (intr.commandName === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
			if (!match.trim()) {
				InteractionUtils.respond(intr, []);
				return;
			}
			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				InteractionUtils.respond(intr, []);
				return;
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = findPossibleSkillFromString(activeCharacter, match).map(
				skill => ({ name: skill.Name, value: skill.Name })
			);
			//return the matched skills
			InteractionUtils.respond(intr, matchedSkills);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//use the first skill that matches the text of what we were sent, or preferably a perfect match
		const matchedSkills = findPossibleSkillFromString(activeCharacter, skillChoice);
		let targetSkill = getBestNameMatch(skillChoice, matchedSkills);

		// allow the modifier to only optionally start with +/- by wrapping it with +()
		// because +(+1) is valid, but ++1 is not
		let wrappedModifierExpression = '';
		if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;
		const diceExpression = `1d20+${targetSkill.Bonus || 0}${wrappedModifierExpression}`;

		const response = rollDiceReturningMessage(diceExpression, {
			prefixText: `Rolled ${targetSkill.Name} `,
			rollNote,
		});
		await InteractionUtils.send(intr, response);
	}
}
