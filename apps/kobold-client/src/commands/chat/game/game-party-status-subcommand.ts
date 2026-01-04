import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, SheetRecordTrackerModeEnum } from '@kobold/db';

import _ from 'lodash';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { Creature } from '../../../utils/creature.js';
import { GameDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = GameDefinition.options;
const commandOptionsEnum = GameDefinition.commandOptionsEnum;

export class GamePartyStatusSubCommand extends BaseCommandClass(
	GameDefinition,
	GameDefinition.subCommandEnum.partyStatus
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const targetCharacter =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const sheetStyle =
			intr.options.getString(commandOptions[commandOptionsEnum.sheetStyle].name) ??
			SheetRecordTrackerModeEnum.counters_only;
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const koboldUtils = new KoboldUtils(kobold);
		const { activeGame } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeGame: true,
		});

		if (activeGame.characters.length === 0) {
			await InteractionUtils.send(
				intr,
				`You have no characters in this game. Have players join using \`/game manage manage-option:join manage-value:${activeGame.name}\`.`
			);
			return;
		}

		const embeds: KoboldEmbed[] = [];
		for (const character of _.uniqBy(activeGame.characters, 'id')) {
			if (
				targetCharacterName !== 'All Players' &&
				targetCharacterName.toLocaleLowerCase().trim().length > 0 &&
				targetCharacterName.toLocaleLowerCase().trim() !==
					character.name.toLocaleLowerCase().trim()
			) {
				continue;
			}

			const creature = new Creature(character.sheetRecord, undefined, intr);
			embeds.push(creature.compileEmbed('Sheet', sheetStyle));
		}
		await InteractionUtils.send(intr, { embeds });
	}
}
