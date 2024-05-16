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

import { getEmoji } from '../../../constants/emoji.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecord } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from '../action/action-command-options.js';
import { InitOptions } from '../init/init-command-options.js';

export class RollActionSubCommand implements Command {
	public names = [L.en.commands.roll.action.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.action.name(),
		description: L.en.commands.roll.action.description(),
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
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name) ?? '';

			const { characterUtils } = new KoboldUtils(kobold);

			//get the active character
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.sheetRecord,
				match
			).map(action => ({
				name: action.name,
				value: action.name,
			}));
			//return the matched actions
			return matchedActions;
		}
		if (option.name === InitOptions.INIT_CHARACTER_TARGET.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_TARGET.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);

			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: any }
	): Promise<void> {
		const targetActionName = intr.options.getString(
			ActionOptions.ACTION_TARGET_OPTION.name,
			true
		);
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
		const saveRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_SAVE_OPTION.name) ?? undefined;
		const damageRollOverwrite =
			intr.options.getString(ChatArgs.ROLL_OVERWRITE_DAMAGE_OPTION.name) ?? undefined;
		const heightenLevel =
			intr.options.getInteger(ChatArgs.HEIGHTEN_LEVEL_OPTION.name) ?? undefined;
		const targetDC = intr.options.getInteger(ChatArgs.ROLL_TARGET_DC_OPTION.name) ?? undefined;
		const saveRollType = intr.options.getString(ChatArgs.ROLL_SAVE_DICE_ROLL_OPTION.name) ?? '';
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name) ?? '';

		const secretRoll =
			intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name) ??
			L.en.commandOptions.rollSecret.choices.public.value();

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { creatureUtils, gameUtils } = koboldUtils;

		const { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);

		const targetAction = creature.actions.find(
			action => action.name.toLocaleLowerCase() === targetActionName.toLocaleLowerCase()
		);

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

		if (!targetAction) {
			throw new KoboldError(`Yip! I couldn't find an action named ${targetActionName}`);
		}

		const actionRoller = new ActionRoller(
			userSettings,
			targetAction,
			creature,
			targetCreature,
			{
				heightenLevel,
				attackRollOverwrite,
				saveRollOverwrite,
				damageRollOverwrite,
			}
		);

		const builtRoll = actionRoller.buildRoll(rollNote, targetAction.description ?? '', {
			heightenLevel,
			targetDC,
			saveDiceRoll: saveRollType,
			attackModifierExpression,
			damageModifierExpression,
			title: `${getEmoji(intr, targetAction.actionCost)} ${
				creature.sheet.staticInfo.name
			} used ${targetAction.name}!`,
		});
		const embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

		const response = EmbedUtils.describeActionResult({
			embed,
			action: targetAction,
			heightenLevel,
			saveRollType,
			targetDC,
		});

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
		await EmbedUtils.dispatchEmbeds(
			intr,
			[response],
			secretRoll,
			activeCharacter.game?.gmUserId
		);
	}
}
