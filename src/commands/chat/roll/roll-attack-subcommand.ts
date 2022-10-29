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
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils, RollBuilder } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class RollAttackSubCommand implements Command {
	public names = [Language.LL.commands.roll.attack.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.attack.name(),
		description: Language.LL.commands.roll.attack.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.ATTACK_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a attack on the character matching the autocomplete string
			const matchedAttack = CharacterUtils.findPossibleAttackFromString(
				activeCharacter,
				match
			).map(attack => ({
				name: attack.Name,
				value: attack.Name,
			}));
			//return the matched attacks
			return matchedAttack;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const attackChoice = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name);
		const attackModifierExpression = intr.options.getString(
			ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name
		);
		const damageModifierExpression = intr.options.getString(
			ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name
		);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.noActiveCharacter()
			);
			return;
		}

		//use the first attack that matches the text of what we were sent, or preferably a perfect match
		let targetAttack = CharacterUtils.getBestNameMatch(
			attackChoice,
			activeCharacter.calculatedStats.weapons as WG.NamedBonus[]
		);

		const rollBuilder = new RollBuilder({
			character: activeCharacter,
			rollNote,
			rollDescription:
				Language.LL.commands.roll.attack.interactions.rollEmbed.rollDescription({
					attackName: targetAttack.Name,
				}),
			LL,
		});

		//if we a to hit defined, roll the attack's to-hit
		if (targetAttack.Bonus !== undefined) {
			rollBuilder.addRoll(
				DiceUtils.buildDiceExpression(
					'd20',
					String(targetAttack.Bonus),
					attackModifierExpression
				),
				Language.LL.commands.roll.attack.interactions.rollEmbed.toHit()
			);
		}

		//if we have damage defined, roll that as well
		if (targetAttack.Damage !== undefined) {
			rollBuilder.addRoll(
				DiceUtils.buildDiceExpression(
					String(DiceUtils.parseDiceFromWgDamageField(targetAttack.Damage)),
					null,
					damageModifierExpression
				),
				Language.LL.commands.roll.attack.interactions.rollEmbed.damage()
			);
		}
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}
