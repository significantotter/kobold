import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { ActionCostEnum, ActionTypeEnum, Kobold } from 'kobold-db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from './action-command-options.js';

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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

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
		if (FinderHelpers.getActionByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				LL.commands.action.create.interactions.alreadyExists({
					actionName: name,
					characterName: activeCharacter.name,
				})
			);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{
				actions: [
					...activeCharacter.sheetRecord.actions,
					{
						name,
						description,
						type: type as ActionTypeEnum,
						actionCost: actionCost as ActionCostEnum,
						baseLevel,
						autoHeighten,
						rolls: [],
						tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
					},
				],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			LL.commands.action.create.interactions.created({
				actionName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
