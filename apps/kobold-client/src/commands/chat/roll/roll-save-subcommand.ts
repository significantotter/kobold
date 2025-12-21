import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { Command } from '../../index.js';
import { StringUtils } from '@kobold/base-utils';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;

export class RollSaveSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.save
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.saveChoice].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.saveChoice].name) ?? '';

			//get the active character
			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchDataForCommand(intr, {
				activeCharacter: true,
			});
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedSaves = FinderHelpers.matchAllSaves(
				new Creature(activeCharacter.sheetRecord, undefined, intr),
				match
			).map(save => ({
				name: save.name,
				value: save.name,
			}));
			//return the matched saves
			return matchedSaves;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const saveChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.saveChoice].name,
			true
		);
		const modifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.rollModifier].name) ?? '';
		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name) ?? '';

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);

		const targetRoll = StringUtils.findBestValueByKeyMatch(
			saveChoice,
			creature.savingThrowRolls
		);

		const rollResult = await RollBuilder.fromSimpleCreatureRoll({
			actorName: creature.sheet.staticInfo.name,
			creature,
			attributeName: targetRoll.name,
			rollNote,
			modifierExpression,
			userSettings,
		});

		const embed = rollResult.compileEmbed();

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeCharacter.game?.gmUserId);
	}
}
