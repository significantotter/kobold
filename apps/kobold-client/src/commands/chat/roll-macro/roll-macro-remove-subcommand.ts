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
import { RollMacroDefinition, sharedStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollMacroDefinition.options;
const commandOptionsEnum = RollMacroDefinition.commandOptionsEnum;

export class RollMacroRemoveSubCommand extends BaseCommandClass(
	RollMacroDefinition,
	RollMacroDefinition.subCommandEnum.remove
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

			return await new KoboldUtils(
				kobold
			).autocompleteUtils.getAllMatchingRollsMacrosForCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { characterUtils } = koboldUtils;
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const rollMacroChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.name].name,
			true
		);

		const targetRollMacro = FinderHelpers.getRollMacroByName(
			activeCharacter.sheetRecord,
			rollMacroChoice
		);
		if (targetRollMacro) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: RollMacroDefinition.strings.remove.removeConfirmationText({
					macroName: targetRollMacro.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: RollMacroDefinition.strings.remove.removeButton,
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: RollMacroDefinition.strings.remove.cancelButton,
								customId: 'cancel',
								style: ButtonStyle.Primary,
							},
						],
					},
				],
				flags: [MessageFlags.Ephemeral],
				fetchReply: true,
			});
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
							content: RollMacroDefinition.strings.remove.expired,
							components: [],
						});
					},
				}
			);
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: sharedStrings.choiceRegistered({
						choice: _.capitalize(result.value),
					}),
					components: [],
				});
			}
			// remove the rollMacro
			if (result && result.value === 'remove') {
				const rollMacrosWithoutRemoved = _.filter(
					activeCharacter.sheetRecord.rollMacros,
					rollMacro =>
						rollMacro.name.toLocaleLowerCase() !== rollMacroChoice.toLocaleLowerCase()
				);
				await kobold.sheetRecord.update(
					{ id: activeCharacter.sheetRecord.id },
					{ rollMacros: rollMacrosWithoutRemoved }
				);

				await InteractionUtils.send(
					intr,
					RollMacroDefinition.strings.remove.success({
						macroName: targetRollMacro.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, RollMacroDefinition.strings.remove.cancel);
				return;
			}
		} else {
			// no matching rollMacro found
			await InteractionUtils.send(intr, RollMacroDefinition.strings.notFound);
			return;
		}
	}
}
