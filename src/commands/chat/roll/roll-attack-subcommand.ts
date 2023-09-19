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

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { Creature } from '../../../utils/creature.js';
import { InitOptions } from '../init/init-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { GameUtils } from '../../../utils/game-utils.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';

export class RollAttackSubCommand implements Command {
	public names = [L.en.commands.roll.attack.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.attack.name(),
		description: L.en.commands.roll.attack.description(),
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
		if (option.name === ChatArgs.ATTACK_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name) ?? '';

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
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name) ?? '';

			return await AutocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const attackChoice = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name, true);
		const targetInitActorName = intr.options.getString(
			InitOptions.INIT_CHARACTER_TARGET.name,
			true
		);
		const attackModifierExpression =
			intr.options.getString(ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name) ?? '';
		const damageModifierExpression =
			intr.options.getString(ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name) ?? '';
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name);

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

		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActor | Character | null;

		if (
			targetInitActorName &&
			targetInitActorName.trim().toLocaleLowerCase() != '__none__' &&
			targetInitActorName.trim().toLocaleLowerCase() != '(none)'
		) {
			const { targetCharacter, targetInitActor } =
				await GameUtils.getCharacterOrInitActorTarget(intr, targetInitActorName);
			targetActor = targetInitActor ?? targetCharacter;
			if (!targetActor) {
				await InteractionUtils.send(
					intr,
					L.en.commands.roll.interactions.targetNotFound({
						targetName: targetInitActorName,
					})
				);
				return;
			}
			targetCreature = Creature.fromModelWithSheet(targetActor);
		} else {
			targetActor = null;
		}

		const { builtRoll, actionRoller } = DiceUtils.rollCreatureAttack({
			creature,
			targetCreature,
			attackName: attackChoice,
			rollNote,
			attackModifierExpression,
			damageModifierExpression,
			targetAC: targetAC ?? undefined,
			userSettings,
			LL,
		});

		if (targetCreature && targetActor) {
			// apply any effects from the action to the creature
			await targetActor.$query().patch({ sheet: targetCreature.sheet });
		}

		const embed = builtRoll.compileEmbed({ forceFields: true });

		if (targetActor && targetCreature && actionRoller.shouldDisplayDamageText()) {
			//overwrite this as Creature, because it can't be null if targetCreature is defined
			await targetActor.saveSheet(intr, (actionRoller.targetCreature as Creature).sheet);

			const damageField = await EmbedUtils.getOrSendActionDamageField({
				intr,
				actionRoller,
				hideStats: targetActor.hideStats,
				targetNameOverwrite: targetActor.name,
				LL,
			});

			embed.addFields(damageField);
		}

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeGame?.gmUserId);
	}
}
