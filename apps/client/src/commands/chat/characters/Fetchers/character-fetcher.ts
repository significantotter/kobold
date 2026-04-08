import {
	CommandInteraction,
	CacheType,
	ComponentType,
	ButtonStyle,
	MessageFlags,
} from 'discord.js';
import {
	NewSheetRecord,
	CharacterBasic,
	CharacterWithRelations,
	NewAction,
	NewModifier,
	NewRollMacro,
	ImportSourceEnum,
} from '@kobold/db';
import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { CollectorUtils } from '../../../../utils/collector-utils.js';
import { Creature } from '../../../../utils/creature.js';
import { InteractionUtils } from '../../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../../utils/kobold-service-utils/kobold-utils.js';
import { CharacterDefinition as CharacterCommand } from '@kobold/documentation';

/**
 * Data returned from converting source data into sheet records and related entities.
 * Actions, modifiers, and rollMacros are now separate entities and need to be created separately.
 * userId is added at creation time from the CharacterFetcher's userId property.
 */
export type SheetConversionResult = {
	sheetRecord: NewSheetRecord;
	actions: Omit<NewAction, 'sheetRecordId' | 'userId'>[];
	modifiers: Omit<NewModifier, 'sheetRecordId' | 'userId'>[];
	rollMacros: Omit<NewRollMacro, 'sheetRecordId' | 'userId'>[];
};

export abstract class CharacterFetcher<SourceData, FetchArgs> {
	public abstract importSource: ImportSourceEnum;
	constructor(
		public intr: CommandInteraction<CacheType>,
		public kobold: Kobold,
		public userId: string
	) {}
	public abstract fetchSourceData(args: FetchArgs): Promise<SourceData>;
	public fetchDuplicateCharacter(
		args: FetchArgs,
		conversionResult: SheetConversionResult
	): Promise<CharacterBasic | null> {
		return this.kobold.character.readLite({
			exactName: conversionResult.sheetRecord.sheet.staticInfo.name,
			userId: this.userId,
		});
	}
	public abstract convertSheetRecord(
		sourceData: SourceData,
		activeCharacter?: CharacterWithRelations
	): SheetConversionResult;
	public abstract getCharId(args: FetchArgs): number;

