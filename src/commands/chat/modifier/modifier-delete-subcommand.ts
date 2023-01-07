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

export class ModifierDeleteSubCommand implements Command {
	public names = [Language.LL.commands.modifier.delete.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.delete.name(),
		description: Language.LL.commands.modifier.delete.description(),
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
			const matchedSaves = CharacterUtils.findPossibleModifierFromString(
				activeCharacter,
				match
			).map(save => ({
				name: save.Name,
				value: save.Name,
			}));
			//return the matched saves
			return matchedSaves;
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
			modifier => modifier.name.toLowerCase() === modifierChoice.toLowerCase()
		);
		if (targetModifier) {
			// ask for confirmation

			const prompt = await intr.reply({
				content: LL.commands.modifier.delete.interactions.deleteConfirmation.text({
					modifierName: targetModifier.name,
				}),
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: LL.commands.modifier.delete.interactions.deleteConfirmation.deleteButton(),
								customId: 'delete',
								style: ButtonStyle.Danger,
							},
							{
								type: ComponentType.Button,
								label: LL.commands.modifier.delete.interactions.deleteConfirmation.cancelButton(),
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
						case 'delete':
							return { intr: buttonInteraction, value: 'delete' };
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
								LL.commands.modifier.delete.interactions.deleteConfirmation.expired(),
							components: [],
						});
					},
				}
			);
			// delete the modifier
			if (result.value === 'delete') {
			}
			// cancel
			else {
			}
		} else {
			// no matching modifier found
		}
	}
}
