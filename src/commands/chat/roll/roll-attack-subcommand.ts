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
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { Creature } from '../../../utils/creature.js';
import { InitOptions } from '../init/init-command-options.js';
import { Character, InitiativeActor } from '../../../services/kobold/index.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Kobold } from '../../../services/kobold/kobold.model.js';

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
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.ATTACK_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.ATTACK_CHOICE_OPTION.name) ?? '';

			//get the active character
			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchDataForCommand(intr, {
				activeCharacter: true,
			});
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a attack on the character matching the autocomplete string
			const matchedAttack = koboldUtils.characterUtils
				.findPossibleAttackFromString(activeCharacter, match)
				.map(attack => ({
					name: attack.name,
					value: attack.name,
				}));
			//return the matched attacks
			return matchedAttack;
		}
		if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name) ?? '';
			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);

			return await koboldUtils.autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
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

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { gameUtils, creatureUtils } = koboldUtils;
		const { activeCharacter, userSettings, activeGame } = await koboldUtils.fetchDataForCommand(
			intr,
			{
				activeGame: true,
				activeCharacter: true,
				userSettings: true,
			}
		);
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = Creature.fromCharacter(activeCharacter);

		let targetCreature: Creature | undefined;
		let targetActor: InitiativeActor | Character | null;

		if (
			targetInitActorName &&
			targetInitActorName.trim().toLocaleLowerCase() != '__none__' &&
			targetInitActorName.trim().toLocaleLowerCase() != '(none)'
		) {
			const { targetCharacter, targetInitActor } =
				await gameUtils.getCharacterOrInitActorTarget(intr, targetInitActorName);
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

		const { builtRoll, actionRoller } = ActionRoller.fromCreatureAttack({
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
			await kobold.initiativeActor.update(
				{ id: targetActor.id },
				{ sheet: targetCreature.sheet }
			);
		}

		const embed = builtRoll.compileEmbed({ forceFields: true });

		if (targetActor && targetCreature && actionRoller.shouldDisplayDamageText()) {
			//overwrite this as Creature, because it can't be null if targetCreature is defined
			await creatureUtils.saveCharacterSheet(intr, actionRoller.targetCreature!.sheet);

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
