import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { InitiativeBuilder } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitJumpToSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.jumpTo
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.initCharacter].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(
				commandOptions[commandOptionsEnum.initCharacter].name
			);
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return autocompleteUtils.getAllInitMembers(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.initCharacter].name,
			true
		);
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				userSettings: true,
			});

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			userSettings,
		});
		const currentTurn = initBuilder.getCurrentTurnInfo();
		const targetTurn = initBuilder.getJumpToTurnChanges(targetCharacterName);

		const updatedInitiative = await kobold.initiative.update(
			{ id: currentInitiative.id },
			{
				currentTurnGroupId: targetTurn.currentTurnGroupId,
			}
		);
		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder);
		const activeGroup = initBuilder.activeGroup;

		await InteractionUtils.send(intr, {
			content: activeGroup ? `<@!${activeGroup.userId}>` : undefined,
			embeds: [currentTurnEmbed],
		});
		if (_.some(initBuilder.activeActors, actor => actor.hideStats)) {
			await KoboldEmbed.dmInitiativeWithHiddenStats({
				intr,
				initBuilder,
				currentTurn,
				targetTurn,
			});
		}
	}
}
