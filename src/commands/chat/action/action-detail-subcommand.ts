import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import _ from 'lodash';
import { ActionOptions } from './action-command-options.js';
import { getEmoji } from '../../../constants/emoji.js';
import L from '../../../i18n/i18n-node.js';

export class ActionDetailSubCommand implements Command {
	public names = [L.en.commands.action.detail.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.detail.name(),
		description: L.en.commands.action.detail.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name) ?? '';

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = CharacterUtils.findPossibleActionFromString(
				activeCharacter,
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
		LL: TranslationFunctions
	): Promise<void> {
		const actionChoice = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name, true);
		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const targetAction = activeCharacter.getActionByName(actionChoice);
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
			} else if (roll.type === 'damage') {
				let description = ``;
				description += `\ndamage: ${roll.roll} ${roll.damageType ?? ''}`;
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
