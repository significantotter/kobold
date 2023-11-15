import { default as axios } from 'axios';
import {
	ApplicationCommandType,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import { Config } from '../../../config/config.js';
import { refs } from '../../../constants/common-text.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { CharacterHelpers } from './helpers.js';

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
				creature = Creature.fromPathBuilder(
					pathBuilderChar.build,
					activeCharacter.sheetRecord
				);
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
				activeCharacter = await kobold.character.update(
					{ id: activeCharacter.id },
					{ name: creature.name }
				);
			}
			// store sheet in db
			const updatedSheetRecord = await kobold.sheetRecord.update(
				{ id: activeCharacter.sheetRecord.id },
				{
					sheet: creature._sheet,
				}
			);

			await creatureUtils.updateSheetTracker(intr, updatedSheetRecord);

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: activeCharacter.name,
				}) + newSheetUpdateWarning
			);
			return;
		}
		//otherwise wanderer's guide
		else {
			//check for token access
			const token = await kobold.wgAuthToken.read({ charId: activeCharacter.charId });

			if (!token) {
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
			let fetchedCreature: Creature;
			if (!activeCharacter.charId) {
				throw new KoboldError(
					"Yip! I couldn't find a wanderer's guide id to update your character with!"
				);
			}
			try {
				fetchedCreature = await CharacterHelpers.fetchWgCharacterFromToken(
					activeCharacter.charId,
					token.accessToken,
					activeCharacter.sheetRecord
				);
			} catch (err) {
				console.log(err);
				if ((axios.default ?? axios).isAxiosError(err) && err?.response?.status === 401) {
					//token expired!
					await kobold.wgAuthToken.delete({
						charId: activeCharacter.charId,
					});

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

			if (fetchedCreature.name !== activeCharacter.name) {
				activeCharacter = await kobold.character.update(
					{ id: activeCharacter.id },
					{ name: fetchedCreature.name }
				);
			}

			// store sheet in db
			const updatedSheetRecord = await kobold.sheetRecord.update(
				{ id: activeCharacter.sheetRecordId },
				{
					sheet: fetchedCreature._sheet,
				}
			);

			await creatureUtils.updateSheetTracker(intr, updatedSheetRecord);

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.update.interactions.success({
					characterName: activeCharacter.name,
				})
			);
		}
	}
}
