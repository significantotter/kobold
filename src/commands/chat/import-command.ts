import { WanderersGuide } from './../../services/wanderers-guide/index';
import { Character } from './../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../constants/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { MessageEmbed } from 'discord.js';
import { WgToken } from '../../services/kobold/models/index.js';
import Config from './../../config/config.json';

export class ImportCommand implements Command {
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'import',
		description: `imports a Wanderer's guide character`,
		dm_permission: true,
		default_member_permissions: undefined,
		options: [
			{
				...ChatArgs.IMPORT_OPTION,
				required: true,
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		const charId = intr.options.getInteger(ChatArgs.IMPORT_OPTION.name);

		//check if we have a token
		const [tokenResults, existingCharacter] = await Promise.all([
			WgToken.query().where({ charId }),
			Character.query().where({ charId, userId: intr.user.id }),
		]);

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				`Yip! ${character.characterData.name} is already in the system! Did you mean to /update?`
			);
		} else if (!tokenResults.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				`Yip! Before you can import a character, you need to authenticate it. ` +
					`Give me permission to read your wanderer's guide character by following [this link](` +
					`https://kobold.netlify.app/.netlify/functions/oauth?characterId=${charId}). ` +
					`Then, /import your character again!`
			);
		} else {
			// We have the authentication token! Fetch the user's sheet
			const token = tokenResults[0].accessToken;

			const WGTokenApi = new WanderersGuide({ token });

			const WGApiKeyApi = new WanderersGuide({ apiKey: Config.wanderersGuide.apiKey });

			let [characterData, calculatedStats] = await Promise.all([
				// request sheet data from WG API
				await WGTokenApi.character.get(charId),
				await WGTokenApi.character.getCalculatedStats(charId),
			]);

			// fetch the names of each value referenced as an id, so we don't have to later

			const classId = characterData.classID;
			const classId2 = characterData.classID_2;
			const ancestryId = characterData.ancestryID;
			const heritageId = characterData.heritageID;
			const vHeritageId = characterData.uniHeritageID;
			const backgroundId = characterData.backgroundID;

			console.log({ classId, classId2, ancestryId, heritageId, vHeritageId, backgroundId });
			const getNameFunctions = [
				async () => {
					if (classId) {
						const response = await WGApiKeyApi.class.get(classId);
						return response.class.name;
					} else return '';
				},
				async () => {
					if (classId2) {
						const response = await WGApiKeyApi.class.get(classId2);
						return response.class.name;
					} else return '';
				},
				async () => {
					if (ancestryId) {
						const response = await WGApiKeyApi.ancestry.get(ancestryId);
						return response.ancestry.name;
					} else return '';
				},
				async () => {
					if (heritageId) {
						const response = await WGApiKeyApi.heritage.get(heritageId);
						return response.name;
					} else return '';
				},
				async () => {
					if (vHeritageId) {
						const response = await WGApiKeyApi.vHeritage.get(vHeritageId);
						return response.heritage.name;
					} else return '';
				},
				async () => {
					if (backgroundId) {
						const response = await WGApiKeyApi.background.get(backgroundId);
						return response.background.name;
					} else return '';
				},
			];

			const [
				className,
				className2,
				ancestryName,
				heritageName,
				vHeritageName,
				backgroundName,
			] = await Promise.all(
				getNameFunctions.map(async nameFn => {
					try {
						return await nameFn();
					} catch (err) {
						console.warn(err);
						//fail gracefully if we don't find the data or the API times out
						return '';
					}
				})
			);

			console.log({
				className,
				className2,
				ancestryName,
				heritageName,
				vHeritageName,
				backgroundName,
			});
			//add these name properties to the character data
			characterData = {
				...characterData,
				className,
				className2,
				ancestryName,
				heritageName,
				vHeritageName,
				backgroundName,
			};

			// set current characters owned by user to inactive state
			await Character.query()
				.update({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				charId,
				userId: intr.user.id,
				isActiveCharacter: true,
				characterData,
				calculatedStats,
			});

			//send success message

			await InteractionUtils.send(
				intr,
				`Yip! I've successfully imported ${characterData.name}!`
			);
		}
	}
}
