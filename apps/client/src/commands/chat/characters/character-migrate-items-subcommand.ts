import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { Kobold } from '@kobold/db';

import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterMigrateItemsSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.migrateItems
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const userId = intr.user.id;

		// Find all character-specific items (where sheetRecordId is not null)
		const allActions = await kobold.action.readManyByUser({
			userId,
			filter: 'all',
		});
		const actionsToMigrate = allActions.filter(a => a.sheetRecordId !== null);

		const allModifiers = await kobold.modifier.readManyByUser({
			userId,
			filter: 'all',
		});
		const modifiersToMigrate = allModifiers.filter(m => m.sheetRecordId !== null);

		const allRollMacros = await kobold.rollMacro.readManyByUser({
			userId,
			filter: 'all',
		});
		const rollMacrosToMigrate = allRollMacros.filter(rm => rm.sheetRecordId !== null);

		// Check if there's anything to migrate
		if (
			actionsToMigrate.length === 0 &&
			modifiersToMigrate.length === 0 &&
			rollMacrosToMigrate.length === 0
		) {
			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.migrateItems.noItemsToMigrate
			);
			return;
		}

		// Show confirmation dialog
		const response = await intr.reply({
			content: CharacterDefinition.strings.migrateItems.confirmation.text({
				actionsCount: actionsToMigrate.length,
				modifiersCount: modifiersToMigrate.length,
				rollMacrosCount: rollMacrosToMigrate.length,
			}),
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: CharacterDefinition.strings.migrateItems.confirmation
								.migrateButton,
							customId: 'migrate',
							style: ButtonStyle.Primary,
						},
						{
							type: ComponentType.Button,
							label: CharacterDefinition.strings.migrateItems.confirmation
								.cancelButton,
							customId: 'cancel',
							style: ButtonStyle.Secondary,
						},
					],
				},
			],
			flags: [MessageFlags.Ephemeral],
			withResponse: true,
		});
		const prompt = response.resource!.message!;
		let timedOut = false;
		let result = await CollectorUtils.collectByButton(
			prompt,
			async buttonInteraction => {
				if (buttonInteraction.user.id !== intr.user.id) {
					return;
				}
				switch (buttonInteraction.customId) {
					case 'migrate':
						return { intr: buttonInteraction, value: 'migrate' };
					default:
						return { intr: buttonInteraction, value: 'cancel' };
				}
			},
			{
				time: 50000,
				reset: true,
				target: intr.user,
				stopFilter: message => message.content.toLowerCase() === 'stop',
				onExpire: async () => {
					timedOut = true;
					await InteractionUtils.editReply(intr, {
						content: CharacterDefinition.strings.migrateItems.confirmation.expired,
						components: [],
					});
				},
			}
		);

		if (result && result.value === 'migrate') {
			await InteractionUtils.editReply(intr, {
				content: CharacterDefinition.strings.shared.choiceRegistered({
					choice: 'Migrate',
				}),
				components: [],
			});

			// Migrate all actions
			for (const action of actionsToMigrate) {
				await kobold.action.update({ id: action.id }, { sheetRecordId: null });
			}

			// Migrate all modifiers
			for (const modifier of modifiersToMigrate) {
				await kobold.modifier.update({ id: modifier.id }, { sheetRecordId: null });
			}

			// Migrate all roll macros
			for (const rollMacro of rollMacrosToMigrate) {
				await kobold.rollMacro.update({ id: rollMacro.id }, { sheetRecordId: null });
			}

			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.migrateItems.success({
					actionsCount: actionsToMigrate.length,
					modifiersCount: modifiersToMigrate.length,
					rollMacrosCount: rollMacrosToMigrate.length,
				})
			);
		} else if (!timedOut) {
			await InteractionUtils.editReply(intr, {
				content: CharacterDefinition.strings.migrateItems.cancelled,
				components: [],
			});
		}
	}
}
