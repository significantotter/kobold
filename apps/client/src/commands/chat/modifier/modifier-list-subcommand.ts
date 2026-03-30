import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import { Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ModifierHelpers } from './modifier-helpers.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseOwnedByFilter,
	OwnedByFilters,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierListSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.list
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.ownedBy].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.ownedBy].name);
			return koboldUtils.autocompleteUtils.getOwnedByOptions(intr, match ?? '');
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const ownedByValue = intr.options.getString(
			commandOptions[commandOptionsEnum.ownedBy].name
		);
		const filter = parseOwnedByFilter(ownedByValue);

		// Get modifiers based on filter
		const modifiers = await kobold.modifier.readManyByUser({
			userId: intr.user.id,
			filter,
		});

		// Get character and minion names for display
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);

		// Build a map of sheetRecordId to owner name
		const ownerMap = new Map<number, { name: string; icon: string }>();
		for (const char of characters) {
			ownerMap.set(char.sheetRecordId, { name: char.name, icon: '🎭' });
		}
		for (const minion of minions) {
			ownerMap.set(minion.sheetRecordId, { name: minion.name, icon: '🐕' });
		}

		const fields = [];
		for (const modifier of modifiers.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			let value: string;
			value = ModifierHelpers.detailModifier(modifier);

			// Add owner indicator
			let ownerIndicator = '';
			if (modifier.sheetRecordId === null) {
				ownerIndicator = '👤 ';
			} else {
				const owner = ownerMap.get(modifier.sheetRecordId);
				if (owner) {
					ownerIndicator = `${owner.icon} `;
				}
			}

			fields.push({
				name: ModifierDefinition.strings.detailHeader({
					modifierName: `${ownerIndicator}${modifier.name}`,
					modifierIsActive: modifier.isActive ? ' (active)' : '',
				}),
				value,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setTitle(`Your Modifiers`);

		if (fields.length === 0) {
			embed.setDescription('No modifiers found.');
		} else {
			embed.addFields(fields);
		}

		await embed.sendBatches(intr);
	}
}
