import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import { Kobold, MinionWithRelations, SheetBaseCounterKeys } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionSetSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.minion].name);
			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions = await kobold.minion.readMany({
				characterId: activeCharacter.id,
			});

			return minions
				.filter((m: MinionWithRelations) =>
					m.name.toLowerCase().includes((match ?? '').toLowerCase())
				)
				.map((m: MinionWithRelations) => ({
					name: m.name,
					value: m.name,
				}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.minion].name, true)
			.trim();
		const option = _.camelCase(
			intr.options.getString(commandOptions[commandOptionsEnum.attribute].name, true)
		) as SheetBaseCounterKeys;
		const value = intr.options
			.getString(commandOptions[commandOptionsEnum.value].name, true)
			.trim();

		// Find the minion
		const minions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name}!`
			);
		}

		// Create a Creature from the minion's data
		const creature = new Creature(
			{
				sheet: targetMinion.sheetRecord.sheet,
				actions: targetMinion.actions ?? [],
				rollMacros: targetMinion.rollMacros ?? [],
				modifiers: targetMinion.modifiers ?? [],
				conditions: targetMinion.sheetRecord.conditions ?? [],
			},
			targetMinion.name,
			intr
		);

		// Update the gameplay stat
		const { initialValue, updatedValue } = creature.updateValue(option, value);

		if (initialValue == null || updatedValue == null) {
			throw new KoboldError(
				`Yip! Something went wrong! I couldn't update ${targetMinion.name}'s ${option} to ${value}.`
			);
		}

		// Keep the minion's original name
		const sheet = _.merge(creature._sheet, { staticInfo: { name: targetMinion.name } });

		// Update the sheetRecord
		await kobold.sheetRecord.update({ id: targetMinion.sheetRecordId }, { sheet });

		// Build a user-friendly response
		let message = `Yip! I updated ${targetMinion.name}'s ${option} from ${initialValue} to ${updatedValue}.`;
		if (option === 'hp' && updatedValue == 0) {
			message += " They're down!";
		}

		await InteractionUtils.send(intr, message);
	}
}
