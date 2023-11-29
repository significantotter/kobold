import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';

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
		const { creatureUtils } = koboldUtils;
		let { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

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

			const fetcher = new PathbuilderCharacterFetcher(intr, kobold, intr.user.id);
			const newCharacter = await fetcher.create({ jsonId });

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: newCharacter.name,
				}) + newSheetUpdateWarning
			);
			return;
		} else if (activeCharacter.importSource === 'pastebin') {
		}
		//otherwise wanderer's guide
		else {
			//check for token access
			const fetcher = new WgCharacterFetcher(intr, kobold, intr.user.id);
			const newCharacter = await fetcher.create({ charId: activeCharacter.charId });

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: newCharacter.name,
				})
			);
		}
	}
}
