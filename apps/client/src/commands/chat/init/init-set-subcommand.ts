import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitSetSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.initCharacter].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.initCharacter].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options
			.getString(commandOptions[commandOptionsEnum.initCharacter].name, true)
			.trim();
		const fieldToChange = intr.options
			.getString(commandOptions[commandOptionsEnum.initSetOption].name, true)
			.trim();
		const newFieldValue = intr.options
			.getString(commandOptions[commandOptionsEnum.initSetValue].name, true)
			.trim();

		if (
			!fieldToChange ||
			!['initiative', 'name', 'player-is-gm', 'hide-stats'].includes(fieldToChange)
		) {
			await InteractionUtils.send(intr, InitDefinition.strings.set.invalidOptionError);
			return;
		}
		const koboldUtils = new KoboldUtils(kobold);
		let { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const actor = await InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			targetCharacterName,
			true
		);
		const actorsInGroup = _.filter(
			currentInitiative.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);

		let finalValue: any = newFieldValue;

		// validate the updates
		if (fieldToChange === 'name') {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(intr, InitDefinition.strings.set.emptyNameError);
				return;
				//a name can't already be in the initiative
			} else if (
				currentInitiative.actors.find(
					actor => actor.name.toLowerCase() === newFieldValue.toLowerCase()
				)
			) {
				await InteractionUtils.send(intr, InitDefinition.strings.set.nameExistsError);
				return;
			}
		}

		if (fieldToChange === 'initiative') {
			if (isNaN(Number(newFieldValue))) {
				await InteractionUtils.send(intr, InitDefinition.strings.set.initNotNumberError);
				return;
			}
			finalValue = Number(newFieldValue);
		}

		if (fieldToChange === 'player-is-gm') {
			finalValue = actor.userId;
		}

		if (fieldToChange === 'hide-stats') {
			finalValue = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newFieldValue.toLocaleLowerCase().trim()
			);
		}

		// perform the updates
		if (fieldToChange === 'player-is-gm') {
			await kobold.initiative.update(
				{ id: currentInitiative.id },
				{
					gmUserId: finalValue,
				}
			);
		} else if (fieldToChange === 'initiative') {
			await kobold.initiativeActorGroup.update(
				{ id: actor.initiativeActorGroupId },
				{
					initiativeResult: finalValue,
				}
			);
		} else if (fieldToChange === 'name') {
			await kobold.initiativeActor.update({ id: actor.id }, { name: finalValue });
			if (actorsInGroup.length === 1) {
				await kobold.initiativeActorGroup.update(
					{ id: actor.initiativeActorGroupId },
					{
						name: finalValue,
					}
				);
				// if this is NOT a character's sheet, we should update
				// the name on the sheet as well.
				if (!actor.characterId) {
					actor.sheetRecord.sheet.staticInfo.name = finalValue;
					await kobold.sheetRecord.update(
						{ id: actor.sheetRecordId },
						{
							sheet: actor.sheetRecord.sheet,
						}
					);
				}
			}
		} else if (fieldToChange === 'hide-stats') {
			await kobold.initiativeActor.update(
				{ id: actor.id },
				{
					hideStats: finalValue,
				}
			);
		}

		({ currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		}));

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			InitDefinition.strings.set.successEmbed.title({
				actorName: actor.name,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
		});
		if (currentInitiative.currentRound === 0) {
			await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
		}
	}
}
