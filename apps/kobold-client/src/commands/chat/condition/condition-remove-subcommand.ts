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
import { Kobold } from '@kobold/db';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionOptions } from './condition-command-options.js';

export class ConditionRemoveSubCommand implements Command {
	public name = L.en.commands.condition.remove.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.remove.name(),
		description: L.en.commands.condition.remove.description(),
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
		if (option.name === GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) {
			const match =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === ConditionOptions.CONDITION_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ConditionOptions.CONDITION_NAME_OPTION.name) ?? '';
			const targetCharacterName =
				intr.options.getString(GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			try {
				return autocompleteUtils.getConditionsOnTarget(intr, targetCharacterName, match);
			} catch (err) {
				// failed to match a target, so return []
				return [];
			}
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const conditionChoice = intr.options.getString(
			ConditionOptions.CONDITION_NAME_OPTION.name,
			true
		);
		const targetCharacterName = intr.options.getString(
			GameplayOptions.GAMEPLAY_TARGET_CHARACTER.name,
			true
		);
		const { gameUtils } = new KoboldUtils(kobold);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);
		const targetCondition = FinderHelpers.getConditionByName(
			targetSheetRecord,
			conditionChoice
		);
		if (targetCondition) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: LL.commands.condition.interactions.removeConfirmation.text({
					conditionName: targetCondition.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: LL.commands.condition.interactions.removeConfirmation.removeButton(),
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: LL.commands.condition.interactions.removeConfirmation.cancelButton(),
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
								LL.commands.condition.interactions.removeConfirmation.expired(),
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
			// remove the condition
			if (result && result.value === 'remove') {
				const conditionsWithoutRemoved = _.filter(
					targetSheetRecord.conditions,
					condition =>
						condition.name.toLocaleLowerCase() !== conditionChoice.toLocaleLowerCase()
				);
				await kobold.sheetRecord.update(
					{ id: targetSheetRecord.id },
					{
						conditions: conditionsWithoutRemoved,
					}
				);

				await InteractionUtils.send(
					intr,
					LL.commands.condition.interactions.success({
						conditionName: targetCondition.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(intr, LL.commands.condition.interactions.cancel());
				return;
			}
		} else {
			// no matching condition found
			await InteractionUtils.send(intr, LL.commands.condition.interactions.notFound());
			return;
		}
	}
}
