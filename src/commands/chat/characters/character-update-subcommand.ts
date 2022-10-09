import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { fetchWgCharacterFromToken } from './helpers.js';
import { CharacterUtils.getActiveCharacter } from '../../../utils/character-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { Lang } from '../../../services/index.js';

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
	public requireClientPerms: PermissionString[] = [];

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		//check if we have an active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//check for token access
		const token = await WgToken.query().where({ charId: activeCharacter.charId });

		if (!token.length) {
			// The user needs to authenticate!
			await InteractionUtils.send(
				intr,
				`Yip! Before you can update this character, you need to authenticate again. Sorry! ` +
					`Give me permission to read your wanderer's guide character by following [this link](` +
					`https://kobold.netlify.app/.netlify/functions/oauth?characterId=${activeCharacter.charId}). ` +
					`Then, /import your character again!`
			);
		}
		const fetchedCharacter = await fetchWgCharacterFromToken(
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
			`Yip! I've successfully updated ${updatedCharacter.characterData.name}!`
		);
	}
}
