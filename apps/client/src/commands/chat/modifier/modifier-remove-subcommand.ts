import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ComponentType,
	MessageFlags,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ModifierDefinition.options;
const commandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ModifierRemoveSubCommand extends BaseCommandClass(
	ModifierDefinition,
	ModifierDefinition.subCommandEnum.remove
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = FinderHelpers.matchAllModifiers(
				activeCharacter.sheetRecord,
				match
			).map(modifier => ({
				name: modifier.name,
				value: modifier.name,
			}));
			//return the matched saves
			return matchedModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const modifierChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.name].name,
			true
		);
		//get the active character
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const targetModifier = FinderHelpers.getModifierByName(
			activeCharacter.sheetRecord,
			modifierChoice
		);
		if (targetModifier) {
			// ask for confirmation

			const response = await intr.reply({
				content: ModifierDefinition.strings.remove.confirmation.text({
					modifierName: targetModifier.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: ModifierDefinition.strings.remove.confirmation.removeButton,
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: ModifierDefinition.strings.remove.confirmation.cancelButton,
								customId: 'cancel',
								style: ButtonStyle.Primary,
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
						case 'remove':
							return { intr: buttonInteraction, value: 'remove' };
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
							content: ModifierDefinition.strings.remove.confirmation.expired,
							components: [],
						});
					},
				}
			);
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: ModifierDefinition.strings.shared.choiceRegistered({
						choice: _.capitalize(result.value),
					}),
					components: [],
				});
			}
			// remove the modifier
			if (result && result.value === 'remove') {
				const modifiersWithoutRemoved = _.filter(
					activeCharacter.sheetRecord.modifiers,
					modifier =>
						modifier.name.toLocaleLowerCase() !== modifierChoice.toLocaleLowerCase()
				);
				await kobold.sheetRecord.update(
					{ id: activeCharacter.sheetRecordId },
					{
						modifiers: modifiersWithoutRemoved,
					}
				);

				await InteractionUtils.send(
					intr,
					ModifierDefinition.strings.remove.success({
						modifierName: targetModifier.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, ModifierDefinition.strings.remove.cancel);
				return;
			}
		} else {
			// no matching modifier found
			await InteractionUtils.send(intr, ModifierDefinition.strings.notFound);
			return;
		}
	}
}
