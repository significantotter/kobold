import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import _ from 'lodash';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { StringUtils } from '@kobold/base-utils';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierSetSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = FinderHelpers.matchAllModifiers(
				activeCharacter.sheetRecord,
				match
			).map(modifier => ({
				name: modifier.name,
				value: modifier.name,
			}));
			//return the matched saves
			return matchedModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const modifierName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		let fieldToChange = intr.options
			.getString(commandOptions[commandOptionsEnum.setOption].name, true)
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = intr.options
			.getString(commandOptions[commandOptionsEnum.setValue].name, true)
			.trim();

		//check if we have an active character
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const targetModifier = FinderHelpers.getModifierByName(
			activeCharacter.sheetRecord,
			modifierName
		);
		if (!targetModifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, ModifierDefinition.strings.notFound);
			return;
		}

		const setOpts = ModifierDefinition.optionChoices.setOption;
		if (fieldToChange === setOpts.name) {
			if (FinderHelpers.getModifierByName(activeCharacter.sheetRecord, newFieldValue)) {
				throw new KoboldError(ModifierDefinition.strings.set.nameExistsError);
			} else {
				targetModifier.name = InputParseUtils.parseAsString(newFieldValue, {
					inputName: fieldToChange,
					minLength: 3,
					maxLength: 20,
				});
			}
		} else if (fieldToChange === setOpts.rollAdjustment) {
			try {
				// we must be able to evaluate the modifier as a roll for this character
				InputParseUtils.isValidDiceExpression(
					newFieldValue,
					new Creature(activeCharacter.sheetRecord, undefined, intr)
				);
				targetModifier.rollAdjustment = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					ModifierDefinition.strings.createModifier.doesntEvaluateError
				);
				return;
			}
		} else if (fieldToChange === setOpts.rollTargetTags) {
			fieldToChange = 'rollTargetTags';
			// parse the target tags
			if (!InputParseUtils.isValidRollTargetTags(newFieldValue)) {
				// the tags are in an invalid format
				throw new KoboldError(ModifierDefinition.strings.createModifier.invalidTags);
			}
			targetModifier.rollTargetTags = newFieldValue;
		} else if (fieldToChange === 'type') {
			const newType = newFieldValue.trim().toLowerCase();
			if (!newType) targetModifier.type = SheetAdjustmentTypeEnum.untyped;
			else if (newType in SheetAdjustmentTypeEnum) {
				targetModifier.type = newType as SheetAdjustmentTypeEnum;
			} else {
				throw new KoboldError(
					`Yip! The type must be one of ${StringUtils.stringsToCommaPhrase(
						Object.values(SheetAdjustmentTypeEnum)
					)}.`
				);
			}
		} else if (fieldToChange === 'description') {
			targetModifier.description = InputParseUtils.parseAsNullableString(newFieldValue, {
				inputName: fieldToChange,
				maxLength: 300,
			});
			if (!newFieldValue) targetModifier.description = null;
			else targetModifier.description = newFieldValue;
		} else if (fieldToChange === 'initiative-note') {
			if (!newFieldValue) targetModifier.note = null;
			else
				targetModifier.note = InputParseUtils.parseAsNullableString(newFieldValue, {
					inputName: fieldToChange,
					maxLength: 40,
				});
		} else if (fieldToChange === 'severity') {
			targetModifier.severity = InputParseUtils.parseAsNullableNumber(newFieldValue);
		} else if (fieldToChange === 'sheet-values') {
			targetModifier.sheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				newFieldValue,
				targetModifier.type
			);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(intr, ModifierDefinition.strings.set.invalidOptionError);
			return;
		}
		// just in case the update is for the name
		const nameBeforeUpdate = targetModifier.name;

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				modifiers: activeCharacter.sheetRecord.modifiers,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			ModifierDefinition.strings.set.successEmbed.title({
				characterName: activeCharacter.name,
				modifierName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
