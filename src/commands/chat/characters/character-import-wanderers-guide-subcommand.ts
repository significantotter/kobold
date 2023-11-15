import { CharacterModel, CharacterWithRelations } from '../../../services/kobold/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { default as axios } from 'axios';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterHelpers } from './helpers.js';
import { Config } from '../../../config/config.js';
import { CharacterOptions } from './command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { Kobold } from '../../../services/kobold/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Creature } from '../../../utils/creature.js';

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

		//check if we have a token
		const [tokenResults, existingCharacter] = await Promise.all([
			kobold.wgAuthToken.read({ charId }),
			kobold.character.read({ charId, importSource: 'wg', userId: intr.user.id }),
		]);

		if (existingCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.characterAlreadyExists({
					characterName: existingCharacter.name,
				})
			);
			return;
		} else if (!tokenResults) {
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
			const token = tokenResults.accessToken;
			let creature: Creature;

			//TODO: merge this with the one in helpers as a util
			try {
				creature = await CharacterHelpers.fetchWgCharacterFromToken(charId, token);
			} catch (err) {
				if ((axios.default ?? axios).isAxiosError(err) && err.response?.status === 401) {
					//token expired!
					await kobold.wgAuthToken.delete({
						charId,
					});
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
				} else if (
					(axios.default ?? axios).isAxiosError(err) &&
					err.response?.status === 429
				) {
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
			const duplicateNameChar: CharacterWithRelations | undefined = (
				await kobold.character.readMany({
					name: creature.name,
					userId: intr.user.id,
				})
			)[0];

			if (duplicateNameChar) {
				await InteractionUtils.send(
					intr,
					LL.commands.character.importWanderersGuide.interactions.characterAlreadyExists({
						characterName: creature.name,
					})
				);
				return;
			}

			// store sheet in db
			const newSheetRecord = await kobold.sheetRecord.create({ sheet: creature._sheet });
			const newCharacter = await kobold.character.create({
				userId: intr.user.id,
				name: creature.name,
				charId,
				sheetRecordId: newSheetRecord.id,
				isActiveCharacter: true,
				importSource: 'wg',
			});

			await kobold.character.setIsActive({
				id: newCharacter.id,
				userId: intr.user.id,
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.importWanderersGuide.interactions.success({
					characterName: newCharacter.name,
				})
			);
		}
	}
}
