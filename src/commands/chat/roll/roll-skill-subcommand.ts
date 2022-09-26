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
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import {
	findPossibleSkillFromString,
	getActiveCharacter,
	getBestNameMatch,
} from '../../../utils/character-utils.js';
import { buildDiceExpression, RollBuilder } from '../../../utils/dice-utils.js';

export class RollSkillSubCommand implements Command {
	public names = ['skill'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'skill',
		description: `rolls a skill for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SKILL_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				await InteractionUtils.respond(intr, []);
				return;
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = findPossibleSkillFromString(activeCharacter, match).map(
				skill => ({ name: skill.Name, value: skill.Name })
			);
			//return the matched skills
			await InteractionUtils.respond(intr, matchedSkills);
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
		const skillsPlusPerception = [
			...activeCharacter.calculatedStats.totalSkills,
			{
				Name: 'Perception',
				Bonus: activeCharacter.calculatedStats.totalPerception,
			},
		] as WG.NamedBonus[];

		//use the first skill that matches the text of what we were sent, or preferably a perfect match
		let targetSkill = getBestNameMatch(skillChoice, skillsPlusPerception);

		const rollBuilder = new RollBuilder({
			actorName: intr.user.username,
			character: activeCharacter,
			rollNote,
			rollDescription: `rolled ${targetSkill.Name}`,
		});
		rollBuilder.addRoll(
			buildDiceExpression('d20', String(targetSkill.Bonus), modifierExpression)
		);
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}
