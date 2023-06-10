import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { ActionOptions } from './action-command-options.js';

export class ActionCreateSubCommand implements Command {
	public names = [Language.LL.commands.action.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.create.name(),
		description: Language.LL.commands.action.create.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let name = (intr.options.getString(ActionOptions.ACTION_NAME_OPTION.name) ?? '').trim();
		const description =
			intr.options.getString(ActionOptions.ACTION_DESCRIPTION_OPTION.name) ?? '';
		const type = intr.options.getString(ActionOptions.ACTION_TYPE_OPTION.name);
		const actionCost = intr.options.getString(ActionOptions.ACTION_ACTIONS_OPTION.name);
		const baseLevel = intr.options.getInteger(ActionOptions.ACTION_BASE_LEVEL_OPTION.name);
		const autoHeighten =
			intr.options.getBoolean(ActionOptions.ACTION_AUTO_HEIGHTEN_OPTION.name) ?? false;
		const tags = intr.options.getString(ActionOptions.ACTION_TAGS_OPTION.name);

		// make sure the name does't already exist in the character's actions
		if (activeCharacter.getActionByName(name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.action.create.interactions.alreadyExists({
					actionName: name,
					characterName: activeCharacter.sheet.info.name,
				})
			);
			return;
		}

		await Character.query().updateAndFetchById(activeCharacter.id, {
			actions: [
				...activeCharacter.actions,
				{
					name,
					description,
					type: type,
					actionCost,
					baseLevel,
					autoHeighten,
					rolls: [],
					tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
				},
			],
		});

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.action.create.interactions.created({
				actionName: name,
				characterName: activeCharacter.sheet.info.name,
			})
		);
		return;
	}
}
