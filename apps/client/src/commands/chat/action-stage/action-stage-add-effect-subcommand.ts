import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import {
	ActionEffectTriggerEnum,
	Condition,
	Kobold,
	Roll,
	RollTypeEnum,
	SheetAdjustment,
	SheetAdjustmentTypeEnum,
	isSheetAdjustmentTypeEnum,
} from '@kobold/db';
import { KoboldError } from '@kobold/util';

import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { ActionStageDefinition, ConditionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { Creature } from '../../../utils/creature.js';
import { SheetUtils } from '@kobold/sheet';

const commandOptions = ActionStageDefinition.options;
const commandOptionsEnum = ActionStageDefinition.commandOptionsEnum;

export class ActionStageAddEffectSubCommand extends BaseCommandClass(
	ActionStageDefinition,
	ActionStageDefinition.subCommandEnum.addEffect
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.actionTarget].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.actionTarget].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetAction = intr.options.getString(
			commandOptions[commandOptionsEnum.actionTarget].name,
			true
		);
		const rollName = intr.options.getString(
			commandOptions[commandOptionsEnum.rollName].name,
			true
		);
		const trigger = intr.options.getString(
			commandOptions[commandOptionsEnum.effectTrigger].name,
			true
		) as ActionEffectTriggerEnum;
		const conditionName = intr.options
			.getString(commandOptions[commandOptionsEnum.effectConditionName].name, true)
			.trim()
			.toLowerCase();
		const conditionType = (
			intr.options.getString(commandOptions[commandOptionsEnum.effectConditionType].name) ??
			SheetAdjustmentTypeEnum.untyped
		)
			.trim()
			.toLowerCase();
		const conditionSeverity =
			intr.options.getString(commandOptions[commandOptionsEnum.effectConditionSeverity].name) ??
			null;
		const rollAdjustment = intr.options.getString(
			commandOptions[commandOptionsEnum.effectConditionRollAdjustment].name
		);
		const rollTargetTagsUnparsed = intr.options.getString(
			commandOptions[commandOptionsEnum.effectConditionTargetTags].name
		);
		const rollTargetTags = rollTargetTagsUnparsed ? rollTargetTagsUnparsed.trim() : null;
		const description = intr.options.getString(
			commandOptions[commandOptionsEnum.effectConditionDescription].name
		);
		const note = intr.options.getString(
			commandOptions[commandOptionsEnum.effectConditionInitiativeNote].name
		);
		const parsedNote = InputParseUtils.parseAsNullableString(note, {
			inputName: 'condition-initiative-note',
			maxLength: InputParseUtils.INITIATIVE_NOTE_MAX_LENGTH,
		});
		const conditionSheetValues = intr.options.getString(
			commandOptions[commandOptionsEnum.effectConditionSheetValues].name
		);

		if (!Object.values(ActionEffectTriggerEnum).includes(trigger)) {
			throw new KoboldError(`Yip! ${trigger} is not a valid effect trigger.`);
		}
		if (!isSheetAdjustmentTypeEnum(conditionType)) {
			throw new KoboldError(
				`Yip! ${conditionType} is not a valid type! Please use one of the suggested options.`
			);
		}
		if (rollTargetTags && !rollAdjustment) {
			await InteractionUtils.send(
				intr,
				ActionStageDefinition.strings.addEffect.requireRollAdjustment
			);
			return;
		}
		if (rollAdjustment && !rollTargetTags) {
			await InteractionUtils.send(
				intr,
				ActionStageDefinition.strings.addEffect.requireTargetTags
			);
			return;
		}
		if (!rollAdjustment && !conditionSheetValues && !parsedNote) {
			await InteractionUtils.send(intr, ActionStageDefinition.strings.addEffect.requireEffect);
			return;
		}

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		if (rollAdjustment && rollTargetTags) {
			if (!InputParseUtils.isValidRollTargetTags(rollTargetTags)) {
				throw new KoboldError(ConditionDefinition.strings.invalidTags);
			}
			if (
				!InputParseUtils.isValidDiceExpression(
					rollAdjustment,
					Creature.fromSheetRecord(activeCharacter, undefined, intr)
				)
			) {
				throw new KoboldError(ConditionDefinition.strings.doesntEvaluateError);
			}
		}

		let parsedSheetAdjustments: SheetAdjustment[] = [];
		if (conditionSheetValues) {
			parsedSheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				conditionSheetValues,
				conditionType,
				activeCharacter.sheetRecord.sheet
			);
		}

		const matchedActions = FinderHelpers.matchAllActions(activeCharacter.actions, targetAction);
		if (!matchedActions || !matchedActions.length) {
			await InteractionUtils.send(intr, ActionStageDefinition.strings.notFound);
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(intr, ActionStageDefinition.strings.rollAlreadyExists);
			return;
		}

		const condition: Condition = {
			name: InputParseUtils.parseAsString(conditionName, {
				inputName: 'condition-name',
				minLength: 3,
				maxLength: 20,
			}),
			isActive: true,
			description: InputParseUtils.parseAsNullableString(description, {
				inputName: 'condition-description',
				maxLength: 300,
			}),
			type: conditionType,
			severity: InputParseUtils.parseAsNullableNumber(conditionSeverity),
			sheetAdjustments: parsedSheetAdjustments,
			rollTargetTags,
			rollAdjustment,
			note: parsedNote,
		};

		SheetUtils.adjustSheetWithModifiers(activeCharacter.sheetRecord.sheet, [condition]);

		const newRoll: Roll = {
			name: rollName,
			type: RollTypeEnum.effect,
			trigger,
			condition,
			allowRollModifiers: false,
		};
		const updatedRolls: Roll[] = [...action.rolls, newRoll];

		await kobold.action.update({ id: action.id }, { rolls: updatedRolls });

		await InteractionUtils.send(
			intr,
			ActionStageDefinition.strings.rollAddSuccess({
				actionName: action.name,
				rollName,
				rollType: RollTypeEnum.effect,
			})
		);
	}
}
