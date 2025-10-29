import { ChatInputCommandInteraction } from 'discord.js';
import { ActionCostEnum, ActionTypeEnum, Kobold } from '@kobold/db';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionOptions } from './action-command-options.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { BaseCommandClass } from '../../command.js';
import { ActionCommand } from '@kobold/documentation';

export class ActionCreateSubCommand extends BaseCommandClass(
	ActionCommand,
	ActionCommand.subCommandEnum.create
) {
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
		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		if (description && !InputParseUtils.isValidString(description, { maxLength: 300 })) {
			throw new KoboldError(
				`Yip! The counter group description must be less than 300 characters!`
			);
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
