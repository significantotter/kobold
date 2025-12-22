import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { InitiativeActorWithRelations, Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { StringUtils } from '@kobold/base-utils';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitNoteSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.note
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.initCharacter].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.initCharacter].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getInitTargetOptions(intr, match, false);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.initCharacter].name,
			true
		);
		let note = intr.options.getString(commandOptions[commandOptionsEnum.initNote].name, true);
		if (
			['-', 'none', 'clear', 'remove', 'x', '', '.', '""', "''", '``'].includes(
				note.trim().toLowerCase()
			)
		) {
			note = '';
		}

		// remove disallowed characters
		note.replaceAll('`', "'").replaceAll('\\', '\\\\').replaceAll('\\\\n', '\n');

		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const actor = StringUtils.nameMatchGeneric<InitiativeActorWithRelations>(
			currentInitiative.actors,
			targetCharacterName
		);
		if (!actor) {
			throw new KoboldError("Yip! I couldn't find that character in the initiative.");
		}
		if (note?.length && note.length > 500) {
			throw new KoboldError(
				`Yip! That note is too long. A note can be a maximum of 500 characters.`
			);
		}

		await kobold.initiativeActor.update({ id: actor.id }, { note: note });

		await InteractionUtils.send(intr, `Yip! I set the note for ${actor.name} to: "${note}"`);
	}
}
