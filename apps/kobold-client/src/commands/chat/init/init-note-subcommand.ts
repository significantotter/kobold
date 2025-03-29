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
import { RateLimiter } from 'discord.js-rate-limiter';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InitiativeActorWithRelations, Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { StringUtils } from '@kobold/base-utils';

export class InitNoteSubCommand implements Command {
	public name = L.en.commands.init.note.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.note.name(),
		description: L.en.commands.init.note.description(),
		dm_permission: false,
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
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getInitTargetOptions(intr, match, false);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(
			InitOptions.INIT_CHARACTER_OPTION.name,
			true
		);
		let note = intr.options.getString(InitOptions.INIT_NOTE_OPTION.name, true);
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
