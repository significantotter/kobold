import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { getEmoji } from '../../../constants/emoji.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionOptions } from './action-command-options.js';
import { ActionCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class ActionDetailSubCommand extends BaseCommandClass(
	ActionCommand,
	ActionCommand.subCommandEnum.detail
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.sheetRecord,
				match
			).map(action => ({
				name: action.name,
				value: action.name,
			}));
			//return the matched actions
			return matchedActions;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionChoice = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name, true);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const targetAction = FinderHelpers.getActionByName(
			activeCharacter.sheetRecord,
			actionChoice
		);
		if (!targetAction) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}

		const actionDetailEmbed = new KoboldEmbed();
		actionDetailEmbed.setTitle(
			` ${getEmoji(intr, targetAction.actionCost)} ${targetAction.name} (${
				targetAction.type
			})`
		);
		let description = '';
		if (targetAction.baseLevel || targetAction.autoHeighten) {
			description += `Level: ${targetAction.baseLevel || 1} ${
				targetAction.autoHeighten ? '(Auto-Heightens)' : ''
			}\n`;
		}
		description = `${targetAction.description}`;
		if (description !== '') actionDetailEmbed.setDescription(description);

		for (const roll of targetAction.rolls) {
			if (roll.type === 'attack') {
				let description = `Attack Roll\n`;
				if (roll.targetDC) description += `To hit: ${roll.roll} vs ${roll.targetDC}`;
				else {
					description += roll.roll;
				}
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'skill-challenge') {
				let description = `Skill Challenge\n`;
				if (roll.targetDC) description += `Roll: ${roll.roll} vs ${roll.targetDC}`;
				else {
					description += roll.roll;
				}
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'damage') {
				let description = ``;
				description += `\ndamage: ${roll.roll} ${roll.damageType ?? ''}`;
				if (roll.healInsteadOfDamage) description += `\n(heals instead of damaging)`;
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'advanced-damage') {
				let description = ``;
				description += `\nCritical Success: ${roll.criticalSuccessRoll ?? 'none'} ${
					roll.damageType ?? ''
				}`;
				description += `\nSuccess: ${roll.successRoll ?? 'none'} ${roll.damageType ?? ''}`;
				description += `\nFailure: ${roll.failureRoll ?? 'none'} ${roll.damageType ?? ''}`;
				description += `\nCritical Failure: ${roll.criticalFailureRoll ?? 'none'} ${
					roll.damageType ?? ''
				}`;
				if (roll.healInsteadOfDamage) description += `\n(heals instead of damaging)`;
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'text') {
				let description = ``;
				description += `\nDefault Text: ${roll.defaultText ?? 'none'}`;
				description += `\nCritical Success: ${roll.criticalSuccessText ?? 'none'}`;
				description += `\nSuccess: ${roll.successText ?? 'none'}`;
				description += `\nFailure: ${roll.failureText ?? 'none'}`;
				description += `\nCritical Failure: ${roll.criticalFailureText ?? 'none'}`;
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'save') {
				let description = ``;
				description += `\nThe target rolls: ${roll.saveRollType}`;
				description += `\nVs your: ${roll.saveTargetDC}`;
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			}
		}

		actionDetailEmbed.setFooter({ text: `rollTags: ${targetAction.tags.join(', ')}` });

		await actionDetailEmbed.sendBatches(intr);
	}
}
