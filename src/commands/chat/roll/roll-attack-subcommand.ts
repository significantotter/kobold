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
import { Character } from '../../../services/kobold/models/index.js';
import { ActionRoller } from '../../../utils/action-roller.js';

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
	public deferType = CommandDeferType.NONE;
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
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
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
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name);

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

		//use the first attack that matches the text of what we were sent, or preferably a perfect match
		let targetAttack = CharacterUtils.getBestNameMatch(
			attackChoice,
			activeCharacter.calculatedStats.weapons as WG.NamedBonus[]
		);

		// build a little action from the attack!

		const action: Character['actions'][0] = {
			name: targetAttack.Name,
			type: 'attack',
			actionCost: 'oneAction',
			tags: [],
			rolls: [
				{
					type: 'attack',
					name: 'To Hit',
					roll: DiceUtils.buildDiceExpression(
						'd20',
						String(targetAttack.Bonus),
						attackModifierExpression
					),
					targetDC: 'AC',
					allowRollModifiers: true,
				},
				{
					type: 'damage',
					name: 'Damage',
					roll: DiceUtils.buildDiceExpression(
						String(DiceUtils.parseDiceFromWgDamageField(targetAttack.Damage)),
						null,
						damageModifierExpression
					),
					allowRollModifiers: true,
				},
			],
		};

		const actionResult = new ActionRoller(action, activeCharacter)
			.buildRoll(
				rollNote,
				Language.LL.commands.roll.attack.interactions.rollEmbed.rollDescription({
					attackName: targetAttack.Name,
				}),
				{
					targetDC: targetAC,
					attackModifierExpression: attackModifierExpression,
					damageModifierExpression: damageModifierExpression,
				}
			)
			.compileEmbed({
				forceFields: true,
			});

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		actionResult.sendBatches(intr, isSecretRoll);
	}
}
