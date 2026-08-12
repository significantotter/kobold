import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import { Kobold, MinionWithRelations, SheetAdjustmentTypeEnum } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '@kobold/util';
import { SheetUtils } from '@kobold/sheet';
import { Creature } from '../../../utils/creature.js';
import { SheetStaticInfoUtils } from '../../../utils/sheet-static-info-utils.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionUpdateSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.update
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
		const statsInput = intr.options.getString(commandOptions[commandOptionsEnum.stats].name);
		const autoJoinInitiative = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.autoJoinInitiative].name
		);
		const level = intr.options.getInteger(commandOptions[commandOptionsEnum.level].name);
		const keyAbilityInput = intr.options.getString(
			commandOptions[commandOptionsEnum.keyAbility].name
		);
		const usesStamina = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.usesStamina].name
		);
		const keyAbility = SheetStaticInfoUtils.parseKeyAbility(keyAbilityInput);

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

		// If nothing to update, error
		if (
			!statsInput &&
			autoJoinInitiative === null &&
			level === null &&
			keyAbilityInput === null &&
			usesStamina === null
		) {
			throw new KoboldError(
				'Yip! You must provide at least one value to update the minion!'
			);
		}

		// Get the current sheet and apply the stat adjustments
		let sheet = SheetUtils.withStaticInfo(targetMinion.sheetRecord.sheet, {
			level: level ?? undefined,
			keyAbility,
			usesStamina: usesStamina ?? undefined,
		});
		const staticInfoChanged =
			level !== null || keyAbilityInput !== null || usesStamina !== null;

		if (statsInput) {
			const adjustments = SheetUtils.stringToSheetAdjustments(
				statsInput,
				SheetAdjustmentTypeEnum.untyped
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

			const creature = new Creature(
				{
					sheet: adjustedSheet,
					actions: targetMinion.actions ?? [],
					rollMacros: targetMinion.rollMacros ?? [],
					modifiers: targetMinion.modifiers ?? [],
					conditions: targetMinion.sheetRecord.conditions ?? [],
				},
				undefined,
				intr
			);
			creature.recover();
			sheet = creature._sheet;

			// Keep the minion's original name
			sheet = _.merge(sheet, { staticInfo: { name: targetMinion.name } });
		}

		// Build update object
		const updateData: { autoJoinInitiative?: boolean } = {};
		if (autoJoinInitiative !== null) {
			updateData.autoJoinInitiative = autoJoinInitiative;
		}

		// Update the minion metadata
		if (Object.keys(updateData).length > 0) {
			await kobold.minion.update({ id: targetMinion.id }, updateData);
		}

		// Update the sheetRecord if base sheet data was changed
		if (statsInput || staticInfoChanged) {
			sheet = SheetUtils.withStaticInfo(sheet, { name: targetMinion.name });
			await kobold.sheetRecord.update({ id: targetMinion.sheetRecordId }, { sheet });
			// Trigger adjusted_sheet recomputation
			koboldUtils.adjustedSheetService.triggerRecompute(targetMinion.sheetRecordId);
		}

		const updates: string[] = [];
		if (statsInput) {
			updates.push('stats');
		}
		if (autoJoinInitiative !== null) {
			updates.push(`auto-join-initiative: ${autoJoinInitiative}`);
		}
		if (level !== null) {
			updates.push(`level: ${level}`);
		}
		if (keyAbilityInput !== null) {
			updates.push(`key ability: ${keyAbilityInput}`);
		}
		if (usesStamina !== null) {
			updates.push(`uses stamina: ${usesStamina}`);
		}

		await InteractionUtils.send(
			intr,
			`Yip! I've updated the minion "${targetMinion.name}" (${updates.join(', ')})!`
		);
	}
}
