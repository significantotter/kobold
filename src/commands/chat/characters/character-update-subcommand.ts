import { Character, InitiativeActor } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ComponentType,
	ButtonStyle,
} from 'discord.js';
import { default as axios } from 'axios';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { CharacterHelpers } from './helpers.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Config } from '../../../config/config.js';
import { CharacterOptions } from './command-options.js';
import { refs } from '../../../constants/common-text.js';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { Creature } from '../../../utils/creature.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

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
		LL: TranslationFunctions
	): Promise<void> {
		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
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
					LL.commands.character.importPathbuilder.interactions.failedRequest({
						supportServerUrl: refs.links.support,
					})
				);
			}

			let creature: Creature;
			try {
				creature = Creature.fromPathBuilder(pathBuilderChar.build, activeCharacter.sheet);
			} catch (err) {
				// try to load the sheet without the previous character sheet
				// if this fails, we accept the 500 error
				creature = Creature.fromPathBuilder(pathBuilderChar.build);
			}

			if (creature.name !== activeCharacter.name) {
				// confirm the update
				const prompt = await intr.followUp({
					content:
						`**WARNING:** The character name on the target sheet ${creature.name} does not ` +
						`match your active character's name ${activeCharacter.name}. Pathbuilder only ` +
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
				const result = await CollectorUtils.collectByButton(
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
				if (result && result.value !== 'update') {
					await InteractionUtils.editReply(intr, {
						content: LL.sharedInteractions.choiceRegistered({
							choice: 'Cancel',
						}),
						components: [],
					});
					// cancel
					await InteractionUtils.send(intr, {
						content: LL.commands.character.update.interactions.canceled({
							characterName: activeCharacter.name,
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
			const updatedCharacter = await Character.query().patchAndFetchById(activeCharacter.id, {
				name: creature.sheet.info.name,
				charId: jsonId,
				userId: intr.user.id,
				sheet: creature.sheet,
				isActiveCharacter: true,
				importSource: 'pathbuilder',
			});
			await InitiativeActor.query()
				.patch({ sheet: creature.sheet })
				.where({ characterId: updatedCharacter.id });

			await updatedCharacter.updateTracker(intr, creature.sheet);

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: updatedCharacter.sheet.info.name,
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
				if ((axios.default ?? axios).isAxiosError(err) && err?.response?.status === 401) {
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
				} else if (
					(axios.default ?? axios).isAxiosError(err) &&
					err?.response?.status === 429
				) {
					await InteractionUtils.send(
						intr,
						LL.commands.character.interactions.tooManyWGRequests()
					);
					return;
				} else {
					//otherwise, something else went wrong that we want to be a real error

					console.error(err);
					throw new KoboldError(
						`Yip! Something went wrong when I tried to fetch the character update from wanderer's guide!.`
					);
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
			await InitiativeActor.query()
				.patch({ sheet: fetchedCharacter.sheet })
				.where({ characterId: updatedCharacter.id });

			await updatedCharacter.updateTracker(intr, fetchedCharacter.sheet);

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
