import { CommandInteraction, CacheType, ComponentType, ButtonStyle } from 'discord.js';
import {
	NewSheetRecord,
	Character,
	CharacterWithRelations,
} from '../../../../services/kobold/index.js';
import { Kobold } from '../../../../services/kobold/kobold.model.js';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { CollectorUtils } from '../../../../utils/collector-utils.js';
import { Creature } from '../../../../utils/creature.js';
import { InteractionUtils } from '../../../../utils/interaction-utils.js';
import { KoboldUtils } from '../../../../utils/kobold-service-utils/kobold-utils.js';
import L from '../../../../i18n/i18n-node.js';

export abstract class CharacterFetcher<SourceData, FetchArgs> {
	public abstract importSource: string;
	constructor(
		public intr: CommandInteraction<CacheType>,
		public kobold: Kobold,
		public userId: string
	) {}
	public abstract fetchSourceData(args: FetchArgs): Promise<SourceData>;
	public fetchDuplicateCharacter(
		args: FetchArgs,
		newSheetRecord: NewSheetRecord
	): Promise<Character | null> {
		return this.kobold.character.read({
			name: newSheetRecord.sheet.staticInfo.name,
			userId: this.userId,
		});
	}
	public abstract convertSheetRecord(
		sourceData: SourceData,
		activeCharacter?: CharacterWithRelations
	): NewSheetRecord;
	public abstract getCharId(args: FetchArgs): number;

	public async create(args: FetchArgs): Promise<Character> {
		const sourceData = await this.fetchSourceData(args);
		const sheetRecord = this.convertSheetRecord(sourceData);
		const existingCharacter = await this.fetchDuplicateCharacter(args, sheetRecord);
		if (existingCharacter) {
			throw new KoboldError(
				`Yip! You already have a character with the name "${existingCharacter.name}"!`
			);
		}
		const createdSheetRecord = await this.kobold.sheetRecord.create(sheetRecord);
		const createdCharacter = await this.kobold.character.create({
			name: createdSheetRecord.sheet.staticInfo.name,
			userId: this.userId,
			sheetRecordId: createdSheetRecord.id,
			importSource: this.importSource,
			charId: this.getCharId(args),
		});
		await this.kobold.character.setIsActive({ id: createdCharacter.id, userId: this.userId });
		return createdCharacter;
	}
	public async confirmUpdateName(oldName: string, newName: string) {
		// confirm the update
		const prompt = await this.intr.followUp({
			content:
				`**WARNING:** The character name on the target sheet ${newName} does not ` +
				`match your active character's name ${oldName}. If this sheet is not the one you want to update, ` +
				`please re-export the correct character and try again.` +
				(this.importSource === 'pathbuilder'
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
			ephemeral: true,
			fetchReply: true,
		});
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
						content:
							L.en.commands.character.remove.interactions.removeConfirmation.expired(),
						components: [],
					});
				},
			}
		);
		if (result && result.value !== 'update') {
			await InteractionUtils.editReply(this.intr, {
				content: L.en.sharedInteractions.choiceRegistered({
					choice: 'Cancel',
				}),
				components: [],
			});
			// cancel
			throw new KoboldError(
				L.en.commands.character.update.interactions.canceled({
					characterName: oldName,
				})
			);
		} else {
			await InteractionUtils.editReply(this.intr, {
				content: L.en.sharedInteractions.choiceRegistered({
					choice: 'Update',
				}),
				components: [],
			});
		}
	}
	public async update(args: FetchArgs): Promise<Character> {
		const koboldUtils: KoboldUtils = new KoboldUtils(this.kobold);
		const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(this.intr);
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const sourceData = await this.fetchSourceData(args);
		const sheetRecord = this.convertSheetRecord(sourceData, activeCharacter);

		if (activeCharacter.name !== sheetRecord.sheet.staticInfo.name) {
			// throws an error if they don't confirm
			await this.confirmUpdateName(activeCharacter.name, sheetRecord.sheet.staticInfo.name);
		}

		sheetRecord.sheet = Creature.preserveSheetTrackerValues(
			sheetRecord.sheet,
			activeCharacter.sheetRecord.sheet
		);

		const updatedSheetRecord = await this.kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			sheetRecord
		);
		return await this.kobold.character.update(
			{ id: activeCharacter.id },
			{ name: updatedSheetRecord.sheet.staticInfo.name, charId: this.getCharId(args) }
		);
	}
}
