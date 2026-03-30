import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { ActionCostEnum, ActionTypeEnum, Kobold } from '@kobold/db';

import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { BaseCommandClass } from '../../command.js';
import { ActionDefinition } from '@kobold/documentation';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionCreateSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.create
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.createFor].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.createFor].name);
			return koboldUtils.autocompleteUtils.getCreateForOptions(intr, match ?? '');
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

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
		const createForValue = intr.options.getString(
			commandOptions[commandOptionsEnum.createFor].name
		);

		// Get user's characters and minions for parsing the create-for value
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);

		// Parse the create-for value to get the sheetRecordId
		const targetSheetRecordId = parseCreateForValue(createForValue, characters, minions);

		// Determine the target name for messages
		let targetName: string | null = null;
		if (targetSheetRecordId !== null) {
			const targetChar = characters.find(c => c.sheetRecordId === targetSheetRecordId);
			if (targetChar) {
				targetName = targetChar.name;
			} else {
				const targetMinion = minions.find(m => m.sheetRecordId === targetSheetRecordId);
				if (targetMinion) {
					targetName = targetMinion.name;
				}
			}
		}

		// Check if name already exists (either user-wide or for the specific target)
		const existingActions = await kobold.action.readManyByUser({
			userId: intr.user.id,
			filter: targetSheetRecordId === null ? 'user' : { sheetRecordId: targetSheetRecordId },
		});

		const existingAction = existingActions.find(
			a => a.name.toLowerCase() === name.toLowerCase()
		);
		if (existingAction) {
			if (targetSheetRecordId === null) {
				await InteractionUtils.send(
					intr,
					ActionDefinition.strings.create.alreadyExistsUserWide({
						actionName: name,
					})
				);
			} else {
				await InteractionUtils.send(
					intr,
					ActionDefinition.strings.create.alreadyExists({
						actionName: name,
						characterName: targetName ?? 'Unknown',
					})
				);
			}
			return;
		}

		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The action name must be less than 50 characters!`);
		}
		if (description && !InputParseUtils.isValidString(description, { maxLength: 300 })) {
			throw new KoboldError(`Yip! The action description must be less than 300 characters!`);
		}

		await kobold.action.create({
			sheetRecordId: targetSheetRecordId,
			userId: intr.user.id,
			name,
			description,
			type: type as ActionTypeEnum,
			actionCost: actionCost as ActionCostEnum,
			baseLevel,
			autoHeighten,
			rolls: [],
			tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
		});

		// Send response
		if (targetSheetRecordId === null) {
			await InteractionUtils.send(
				intr,
				ActionDefinition.strings.create.createdUserWide({
					actionName: name,
				})
			);
		} else {
			await InteractionUtils.send(
				intr,
				ActionDefinition.strings.create.created({
					actionName: name,
					characterName: targetName ?? 'Unknown',
				})
			);
		}
		return;
	}
}
