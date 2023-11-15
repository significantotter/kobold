import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ComponentType,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '../../../services/kobold/index.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { RollMacroOptions } from './roll-macro-command-options.js';

export class RollMacroRemoveSubCommand implements Command {
	public names = [L.en.commands.rollMacro.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.remove.name(),
		description: L.en.commands.rollMacro.remove.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === RollMacroOptions.MACRO_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(RollMacroOptions.MACRO_NAME_OPTION.name) ?? '';

			return await new KoboldUtils(
				kobold
			).autocompleteUtils.getAllMatchingRollsMacrosForCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { characterUtils } = koboldUtils;
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const rollMacroChoice = intr.options.getString(
			RollMacroOptions.MACRO_NAME_OPTION.name,
			true
		);

		const targetRollMacro = FinderHelpers.getRollMacroByName(
			activeCharacter.sheetRecord,
			rollMacroChoice
		);
		if (targetRollMacro) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: LL.commands.rollMacro.remove.interactions.removeConfirmation.text({
					macroName: targetRollMacro.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: LL.commands.rollMacro.remove.interactions.removeConfirmation.removeButton(),
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: LL.commands.rollMacro.remove.interactions.removeConfirmation.cancelButton(),
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
							content:
								LL.commands.rollMacro.remove.interactions.removeConfirmation.expired(),
							components: [],
						});
					},
				}
			);
			if (result) {
				await InteractionUtils.editReply(intr, {
					content: LL.sharedInteractions.choiceRegistered({
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
					LL.commands.rollMacro.remove.interactions.success({
						macroName: targetRollMacro.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(
					intr,
					LL.commands.rollMacro.remove.interactions.cancel()
				);
				return;
			}
		} else {
			// no matching rollMacro found
			await InteractionUtils.send(intr, LL.commands.rollMacro.interactions.notFound());
			return;
		}
	}
}
