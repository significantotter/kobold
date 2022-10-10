import { Language } from './../../../models/enum-helpers/language';
import { Lang } from './../../../services/lang';
import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { CharacterHelpers } from './helpers.js';
import Config from '../../../config/config.json';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { CharacterOptions } from './command-options.js';

export class CharacterImportSubCommand implements Command {
	public names = [Language.LL.commands.character.import.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.import.name(),
		description: Language.LL.commands.character.import.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const url = intr.options.getString(CharacterOptions.IMPORT_OPTION.name).trim();
		const LL = Language.localize(data.lang());
		let charId = CharacterUtils.parseCharacterIdFromText(url);
		if (charId === null) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.import.interactions.invalidUrl({
					url,
				})
			);
			return;
		}

		//check if we have a token
		const [tokenResults, existingCharacter] = await Promise.all([
			WgToken.query().where({ charId }),
			Character.query().where({ charId, userId: intr.user.id }),
		]);

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				LL.commands.character.import.interactions.characterAlreadyExists({
					characterName: character.characterData.name,
				})
			);
			return;
		} else if (!tokenResults.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				LL.commands.character.import.interactions.authenticationRequest({
					wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
					charId,
				})
			);
			return;
		} else {
			// We have the authentication token! Fetch the user's sheet
			const token = tokenResults[0].accessToken;
			const character = await CharacterHelpers.fetchWgCharacterFromToken(charId, token);

			// set current characters owned by user to inactive state
			await Character.query()
				.update({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				userId: intr.user.id,
				...character,
				isActiveCharacter: true,
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.import.interactions.success({
					characterName: newCharacter.characterData.name,
				})
			);
		}
	}
}