	public async create(args: FetchArgs): Promise<{ id: number; name: string }> {
		const sourceData = await this.fetchSourceData(args);
		const conversionResult = this.convertSheetRecord(sourceData);
		const existingCharacter = await this.fetchDuplicateCharacter(args, conversionResult);
		if (existingCharacter) {
			throw new KoboldError(
				`Yip! You already have a character with the name "${existingCharacter.name}"!`
			);
		}

		const { characterId, characterName, sheetRecordId } = await this.kobold.transaction(
			async trx => {
				const createdSheetRecord = await trx.sheetRecord.create(
					conversionResult.sheetRecord
				);

				for (const action of conversionResult.actions) {
					await trx.action.create({
						...action,
						sheetRecordId: createdSheetRecord.id,
						userId: this.userId,
					});
				}
				for (const modifier of conversionResult.modifiers) {
					await trx.modifier.create({
						...modifier,
						sheetRecordId: createdSheetRecord.id,
						userId: this.userId,
					});
				}
				for (const rollMacro of conversionResult.rollMacros) {
					await trx.rollMacro.create({
						...rollMacro,
						sheetRecordId: createdSheetRecord.id,
						userId: this.userId,
					});
				}

				const characterName = createdSheetRecord.sheet.staticInfo.name;
				const { id: characterId } = await trx.character.createReturningId({
					name: characterName,
					userId: this.userId,
					sheetRecordId: createdSheetRecord.id,
					importSource: this.importSource,
					charId: this.getCharId(args),
				});
				await trx.character.setIsActive({ id: characterId, userId: this.userId });
				return { characterId, characterName, sheetRecordId: createdSheetRecord.id };
			}
		);

		// Trigger adjusted_sheet recomputation after transaction commits
		const koboldUtils = new KoboldUtils(this.kobold);
		koboldUtils.adjustedSheetService.triggerRecompute(sheetRecordId);

		return { id: characterId, name: characterName };
	}
	public async confirmUpdateName(oldName: string, newName: string) {
		// confirm the update
		const response = await this.intr.followUp({
			content:
				`**WARNING:** The character name on the target sheet ${newName} does not ` +
				`match your active character's name ${oldName}. If this sheet is not the one you want to update, ` +
				`please re-export the correct character and try again.` +
				(this.importSource === ImportSourceEnum.pathbuilder
					? '\n\n**NOTE:** If you are using Pathbuilder, you must re-export your character and use the new json id to ' +
						'update your character sheet with new changes. Otherwise, I will just reload the data from the last ' +
						'time you exported ANY character.'
					: ''),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: 'UPDATE',
							customId: 'update',
							style: ButtonStyle.Danger,
						},
						{
							type: ComponentType.Button,
							label: 'CANCEL',
							customId: 'cancel',
							style: ButtonStyle.Primary,
						},
					],
				},
			],
			flags: [MessageFlags.Ephemeral],
		});
		const prompt = response;
		let timedOut = false;
		const result = await CollectorUtils.collectByButton(
			prompt,
			async buttonInteraction => {
				if (buttonInteraction.user.id !== this.intr.user.id) {
					return;
				}
				switch (buttonInteraction.customId) {
					case 'update':
						return { intr: buttonInteraction, value: 'update' };
					default:
						return { intr: buttonInteraction, value: 'cancel' };
				}
			},
			{
				time: 50000,
				reset: true,
				target: this.intr.user,
				stopFilter: message => message.content.toLowerCase() === 'stop',
				onExpire: async () => {
					timedOut = true;
					await InteractionUtils.editReply(this.intr, {
						content: CharacterCommand.strings.remove.confirmation.expired,
						components: [],
					});
				},
			}
		);
		if (result) {
			// Acknowledge the button interaction to prevent "This interaction failed"
			await InteractionUtils.deferUpdate(result.intr);
		}
		if (result && result.value !== 'update') {
			await InteractionUtils.editReply(this.intr, {
				content: CharacterCommand.strings.shared.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			// cancel
			throw new KoboldError(
				CharacterCommand.strings.update.canceled({
					characterName: oldName,
				})
			);
		} else {
			await InteractionUtils.editReply(this.intr, {
				content: CharacterCommand.strings.shared.choiceRegistered({
					choice: 'Update',
				}),
				components: [],
			});
		}
	}
	public async update(args: FetchArgs): Promise<{ name: string }> {
		const koboldUtils: KoboldUtils = new KoboldUtils(this.kobold);
		const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(this.intr);
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const sourceData = await this.fetchSourceData(args);
		const conversionResult = this.convertSheetRecord(sourceData, activeCharacter);

		if (activeCharacter.name !== conversionResult.sheetRecord.sheet.staticInfo.name) {
			// throws an error if they don't confirm
			await this.confirmUpdateName(
				activeCharacter.name,
				conversionResult.sheetRecord.sheet.staticInfo.name
			);
		}

		conversionResult.sheetRecord.sheet = Creature.preserveSheetTrackerValues(
			conversionResult.sheetRecord.sheet,
			activeCharacter.sheetRecord.sheet
		);

		const { updatedName, sheetRecordId } = await this.kobold.transaction(async trx => {
			const updatedSheetRecord = await trx.sheetRecord.update(
				{ id: activeCharacter.sheetRecordId },
				conversionResult.sheetRecord
			);

			// Delete existing related entities and recreate them
			// This handles updates where actions/modifiers/rollMacros may have changed
			await trx.action.deleteBySheetRecordId({ sheetRecordId: updatedSheetRecord.id });
			await trx.modifier.deleteBySheetRecordId({ sheetRecordId: updatedSheetRecord.id });
			await trx.rollMacro.deleteBySheetRecordId({
				sheetRecordId: updatedSheetRecord.id,
			});

			for (const action of conversionResult.actions) {
				await trx.action.create({
					...action,
					sheetRecordId: updatedSheetRecord.id,
					userId: this.userId,
				});
			}
			for (const modifier of conversionResult.modifiers) {
				await trx.modifier.create({
					...modifier,
					sheetRecordId: updatedSheetRecord.id,
					userId: this.userId,
				});
			}
			for (const rollMacro of conversionResult.rollMacros) {
				await trx.rollMacro.create({
					...rollMacro,
					sheetRecordId: updatedSheetRecord.id,
					userId: this.userId,
				});
			}

			const newName = updatedSheetRecord.sheet.staticInfo.name;
			await trx.character.updateFields(
				{ id: activeCharacter.id },
				{ name: newName, charId: this.getCharId(args) }
			);
			return { updatedName: newName, sheetRecordId: updatedSheetRecord.id };
		});

		// Trigger adjusted_sheet recomputation after transaction commits
		koboldUtils.adjustedSheetService.triggerRecompute(sheetRecordId);

		return { name: updatedName };
	}
}
