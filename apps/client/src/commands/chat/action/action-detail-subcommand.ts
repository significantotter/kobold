import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { getEmoji } from '../../../constants/emoji.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionDetailSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.detail
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetAction].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetAction].name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.actions,
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.targetAction].name,
			true
		);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const targetAction = FinderHelpers.getActionByName(activeCharacter.actions, actionChoice);
		if (!targetAction) {
			await InteractionUtils.send(intr, ActionDefinition.strings.notFound);
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
		description += `${targetAction.description}`;
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
				for (const term of roll.terms) {
					const modeText = term.mode === 'healing' ? 'healing' : 'damage';
					description += `\n${modeText}: ${term.dice ?? 'none'} ${term.type ?? ''}`;
				}
				const field = { name: roll.name, value: description || 'damage: none' };
				actionDetailEmbed.addFields([field]);
			} else if (roll.type === 'advanced-damage') {
				const describeTerms = (terms: typeof roll.successTerms) =>
					terms.length
						? terms
								.map(term => {
									const modeText = term.mode === 'healing' ? 'healing' : 'damage';
									return `${term.dice ?? 'none'} ${term.type ?? ''} (${modeText})`;
								})
								.join(', ')
						: 'none';
				let description = ``;
				description += `\nCritical Success: ${describeTerms(roll.criticalSuccessTerms)}`;
				description += `\nSuccess: ${describeTerms(roll.successTerms)}`;
				description += `\nFailure: ${describeTerms(roll.failureTerms)}`;
				description += `\nCritical Failure: ${describeTerms(roll.criticalFailureTerms)}`;
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
			} else if (roll.type === 'effect') {
				let description = ``;
				description += `\nTrigger: ${roll.trigger}`;
				description += `\nCondition: ${roll.condition.name}`;
				if (roll.condition.severity !== null && roll.condition.severity !== undefined) {
					description += ` ${roll.condition.severity}`;
				}
				if (roll.condition.note) {
					description += `\nInitiative Note: ${roll.condition.note}`;
				}
				const field = { name: roll.name, value: description };
				actionDetailEmbed.addFields([field]);
			}
		}

		actionDetailEmbed.setFooter({ text: `rollTags: ${targetAction.tags.join(', ')}` });

		await actionDetailEmbed.sendBatches(intr);
	}
}
