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
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import Config from '../../../config/config.json';

export class CharacterUpdateSubCommand implements Command {
	public names = [Language.LL.commands.character.update.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.update.name(),
		description: Language.LL.commands.character.update.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		//check for token access
		const token = await WgToken.query().where({ charId: activeCharacter.charId });

		if (!token.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.authenticationRequest({
					wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
					charId: activeCharacter.charId,
					action: 'update',
				})
			);
		}
		const fetchedCharacter = await CharacterHelpers.fetchWgCharacterFromToken(
			activeCharacter.charId,
			token[0].accessToken
		);

		// store sheet in db
		const updatedCharacter = await Character.query().updateAndFetchById(activeCharacter.id, {
			userId: intr.user.id,
			...fetchedCharacter,
		});

		//send success message

		await InteractionUtils.send(
			intr,
			LL.commands.character.update.interactions.success({
				characterName: updatedCharacter.characterData.name,
			})
		);
	}
}
