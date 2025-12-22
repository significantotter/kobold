import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';

import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export class CharacterSetActiveSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.setActive
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const charName = intr.options.getString(commandOptions[commandOptionsEnum.name].name, true);

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
				CharacterDefinition.strings.setActive.success({
					characterName: targetCharacter.name,
				})
			);
		} else {
			await InteractionUtils.send(intr, CharacterDefinition.strings.setActive.notFound);
		}
	}
}
