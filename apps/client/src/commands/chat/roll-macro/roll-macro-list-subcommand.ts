import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { RollMacroDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseOwnedByFilter,
	OwnedByFilters,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroListSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.list
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

		// Get roll macros based on filter
		const rollMacros = await kobold.rollMacro.readManyByUser({
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
		for (const rollMacro of rollMacros.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			// Add owner indicator
			let ownerIndicator = '';
			if (rollMacro.sheetRecordId === null) {
				ownerIndicator = '👤 ';
			} else {
				const owner = ownerMap.get(rollMacro.sheetRecordId);
				if (owner) {
					ownerIndicator = `${owner.icon} `;
				}
			}

			fields.push({
				name: `${ownerIndicator}${rollMacro.name}`,
				value: rollMacro.macro,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setTitle(`Your Roll Macros`);

		if (fields.length === 0) {
			embed.setDescription('No roll macros found.');
		} else {
			embed.addFields(fields);
		}

		await embed.sendBatches(intr);
	}
}
