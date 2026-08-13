import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { CharacterWithRelations, Kobold, MinionWithRelations, Modifier } from '@kobold/db';
import { KoboldError } from '@kobold/util';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { CreateForTargets } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

interface ModifierToggleTarget {
	name: string;
	sheetRecordId: number;
	modifiers: Modifier[];
}

export class ModifierToggleSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.toggle
) {
	private async resolveTarget(
		kobold: Kobold,
		activeCharacter: CharacterWithRelations,
		targetValue: string | null
	): Promise<ModifierToggleTarget | null> {
		const activeCharacterValue = `${CreateForTargets.CHARACTER_PREFIX}${activeCharacter.sheetRecordId}`;
		if (!targetValue || targetValue === activeCharacterValue) {
			return activeCharacter;
		}

		if (!targetValue.startsWith(CreateForTargets.MINION_PREFIX)) {
			return null;
		}

		const idText = targetValue.slice(CreateForTargets.MINION_PREFIX.length);
		if (!/^\d+$/.test(idText)) {
			return null;
		}

		const sheetRecordId = Number(idText);
		if (!Number.isSafeInteger(sheetRecordId)) {
			return null;
		}

		const minions = await kobold.minion.readMany({ characterId: activeCharacter.id });
		return (
			minions.find(
				(minion: MinionWithRelations) => minion.sheetRecordId === sheetRecordId
			) ?? null
		);
	}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);
		const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			return [];
		}

		if (option.name === commandOptions[commandOptionsEnum.toggleFor].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.toggleFor].name) ?? '';
			const minions = await kobold.minion.readManyLite({
				characterId: activeCharacter.id,
			});
			const choices = [
				{
					name: `🎭 ${activeCharacter.name} (active character)`,
					value: `${CreateForTargets.CHARACTER_PREFIX}${activeCharacter.sheetRecordId}`,
				},
				...minions.map(minion => ({
					name: `🐕 ${minion.name}`,
					value: `${CreateForTargets.MINION_PREFIX}${minion.sheetRecordId}`,
				})),
			];

			return choices.filter(choice =>
				choice.name.toLowerCase().includes(match.toLowerCase())
			);
		}

		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';
			const targetValue = intr.options.getString(
				commandOptions[commandOptionsEnum.toggleFor].name
			);

			// Discord presents required options before optional ones, so name autocomplete
			// normally runs before the user has selected toggle-for. Include modifiers from
			// the active character's minions in that initial list, then narrow to the chosen
			// target once toggle-for is populated.
			if (!targetValue) {
				const modifiers = (
					await kobold.modifier.readManyByUser({ userId: intr.user.id })
				).filter(modifier => modifier.sheetRecordId !== null);

				return koboldUtils.autocompleteUtils.getAssignableModifiersForActiveOrDefaultCharacter(
					intr,
					modifiers,
					activeCharacter,
					match
				);
			}

			const target = await this.resolveTarget(kobold, activeCharacter, targetValue);
			if (!target) {
				return [];
			}

			const matchedModifiers = FinderHelpers.matchAllModifiers(
				target.modifiers,
				match
			).map(modifier => ({
				name: modifier.name,
				value: modifier.name,
			}));
			return matchedModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim()
			.toLowerCase();
		const targetValue = intr.options.getString(
			commandOptions[commandOptionsEnum.toggleFor].name
		);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const target = await this.resolveTarget(kobold, activeCharacter, targetValue);
		if (!target) {
			throw new KoboldError(ModifierDefinition.strings.toggle.targetNotFound);
		}

		const modifier = FinderHelpers.getModifierByName(target.modifiers, name);

		if (!modifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, ModifierDefinition.strings.notFound);
			return;
		}

		const newIsActive = !modifier.isActive;

		await kobold.modifier.update({ id: modifier.id }, { isActive: newIsActive });

		koboldUtils.adjustedSheetService.triggerRecompute(target.sheetRecordId);

		const activeText = newIsActive
			? ModifierDefinition.strings.toggle.active
			: ModifierDefinition.strings.toggle.inactive;

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			ModifierDefinition.strings.toggle.success({
				characterName: target.name,
				modifierName: modifier.name,
				toggledTo: activeText,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
