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

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { ModifierOptions } from './modifier-command-options.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Character } from '../../../services/kobold/models/index.js';
import { compileExpression } from 'filtrex';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Creature } from '../../../utils/creature.js';

export class ModifierUpdateSubCommand implements Command {
	public names = [Language.LL.commands.modifier.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.update.name(),
		description: Language.LL.commands.modifier.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name);

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
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const modifierName = (
			intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? ''
		).trim();
		let fieldToChange = (intr.options.getString(ModifierOptions.MODIFIER_SET_OPTION.name) ?? '')
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = (
			intr.options.getString(ModifierOptions.MODIFIER_SET_VALUE_OPTION.name) ?? ''
		).trim();

		let updateValue: string | string[] | number;

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
			// we must be able to evaluate the modifier as a roll for this character
			const result = DiceUtils.parseAndEvaluateDiceExpression({
				rollExpression: newFieldValue,
				creature: Creature.fromCharacter(activeCharacter),
				LL: Language.LL,
			});

			if (result.error) {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.create.interactions.doesntEvaluateError()
				);
				return;
			} else updateValue = newFieldValue;
		} else if (fieldToChange === 'target-tags') {
			fieldToChange = 'targetTags';
			// parse the target tags
			try {
				compileExpression(newFieldValue);
			} catch (err) {
				// the tags are in an invalid format
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.create.interactions.invalidTags()
				);
				return;
			}
			updateValue = newFieldValue;
		} else if (['type', 'description'].includes(fieldToChange)) {
			if (!newFieldValue) updateValue = null;
			else updateValue = newFieldValue;
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
