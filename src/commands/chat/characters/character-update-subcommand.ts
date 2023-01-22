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
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
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
					action: 'update',
				})
			);
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.authenticationLink({
					wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
					charId: activeCharacter.charId,
				}),
				true
			);
			return;
		}
		let fetchedCharacter;
		try {
			fetchedCharacter = await CharacterHelpers.fetchWgCharacterFromToken(
				activeCharacter.charId,
				token[0].accessToken
			);
		} catch (err) {
			if (err?.response?.status === 401) {
				//token expired!
				await WgToken.query().delete().where({ charId: activeCharacter.charId });
				await InteractionUtils.send(
					intr,
					LL.commands.character.interactions.expiredToken()
				);
				await InteractionUtils.send(
					intr,
					LL.commands.character.interactions.authenticationLink({
						wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
						charId: activeCharacter.charId,
					}),
					true
				);
				return;
			} else if (err.response.status === 429) {
				await InteractionUtils.send(
					intr,
					LL.commands.character.interactions.tooManyWGRequests()
				);
				return;
			} else {
				//otherwise, something else went wrong that we want to be a real error
				throw err;
			}
		}

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
