import { Action, Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { ActionOptions } from './action-command-options.js';
import L from '../../../i18n/i18n-node.js';

export class ActionCreateSubCommand implements Command {
	public names = [L.en.commands.action.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.create.name(),
		description: L.en.commands.action.create.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		let name = intr.options.getString(ActionOptions.ACTION_NAME_OPTION.name, true).trim();
		const description =
			intr.options.getString(ActionOptions.ACTION_DESCRIPTION_OPTION.name) ?? '';
		const type = intr.options.getString(ActionOptions.ACTION_TYPE_OPTION.name, true);
		const actionCost = intr.options.getString(ActionOptions.ACTION_ACTIONS_OPTION.name, true);
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
			] as Action[],
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
