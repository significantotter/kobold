import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { anyUsageContext } from '../../command-utils/definitions.js';
import { CharacterCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CharacterSetActiveSubCommand extends BaseCommandClass(
	CharacterCommand,
	CharacterCommand.subCommandEnum.setActive
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CharacterOptions.SET_ACTIVE_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(CharacterOptions.SET_ACTIVE_NAME_OPTION.name) ?? '';

			const { characterUtils } = new KoboldUtils(kobold);
			//get the character matches
			const options = await characterUtils.findOwnedCharacterByName(match, intr.user.id);

			//return the matched characters
			return options.map(character => ({
				name: character.name,
				value: character.name,
			}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const charName = intr.options.getString(CharacterOptions.SET_ACTIVE_NAME_OPTION.name, true);

		const { characterUtils } = new KoboldUtils(kobold);

		// try and find that charcter
		const targetCharacter = (
			await characterUtils.findOwnedCharacterByName(charName, intr.user.id)
		)[0];

		if (targetCharacter) {
			await kobold.character.setIsActive({ id: targetCharacter.id, userId: intr.user.id });

			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.setActive.interactions.success({
					characterName: targetCharacter.name,
				})
			);
		} else {
			await InteractionUtils.send(
				intr,
				LL.commands.character.setActive.interactions.notFound()
			);
		}
	}
}
