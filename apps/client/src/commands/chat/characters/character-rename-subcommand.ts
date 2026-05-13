import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '@kobold/util';

import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export class CharacterRenameSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.rename
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';

			const { characterUtils } = new KoboldUtils(kobold);
			const options = await characterUtils.findOwnedCharacterByNameLite(match, intr.user.id);

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
		const rawNewName = intr.options.getString(
			commandOptions[commandOptionsEnum.newName].name,
			true
		);
		const newName = rawNewName.trim();
		if (newName.length < 1 || newName.length > 100) {
			throw new KoboldError(CharacterDefinition.strings.rename.invalidName);
		}

		const targetName = intr.options.getString(commandOptions[commandOptionsEnum.name].name);
		const targetCharacter = targetName
			? (
					await new KoboldUtils(kobold).characterUtils.findOwnedCharacterByNameLite(
						targetName,
						intr.user.id
					)
				)[0]
			: await kobold.character.readActiveLite({
					userId: intr.user.id,
					guildId: intr.guildId ?? undefined,
					channelId: intr.channelId ?? undefined,
				});

		if (!targetCharacter) {
			if (targetName) {
				await InteractionUtils.send(intr, CharacterDefinition.strings.rename.notFound);
				return;
			}
			throw new KoboldError(CharacterDefinition.strings.noActiveCharacter);
		}

		if (targetCharacter.name.trim().toLowerCase() === newName.toLowerCase()) {
			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.rename.noChange({
					characterName: targetCharacter.name,
				})
			);
			return;
		}

		const existingCharacter = await kobold.character.readLite({
			exactName: newName,
			userId: intr.user.id,
		});
		if (existingCharacter && existingCharacter.id !== targetCharacter.id) {
			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.rename.duplicate({
					characterName: existingCharacter.name,
				})
			);
			return;
		}

		await kobold.character.updateName({
			id: targetCharacter.id,
			userId: intr.user.id,
			name: newName,
		});

		await InteractionUtils.send(
			intr,
			CharacterDefinition.strings.rename.success({
				oldName: targetCharacter.name,
				newName,
			})
		);
	}
}
