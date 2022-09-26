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
	findPossibleAttackFromString,
	getActiveCharacter,
	getBestNameMatch,
} from '../../../utils/character-utils.js';
import {
	buildDiceExpression,
	parseDiceFromWgDamageField,
	RollBuilder,
} from '../../../utils/dice-utils.js';

export class RollAttackCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'attack',
		description: `rolls an attack for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				...ChatArgs.ATTACK_CHOICE_OPTION,
				required: true,
			},
			{
				...ChatArgs.ATTACK_ROLL_MODIFIER_OPTION,
				required: false,
			},
			{
				...ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION,
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
		if (intr.commandName === ChatArgs.ATTACK_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				InteractionUtils.respond(intr, []);
				return;
			}
			//find a attack on the character matching the autocomplete string
			const matchedAttack = findPossibleAttackFromString(activeCharacter, match).map(
				attack => ({
					name: attack.Name,
					value: attack.Name,
				})
			);
			//return the matched attacks
			InteractionUtils.respond(intr, matchedAttack);
		}
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const attackChoice = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name);
		const attackModifierExpression = intr.options.getString(
			ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name
		);
		const damageModifierExpression = intr.options.getString(
			ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name
		);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//use the first attack that matches the text of what we were sent, or preferably a perfect match
		let targetAttack = getBestNameMatch(
			attackChoice,
			activeCharacter.calculatedStats.weapons as WG.NamedBonus[]
		);

		const rollBuilder = new RollBuilder({
			character: activeCharacter,
			rollNote,
			rollDescription: `attacking with their ${targetAttack.Name}!`,
		});

		//if we a to hit defined, roll the attack's to-hit
		if (targetAttack.Bonus !== undefined) {
			rollBuilder.addRoll(
				buildDiceExpression('d20', String(targetAttack.Bonus), attackModifierExpression),
				'To Hit'
			);
		}

		//if we have damage defined, roll that as well
		if (targetAttack.Damage !== undefined) {
			rollBuilder.addRoll(
				buildDiceExpression(
					String(parseDiceFromWgDamageField(targetAttack.Damage)),
					null,
					damageModifierExpression
				),
				'Damage'
			);
		}
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}
