import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { CharacterHelpers } from './helpers.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Config } from '../../../config/config.js';
import { CharacterOptions } from './command-options.js';
import { refs } from '../../../i18n/en/common.js';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { Creature } from '../../../utils/creature.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';

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

			const pathBuilderChar = await new PathBuilder().get({ characterJsonId: jsonId });

			if (!pathBuilderChar.success) {
				await InteractionUtils.send(
					intr,
					LL.commands.character.importPathBuilder.interactions.failedRequest({
						supportServerUrl: refs.links.support,
					})
				);
			}

			const creature = Creature.fromPathBuilder(pathBuilderChar.build);

			let result;

			if (creature.sheet.info.name !== activeCharacter.sheet.info.name) {
				// confirm the update
				const prompt = await intr.followUp({
					content:
						`**WARNING:** The character name on the target sheet ${creature.sheet.info.name} does not ` +
						`match your active character's name ${activeCharacter.sheet.info.name}. Pathbuilder only ` +
						`remembers the **Last JSON export** you've done! If this sheet is not the one you want to update, ` +
						`please re-export the correct pathbuilder character and try again.`,
					components: [
						{
							type: ComponentType.ActionRow,
							components: [
								{
									type: ComponentType.Button,
									label: 'UPDATE',
									customId: 'update',
									style: ButtonStyle.Danger,
								},
								{
									type: ComponentType.Button,
									label: 'CANCEL',
									customId: 'cancel',
									style: ButtonStyle.Primary,
								},
							],
						},
					],
					ephemeral: true,
					fetchReply: true,
				});
				let timedOut = false;
				result = await CollectorUtils.collectByButton(
					prompt,
					async buttonInteraction => {
						if (buttonInteraction.user.id !== intr.user.id) {
							return;
						}
						switch (buttonInteraction.customId) {
							case 'update':
								return { intr: buttonInteraction, value: 'update' };
							default:
								return { intr: buttonInteraction, value: 'cancel' };
						}
					},
					{
						time: 50000,
						reset: true,
						target: intr.user,
						stopFilter: message => message.content.toLowerCase() === 'stop',
						onExpire: async () => {
							timedOut = true;
							await InteractionUtils.editReply(intr, {
								content:
									LL.commands.character.remove.interactions.removeConfirmation.expired(),
								components: [],
							});
						},
					}
				);
				if (result !== 'update') {
					await InteractionUtils.editReply(intr, {
						content: LL.sharedInteractions.choiceRegistered({
							choice: 'Cancel',
						}),
						components: [],
					});
					// cancel
					await InteractionUtils.send(intr, {
						content: LL.commands.character.update.interactions.canceled({
							characterName: activeCharacter.sheet.info.name,
						}),
						components: [],
					});
					return;
				} else {
					await InteractionUtils.editReply(intr, {
						content: LL.sharedInteractions.choiceRegistered({
							choice: 'Update',
						}),
						components: [],
					});
				}
			}
			// set current characters owned by user to inactive state
			await Character.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().patchAndFetchById(activeCharacter.id, {
				name: creature.sheet.info.name,
				charId: jsonId,
				userId: intr.user.id,
				sheet: creature.sheet,
				isActiveCharacter: true,
				importSource: 'pathbuilder',
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: newCharacter.sheet.info.name,
				}) + newSheetUpdateWarning
			);
			return;
		}
		//otherwise wanderer's guide
		else {
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
					token[0].accessToken,
					activeCharacter.sheet
				);
			} catch (err) {
				console.log(err);
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
				} else if (err?.response?.status === 429) {
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
			const updatedCharacter = await Character.query().updateAndFetchById(
				activeCharacter.id,
				{
					userId: intr.user.id,
					...fetchedCharacter,
				}
			);

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: updatedCharacter.name,
				})
			);
		}
	}
}
