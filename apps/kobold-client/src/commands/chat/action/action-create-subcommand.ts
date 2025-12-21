import { ChatInputCommandInteraction } from 'discord.js';
import { ActionCostEnum, ActionTypeEnum, Kobold } from '@kobold/db';

import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { BaseCommandClass } from '../../command.js';
import { ActionDefinition } from '@kobold/documentation';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionCreateSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.create
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		const description =
			intr.options.getString(commandOptions[commandOptionsEnum.description].name) ?? '';
		const type = intr.options.getString(commandOptions[commandOptionsEnum.type].name, true);
		const actionCost = intr.options.getString(
			commandOptions[commandOptionsEnum.actionCost].name,
			true
		);
		const baseLevel = intr.options.getInteger(
			commandOptions[commandOptionsEnum.baseLevel].name
		);
		const autoHeighten =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.autoHeighten].name) ?? false;
		const tags = intr.options.getString(commandOptions[commandOptionsEnum.tags].name);

		// make sure the name does't already exist in the character's actions
		if (FinderHelpers.getActionByName(activeCharacter.sheetRecord, name)) {
			await InteractionUtils.send(
				intr,
				ActionDefinition.strings.create.alreadyExists({
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
			ActionDefinition.strings.create.created({
				actionName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
