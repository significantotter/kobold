import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { getEmoji } from '../../../constants/emoji.js';
import { Kobold, SheetRecord } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition, InitDefinition, RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;
const actionCommandOptions = ActionDefinition.options;
const actionCommandOptionsEnum = ActionDefinition.commandOptionsEnum;
const initCommandOptions = InitDefinition.options;
const initCommandOptionsEnum = InitDefinition.commandOptionsEnum;

export class RollActionSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.action
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === actionCommandOptions[actionCommandOptionsEnum.targetAction].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(
					actionCommandOptions[actionCommandOptionsEnum.targetAction].name
				) ?? '';

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
		if (option.name === initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(
					initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name
				) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);

			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: any }
	): Promise<void> {
		const targetActionName = intr.options.getString(
			actionCommandOptions[actionCommandOptionsEnum.targetAction].name,
			true
		);
		const targetSheetName = intr.options.getString(
			initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name,
			true
		);
		const attackModifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.attackRollModifier].name) ??
			'';
		const damageModifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.damageRollModifier].name) ??
			'';
		const attackRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteAttack].name) ??
			undefined;
		const saveRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteSave].name) ??
			undefined;
		const damageRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteDamage].name) ??
			undefined;
		const heightenLevel =
			intr.options.getInteger(commandOptions[commandOptionsEnum.heightenLevel].name) ??
			undefined;
		const targetDC =
			intr.options.getInteger(commandOptions[commandOptionsEnum.rollTargetDc].name) ??
			undefined;
		const saveRollType =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSaveDiceRoll].name) ?? '';
		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name) ?? '';
		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

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
