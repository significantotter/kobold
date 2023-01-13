import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { Character } from '../../../services/kobold/models/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { ModifierOptions } from './modifier-command-options.js';
import _ from 'lodash';

export class ModifierRemoveSubCommand implements Command {
	public names = [Language.LL.commands.modifier.remove.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.remove.name(),
		description: Language.LL.commands.modifier.remove.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(
				intr.user.id,
				intr.guildId
			);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = CharacterUtils.findPossibleModifierFromString(
				activeCharacter,
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
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const modifierChoice = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name);
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		const targetModifier = _.find(
			activeCharacter.modifiers,
			modifier => modifier.name.toLocaleLowerCase() === modifierChoice.toLocaleLowerCase()
		);
		if (targetModifier) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: LL.commands.modifier.remove.interactions.removeConfirmation.text({
					modifierName: targetModifier.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: LL.commands.modifier.remove.interactions.removeConfirmation.removeButton(),
								customId: 'remove',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: LL.commands.modifier.remove.interactions.removeConfirmation.cancelButton(),
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
								LL.commands.modifier.remove.interactions.removeConfirmation.expired(),
							components: [],
						});
					},
				}
			);
			await InteractionUtils.editReply(intr, {
				content: LL.sharedInteractions.choiceRegistered({
					choice: _.capitalize(result.value),
				}),
				components: [],
			});
			// remove the modifier
			if (result.value === 'remove') {
				const modifiersWithoutRemoved = _.filter(
					activeCharacter.modifiers,
					modifier =>
						modifier.name.toLocaleLowerCase() !== modifierChoice.toLocaleLowerCase()
				);
				await Character.query()
					.patch({ modifiers: modifiersWithoutRemoved })
					.where({ userId: intr.user.id });

				await InteractionUtils.send(
					intr,
					LL.commands.modifier.remove.interactions.success({
						modifierName: targetModifier.name,
					})
				);
				return;
			}
			// cancel
			else {
				await InteractionUtils.send(
					intr,
					LL.commands.modifier.remove.interactions.cancel()
				);
				return;
			}
		} else {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.modifier.remove.interactions.notFound());
			return;
		}
	}
}
