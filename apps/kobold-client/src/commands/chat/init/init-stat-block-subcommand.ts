import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitDefinition, RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitStatBlockSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.statBlock
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
			return await autocompleteUtils.getAllControllableInitiativeActors(intr, match);
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
		const secretMessage = intr.options.getString(
			commandOptions[commandOptionsEnum.rollSecret].name
		);

		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const actor = await InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			targetCharacterName,
			true
		);

		let sheetEmbed: KoboldEmbed;
		const creature = new Creature(actor.sheetRecord, actor.name, intr);
		sheetEmbed = creature.compileEmbed('Sheet');

		await EmbedUtils.dispatchEmbeds(intr, [sheetEmbed], secretMessage || undefined);
	}
}
