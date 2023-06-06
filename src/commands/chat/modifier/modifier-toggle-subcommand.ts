import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { ModifierOptions } from './modifier-command-options.js';
import { Character } from '../../../services/kobold/models/index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

export class ModifierToggleSubCommand implements Command {
	public names = [Language.LL.commands.modifier.toggle.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.toggle.name(),
		description: Language.LL.commands.modifier.toggle.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
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
		let name = (intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '')
			.trim()
			.toLowerCase();

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const modifier = activeCharacter.getModifierByName(name);

		if (!modifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.notFound());
			return;
		}

		let targetIndex = _.indexOf(activeCharacter.modifiers, modifier);

		activeCharacter.modifiers[targetIndex].isActive = !modifier.isActive;

		await Character.query().patchAndFetchById(activeCharacter.id, {
			modifiers: activeCharacter.modifiers,
		});

		const activeText = modifier.isActive
			? LL.commands.modifier.toggle.interactions.active()
			: LL.commands.modifier.toggle.interactions.inactive();

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.modifier.toggle.interactions.success({
				characterName: activeCharacter.sheet.info.name,
				modifierName: modifier.name,
				activeSetting: activeText,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
