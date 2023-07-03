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
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { Creature } from '../../../utils/creature.js';
import { InitOptions } from '../init/init-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { InitiativeUtils } from '../../../utils/initiative-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';

export class RollAttackSubCommand implements Command {
	public names = [Language.LL.commands.roll.attack.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.roll.attack.name(),
		description: Language.LL.commands.roll.attack.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
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
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a attack on the character matching the autocomplete string
			const matchedAttack = CharacterUtils.findPossibleAttackFromString(
				activeCharacter,
				match
			).map(attack => ({
				name: attack.name,
				value: attack.name,
			}));
			//return the matched attacks
			return matchedAttack;
		}
		if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);

			return await AutocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const attackChoice = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name);
		const targetInitActor = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name);
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

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.noActiveCharacter(),
				isSecretRoll
			);
			return;
		}

		const creature = Creature.fromCharacter(activeCharacter);

		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActor | undefined;

		if (targetInitActor && targetInitActor !== '__NONE__') {
			targetActor = await InitiativeUtils.getInitActorByName(intr, targetInitActor);
			targetCreature = Creature.fromInitActor(targetActor);
		}

		const { builtRoll, actionRoller } = DiceUtils.rollCreatureAttack({
			creature,
			targetCreature,
			attackName: attackChoice,
			rollNote,
			attackModifierExpression,
			damageModifierExpression,
			targetAC,
			LL,
		});

		if (targetCreature) {
			// apply any effects from the action to the creature
			await targetActor.$query().patch({ sheet: targetCreature.sheet });
		}

		const embed = builtRoll.compileEmbed({ forceFields: true });

		if (notifyRoll) {
			await InteractionUtils.send(
				intr,
				Language.LL.commands.roll.interactions.secretRollNotification()
			);
		}
		await embed.sendBatches(intr, isSecretRoll);

		if (targetCreature) {
			// apply any damage effects from the action to the creature
			let promises = [targetActor.$query().patch({ sheet: targetCreature.sheet })];
			if (targetActor.characterId) {
				promises.push(
					targetActor
						.$relatedQuery<Character>('character')
						.patch({ sheet: targetCreature.sheet })
				);
			}
			await Promise.all(promises);

			let message = actionRoller.buildResultText();

			// inform the channel that damage was dealt
			await InteractionUtils.send(intr, message);
		}
	}
}
