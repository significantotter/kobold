import { Language } from '../../../models/enum-helpers/language';
import { Lang } from '../../../services/lang';
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
import { Config } from '../../../config/config.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { CharacterOptions } from './command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

export class CharacterImportWanderersGuideSubCommand implements Command {
	public names = [Language.LL.commands.character.importWanderersGuide.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.importWanderersGuide.name(),
		description: Language.LL.commands.character.importWanderersGuide.description(),
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
		const url = intr.options.getString(CharacterOptions.IMPORT_OPTION.name).trim();
		let charId = CharacterUtils.parseCharacterIdFromText(url);
		if (charId === null) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.invalidUrl({
					url,
				})
			);
			return;
		}

		//check if we have a token
		const [tokenResults, existingCharacter] = await Promise.all([
			WgToken.query().where({ charId }),
			Character.query().where({ charId, importSource: 'wg', userId: intr.user.id }),
		]);

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.characterAlreadyExists({
					characterName: character.sheet.info.name,
				})
			);
			return;
		} else if (!tokenResults.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.authenticationRequest({
					action: 'import',
				})
			);
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.authenticationLink({
					wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
					charId: charId,
				}),
				true
			);
			return;
		} else {
			// We have the authentication token! Fetch the user's sheet
			const token = tokenResults[0].accessToken;
			let character;

			//TODO: merge this with the one in helpers as a util
			try {
				character = await CharacterHelpers.fetchWgCharacterFromToken(charId, token);
			} catch (err) {
				if (err.response.status === 401) {
					//token expired!
					await WgToken.query().delete().where({ charId });
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.expiredToken()
					);
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.authenticationLink({
							wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
							charId: charId,
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
			const duplicateNameChar = await Character.query()
				.first()
				.where({ userId: intr.user.id })
				.andWhereRaw('name ILIKE ?', character.sheet.info.name.trim());
			if (duplicateNameChar) {
				await InteractionUtils.send(
					intr,
					LL.commands.character.importWanderersGuide.interactions.characterAlreadyExists({
						characterName: character.sheet.info.name,
					})
				);
				return;
			}

			// set current characters owned by user to inactive state
			await Character.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				userId: intr.user.id,
				...character,
				isActiveCharacter: true,
				importSource: 'wg',
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.success({
					characterName: newCharacter.sheet.info.name,
				})
			);
		}
	}
}
