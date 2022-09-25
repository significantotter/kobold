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
			const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
			if (!match.trim()) {
				InteractionUtils.respond(intr, []);
				return;
			}
			const existingCharacter = await Character.query().where({
				userId: intr.user.id,
				isActiveCharacter: true,
			});
			const targetCharacter = existingCharacter[0];
			const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
			const matchRegex = new RegExp(match, 'ig');
			const results = [];
			for (const skill of stats.totalSkills.concat({
				Name: 'Perception',
				Bonus: targetCharacter.calculatedStats.totalPerception,
			})) {
				if (matchRegex.test(skill.Name)) {
					results.push({ name: skill.Name, value: skill.Name });
				}
			}
			InteractionUtils.respond(intr, results);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const skillChoice = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);
		let roll;

		//check if we have an active character
		const existingCharacter = await Character.query().where({
			userId: intr.user.id,
			isActiveCharacter: true,
		});
		const targetCharacter = existingCharacter[0];

		if (!targetCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		const stats = targetCharacter.calculatedStats as WG.CharacterCalculatedStatsApiResponse;
		const match = intr.options.getString(ChatArgs.SKILL_CHOICE_OPTION.name);
		const matchRegex = new RegExp(match, 'ig');
		let targetSkill = { Name: 'unknown skill', Bonus: 0 } as WG.NamedBonus;
		for (const skill of stats.totalSkills.concat({
			Name: 'Perception',
			Bonus: targetCharacter.calculatedStats.totalPerception,
		})) {
			if (matchRegex.test(skill.Name)) {
				targetSkill = skill;
				break;
			}
		}

		let wrappedModifierExpression = '';
		if (modifierExpression) wrappedModifierExpression = `+(${modifierExpression})`;
		const diceExpression = `1d20+${targetSkill.Bonus || 0}${wrappedModifierExpression}`;

		try {
			roll = new Dice(null, null, {
				maxRollTimes: 20, // limit to 20 rolls
				maxDiceSides: 100, // limit to 100 dice faces
			}).roll(diceExpression);
			if (roll.errors?.length) {
				await InteractionUtils.send(
					intr,
					`Yip! We didn't understand the dice roll.\n` + roll.errors.join('\n')
				);
				return;
			}
			let response = `Rolled ${
				targetSkill.Name
			} ${diceExpression}\n${roll.renderedExpression.toString()} = ${roll.total}`;
			if (rollNote) response += `\n${rollNote}`;

			//send a message about the total
			await InteractionUtils.send(intr, response);
		} catch (err) {
			await InteractionUtils.send(
				intr,
				`Yip! We didn't understand the dice roll "${diceExpression}".`
			);
			return;
		}
	}
}
