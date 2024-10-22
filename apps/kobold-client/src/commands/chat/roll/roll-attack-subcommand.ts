import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecord } from '@kobold/db';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from '../init/init-command-options.js';

export class RollAttackSubCommand implements Command {
	public name = L.en.commands.roll.attack.name();
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
			const matchedAttack = FinderHelpers.matchAllAttacks(
				new Creature(activeCharacter.sheetRecord, undefined, intr),
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
		const targetSheetName = intr.options.getString(
			InitOptions.INIT_CHARACTER_TARGET.name,
			true
		);
		const attackModifierExpression =
			intr.options.getString(ChatArgs.ATTACK_ROLL_MODIFIER_OPTION.name) ?? '';
		const damageModifierExpression =
			intr.options.getString(ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION.name) ?? '';
		const attackRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_ATTACK_OPTION.name) ?? undefined;
		const damageRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_DAMAGE_OPTION.name) ?? undefined;
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';
		const targetAC = intr.options.getInteger(ChatArgs.ROLL_TARGET_AC_OPTION.name);

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { gameUtils, creatureUtils } = koboldUtils;
		const { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);

		let targetSheetRecord: SheetRecord | null = null;
		let targetCreature: Creature | null = null;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			targetSheetRecord = results.targetSheetRecord;
			hideStats = results.hideStats;
			targetCreature = new Creature(targetSheetRecord, targetSheetName, intr);
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
			attackRollOverwrite: attackRollOverwrite,
			damageRollOverwrite: damageRollOverwrite,
		});

		const embed = builtRoll.compileEmbed({ forceFields: true });

		if (targetCreature && targetSheetRecord && actionRoller.shouldDisplayDamageText()) {
			// apply any effects from the action to the creature
			await creatureUtils.saveSheet(intr, {
				...targetSheetRecord,
				sheet: targetCreature._sheet,
			});

			const damageField = await EmbedUtils.getOrSendActionDamageField({
				intr,
				actionRoller,
				hideStats,
				targetNameOverwrite: targetSheetName,
			});

			embed.addFields(damageField);
		}

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeCharacter.game?.gmUserId);
	}
}
