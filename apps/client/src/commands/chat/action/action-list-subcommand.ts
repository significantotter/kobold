import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Action, Kobold } from '@kobold/db';

import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseOwnedByFilter,
	OwnedByFilters,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionListSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.list
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

		let actions: Awaited<ReturnType<typeof kobold.action.readManyByUser>>;

		if (ownedByValue) {
			// Explicit filter provided — use it as-is
			const filter = parseOwnedByFilter(ownedByValue);
			actions = await kobold.action.readManyByUser({
				userId: intr.user.id,
				filter,
			});
		} else {
			// Default: active character actions + user-wide (unset) actions
			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);

			const [characterActions, userWideActions] = await Promise.all([
				activeCharacter
					? kobold.action.readManyForCharacter({
							userId: intr.user.id,
							sheetRecordId: activeCharacter.sheetRecordId,
						})
					: Promise.resolve([]),
				kobold.action.readManyUserWide({ userId: intr.user.id }),
			]);

			actions = [...characterActions, ...userWideActions];
		}

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
		for (const action of actions.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			let description = action.description || '\u200B';
			if ((action.description ?? '').length >= 1000)
				description = description.substring(0, 1000) + '...';

			// Add owner indicator
			let ownerIndicator = '';
			if (action.sheetRecordId === null) {
				ownerIndicator = '👤 ';
			} else {
				const owner = ownerMap.get(action.sheetRecordId);
				if (owner) {
					ownerIndicator = `${owner.icon} `;
				}
			}

			fields.push({
				name: `${ownerIndicator}${action.name || 'unnamed action'}`,
				value: description,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setTitle(`Your Actions`);

		if (fields.length === 0) {
			embed.setDescription('No actions found.');
		} else {
			embed.addFields(fields);
		}

		await embed.sendBatches(intr);
	}
}
