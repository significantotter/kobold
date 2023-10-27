import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { ModifierOptions } from './modifier-command-options.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character } from '../../../services/kobold/models/index.js';
import { compileExpression } from 'filtrex';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { Creature } from '../../../utils/creature.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { SheetUtils } from '../../../utils/sheet-utils.js';

export class ModifierUpdateSubCommand implements Command {
	public names = [L.en.commands.modifier.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.update.name(),
		description: L.en.commands.modifier.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = CharacterUtils.findPossibleModifierFromString(
				activeCharacter,
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
		LL: TranslationFunctions
	): Promise<void> {
		const modifierName = intr.options
			.getString(ModifierOptions.MODIFIER_NAME_OPTION.name, true)
			.trim();
		let fieldToChange = intr.options
			.getString(ModifierOptions.MODIFIER_SET_OPTION.name, true)
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = intr.options
			.getString(ModifierOptions.MODIFIER_SET_VALUE_OPTION.name, true)
			.trim();

		let updateValue: string | string[] | number | Character['modifiers'][0]['sheetAdjustments'];

		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		const targetModifier = activeCharacter.getModifierByName(modifierName);
		if (!targetModifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.notFound());
			return;
		}

		// validate the updates
		if (fieldToChange === 'name') {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.update.interactions.emptyNameError()
				);
				return;
				//a name can't already be a modifier
			} else if (activeCharacter.getModifierByName(newFieldValue)) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.update.interactions.nameExistsError()
				);
				return;
			} else {
				updateValue = newFieldValue;
			}
		} else if (fieldToChange === 'value') {
			if (targetModifier.modifierType === 'sheet') {
				throw new KoboldError(
					'Yip! Sheet modifiers don\'t have a "value". You probably meant to update the "sheet-values" field.'
				);
			}
			try {
				// we must be able to evaluate the modifier as a roll for this character
				DiceUtils.parseAndEvaluateDiceExpression({
					rollExpression: newFieldValue,
					creature: Creature.fromCharacter(activeCharacter),
					LL: L.en,
				});
				updateValue = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createRollModifier.interactions.doesntEvaluateError()
				);
				return;
			}
		} else if (fieldToChange === 'target-tags') {
			if (targetModifier.modifierType === 'sheet') {
				throw new KoboldError('Yip! Sheet modifiers don\'t have "target tags".');
			}
			fieldToChange = 'targetTags';
			// parse the target tags
			try {
				compileExpression(newFieldValue);
			} catch (err) {
				// the tags are in an invalid format
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.createRollModifier.interactions.invalidTags()
				);
				return;
			}
			updateValue = newFieldValue;
		} else if (['type', 'description'].includes(fieldToChange)) {
			if (!newFieldValue) updateValue = null;
			else updateValue = newFieldValue;
		} else if (fieldToChange === 'sheet-values') {
			if (targetModifier.modifierType === 'roll') {
				throw new KoboldError(
					'Yip! Roll modifiers don\'t have "sheet values". Maybe you meant to update "value"?'
				);
			}
			const creature = new Creature(activeCharacter.sheet);
			updateValue = SheetUtils.sheetModifiersFromString(newFieldValue, creature);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(
				intr,
				LL.commands.modifier.update.interactions.invalidOptionError()
			);
			return;
		}
		// just in case the update is for the name
		const nameBeforeUpdate = targetModifier.name;

		// still references the deep values in characterModifiers
		let targetIndex = _.indexOf(activeCharacter.modifiers, targetModifier);

		activeCharacter.modifiers[targetIndex][fieldToChange] = updateValue;

		await Character.query().patchAndFetchById(activeCharacter.id, {
			modifiers: activeCharacter.modifiers,
		});

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.modifier.update.interactions.successEmbed.title({
				characterName: activeCharacter.sheet.info.name,
				modifierName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
