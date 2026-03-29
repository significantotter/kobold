import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, MinionWithRelations, Sheet, getDefaultSheet } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

/**
 * Converts a sheet to a string of adjustments that can be re-imported.
 * Format: "property=value; property=value"
 */
function sheetToAdjustmentString(sheet: Sheet): string {
	const adjustments: string[] = [];
	const defaultSheet = getDefaultSheet();

	// Level
	if (
		sheet.staticInfo.level !== null &&
		sheet.staticInfo.level !== defaultSheet.staticInfo.level
	) {
		adjustments.push(`level=${sheet.staticInfo.level}`);
	}

	// Integer properties (ac, abilities, speeds, proficiencies)
	for (const [key, value] of Object.entries(sheet.intProperties)) {
		const defaultValue =
			defaultSheet.intProperties[key as keyof typeof defaultSheet.intProperties];
		if (value !== null && value !== defaultValue) {
			adjustments.push(`${key}=${value}`);
		}
	}

	// Base counters (hp, tempHp, focusPoints, heroPoints, stamina, resolve)
	for (const [key, counter] of Object.entries(sheet.baseCounters)) {
		const defaultCounter =
			defaultSheet.baseCounters[key as keyof typeof defaultSheet.baseCounters];
		if (counter.max !== null && counter.max !== defaultCounter.max) {
			adjustments.push(`${key}=${counter.max}`);
		}
	}

	// Stats (perception, saves, skills, casting)
	for (const [key, stat] of Object.entries(sheet.stats)) {
		const defaultStat = defaultSheet.stats[key as keyof typeof defaultSheet.stats];
		if (stat.bonus !== null && stat.bonus !== defaultStat.bonus) {
			const bonus = stat.bonus >= 0 ? `+${stat.bonus}` : `${stat.bonus}`;
			adjustments.push(`${key}=${bonus}`);
		}
	}

	// Additional skills
	for (const skill of sheet.additionalSkills) {
		if (skill.bonus !== null) {
			const bonus = skill.bonus >= 0 ? `+${skill.bonus}` : `${skill.bonus}`;
			adjustments.push(`${skill.name}=${bonus}`);
		}
	}

	return adjustments.join('; ');
}

export class MinionSheetSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.sheet
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.minion].name) ?? '';
			return await koboldUtils.autocompleteUtils.getActiveCharacterMinionsWithUnassigned(
				intr,
				match
			);
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
		const exportFormat =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.exportFormat].name) ?? false;

		// Find the minion (active character's minions + unassigned)
		const allMinions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});
		const minions = allMinions.filter(
			(m: MinionWithRelations) =>
				m.characterId === activeCharacter.id || m.characterId === null
		);
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name} or unassigned!`
			);
		}

		// If export format is requested, return the sheet as an adjustment string
		if (exportFormat) {
			const adjustmentString = sheetToAdjustmentString(targetMinion.sheetRecord.sheet);
			const response =
				adjustmentString.length > 0
					? `**${targetMinion.name}** stats:\n\`\`\`\n${adjustmentString}\n\`\`\``
					: `Yip! ${targetMinion.name} has no stats set.`;
			await InteractionUtils.send(intr, response);
			return;
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

		const embed = creature.compileEmbed('Sheet', 'full_sheet');
		await embed.sendBatches(intr);
	}
}
