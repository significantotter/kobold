import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { InteractionUtils } from '../../../utils/index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';

export class CharacterImportWanderersGuideSubCommand implements Command {
	public names = [L.en.commands.character.importWanderersGuide.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.importWanderersGuide.name(),
		description: L.en.commands.character.importWanderersGuide.description(),
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
		const url = intr.options.getString(CharacterOptions.IMPORT_OPTION.name, true).trim();
		let charId = TextParseHelpers.parseCharacterIdFromText(url);
		if (charId === null) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.invalidUrl({
					url,
				})
			);
			return;
		}
		const fetcher = new WgCharacterFetcher(intr, kobold, intr.user.id);
		const newCharacter = await fetcher.create({ charId });

		//send success message

		await InteractionUtils.send(
			intr,
			LL.commands.character.importWanderersGuide.interactions.success({
				characterName: newCharacter.name,
			})
		);
	}
}
