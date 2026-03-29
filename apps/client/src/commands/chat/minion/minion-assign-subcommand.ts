import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, MinionWithRelations } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionAssignSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.assign
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

			// Get all user's minions, not just the active character's
			const minions = await kobold.minion.readManyByUserId({
				userId: intr.user.id,
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

		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match = intr.options.getString(
				commandOptions[commandOptionsEnum.targetCharacter].name
			);

			// Get all user's characters
			const characters = await kobold.character.readMany({
				userId: intr.user.id,
			});

			return characters
				.filter(c => c.name.toLowerCase().includes((match ?? '').toLowerCase()))
				.map(c => ({
					name: c.name,
					value: c.name,
				}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const minionName = intr.options.getString(
			commandOptions[commandOptionsEnum.minion].name,
			true
		);
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			false
		);
		const copyOption = intr.options.getBoolean(commandOptions[commandOptionsEnum.copy].name);

		// Find the minion
		const minions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});

		const matchedMinion = minions.find(m => m.name.toLowerCase() === minionName.toLowerCase());

		if (!matchedMinion) {
			throw new KoboldError(MinionDefinition.strings.notFound);
		}

		// If no target character provided, unassign the minion
		if (!targetCharacterName) {
			// Copy doesn't make sense when unassigning
			if (copyOption) {
				throw new KoboldError(
					'Yip! You cannot copy a minion without specifying a target character!'
				);
			}

			// Check if already unassigned
			if (matchedMinion.characterId === null) {
				await InteractionUtils.send(
					intr,
					MinionDefinition.strings.assign.alreadyUnassigned({
						minionName: matchedMinion.name,
					})
				);
				return;
			}

			// Unassign the minion
			await kobold.minion.update({ id: matchedMinion.id }, { characterId: null });

			await InteractionUtils.send(
				intr,
				MinionDefinition.strings.assign.unassignSuccess({
					minionName: matchedMinion.name,
				})
			);
			return;
		}

		// Find the target character
		const characters = await kobold.character.readMany({
			userId: intr.user.id,
		});

		const targetCharacter = characters.find(
			c => c.name.toLowerCase() === targetCharacterName.toLowerCase()
		);

		if (!targetCharacter) {
			throw new KoboldError(MinionDefinition.strings.assign.targetNotFound);
		}

		// Check if the target character already has a minion with this name
		const targetMinions = await kobold.minion.readMany({
			characterId: targetCharacter.id,
		});
		const existingMinion = targetMinions.find(
			m => m.name.toLowerCase() === matchedMinion.name.toLowerCase()
		);
		if (existingMinion) {
			throw new KoboldError(
				MinionDefinition.strings.assign.alreadyExists({
					minionName: matchedMinion.name,
					characterName: targetCharacter.name,
				})
			);
		}

		if (copyOption) {
			// Create a copy of the minion with all related data
			// 1. Copy the sheetRecord
			const newSheetRecord = await kobold.sheetRecord.create({
				sheet: matchedMinion.sheetRecord.sheet,
				conditions: matchedMinion.sheetRecord.conditions,
			});

			// 2. Copy all actions tied to this minion's sheetRecordId
			const actions = await kobold.action.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: matchedMinion.sheetRecordId,
			});
			for (const action of actions) {
				const { id, ...actionWithoutId } = action;
				await kobold.action.create({
					...actionWithoutId,
					sheetRecordId: newSheetRecord.id,
					userId: intr.user.id,
				});
			}

			// 3. Copy all modifiers tied to this minion's sheetRecordId
			const modifiers = await kobold.modifier.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: matchedMinion.sheetRecordId,
			});
			for (const modifier of modifiers) {
				const { id, ...modifierWithoutId } = modifier;
				await kobold.modifier.create({
					...modifierWithoutId,
					sheetRecordId: newSheetRecord.id,
					userId: intr.user.id,
				});
			}

			// 4. Copy all rollMacros tied to this minion's sheetRecordId
			const rollMacros = await kobold.rollMacro.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: matchedMinion.sheetRecordId,
			});
			for (const rollMacro of rollMacros) {
				const { id, ...rollMacroWithoutId } = rollMacro;
				await kobold.rollMacro.create({
					...rollMacroWithoutId,
					sheetRecordId: newSheetRecord.id,
					userId: intr.user.id,
				});
			}

			// 5. Create the new minion
			await kobold.minion.create({
				name: matchedMinion.name,
				userId: intr.user.id,
				characterId: targetCharacter.id,
				sheetRecordId: newSheetRecord.id,
				autoJoinInitiative: matchedMinion.autoJoinInitiative,
			});

			await InteractionUtils.send(
				intr,
				MinionDefinition.strings.assign.copied({
					minionName: matchedMinion.name,
					characterName: targetCharacter.name,
				})
			);
		} else {
			// Check if the minion is already assigned to this character
			if (matchedMinion.characterId === targetCharacter.id) {
				await InteractionUtils.send(
					intr,
					`Yip! ${matchedMinion.name} is already assigned to ${targetCharacter.name}.`
				);
				return;
			}

			// Update the minion's characterId
			await kobold.minion.update(
				{ id: matchedMinion.id },
				{ characterId: targetCharacter.id }
			);

			await InteractionUtils.send(
				intr,
				MinionDefinition.strings.assign.success({
					minionName: matchedMinion.name,
					characterName: targetCharacter.name,
				})
			);
		}
	}
}
