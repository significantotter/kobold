import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierToggleSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.toggle
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
		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim()
			.toLowerCase();

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const modifier = FinderHelpers.getModifierByName(activeCharacter.sheetRecord, name);

		if (!modifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, ModifierDefinition.strings.notFound);
			return;
		}

		let targetIndex = _.indexOf(activeCharacter.sheetRecord.modifiers, modifier);

		activeCharacter.sheetRecord.modifiers[targetIndex].isActive = !modifier.isActive;

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				modifiers: activeCharacter.sheetRecord.modifiers,
			}
		);

		const activeText = modifier.isActive
			? ModifierDefinition.strings.toggle.active
			: ModifierDefinition.strings.toggle.inactive;

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			ModifierDefinition.strings.toggle.success({
				characterName: activeCharacter.name,
				modifierName: modifier.name,
				toggledTo: activeText,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
