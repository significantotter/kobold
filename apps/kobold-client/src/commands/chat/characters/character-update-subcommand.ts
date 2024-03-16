import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from 'kobold-db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { PasteBinCharacterFetcher } from './Fetchers/pastebin-character-fetcher.js';

export class CharacterUpdateSubCommand implements Command {
	public names = [L.en.commands.character.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.update.name(),
		description: L.en.commands.character.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		//check if we have an active character
		const koboldUtils = new KoboldUtils(kobold);
		const useStamina = intr.options.getBoolean(CharacterOptions.IMPORT_USE_STAMINA_OPTION.name);
		let { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		if (activeCharacter.importSource !== 'pathbuilder' && useStamina != null) {
			throw new KoboldError(
				"Yip! You can only use the stamina option with pathbuilder characters. Wanderer's Guide characters import stamina settings automatically."
			);
		}

		if (activeCharacter.importSource === 'pathbuilder') {
			let jsonId = intr.options.getNumber(CharacterOptions.IMPORT_PATHBUILDER_OPTION.name);

			let newSheetUpdateWarning = '';
			if (!jsonId) {
				jsonId = activeCharacter.charId;
				newSheetUpdateWarning =
					' Note: You must re-export your pathbuilder character and use the new json ' +
					'id to update your character sheet with new changes. Otherwise, I will just ' +
					'reload the data from the last exported pathbuilder json id.';
			}
			if (!jsonId) {
				throw new KoboldError(
					'Yip! You must provide a pathbuilder json id to update your character sheet with new changes.'
				);
			}

			let options:
				| {
						useStamina: boolean;
				  }
				| undefined;

			if (useStamina != null)
				options = {
					useStamina,
				};

			const fetcher = new PathbuilderCharacterFetcher(intr, kobold, intr.user.id, options);
			const newCharacter = await fetcher.update({ jsonId });

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: newCharacter.name,
				}) + newSheetUpdateWarning
			);
			return;
		} else if (activeCharacter.importSource === 'pastebin') {
			const url = intr.options.getString(CharacterOptions.IMPORT_PASTEBIN_OPTION.name);
			const useStamina =
				intr.options.getBoolean(CharacterOptions.IMPORT_USE_STAMINA_OPTION.name) ?? false;

			if (!url) {
				throw new KoboldError(
					'Yip! This character was created with PasteBin. You must provide' +
						' a PasteBin url to update your character sheet with new changes.'
				);
			}

			const importId = TextParseHelpers.parsePasteBinIdFromText(url);

			if (!importId) {
				await InteractionUtils.send(intr, `Yip! I couldn't parse the url "${url}".`);
				return;
			}
			const fetcher = new PasteBinCharacterFetcher(intr, kobold, intr.user.id);
			const newCharacter = await fetcher.update({ url: importId });

			//send success message
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPasteBin.interactions.success({
					characterName: newCharacter.name,
				})
			);
			return;
		}
		//otherwise wanderer's guide
		else {
			//check for token access
			const fetcher = new WgCharacterFetcher(intr, kobold, intr.user.id);
			const newCharacter = await fetcher.update({ charId: activeCharacter.charId });

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: newCharacter.name,
				})
			);
		}
	}
}
