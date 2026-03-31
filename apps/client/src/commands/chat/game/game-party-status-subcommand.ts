import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, MinionWithRelations } from '@kobold/db';

import _ from 'lodash';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { Creature } from '../../../utils/creature.js';
import { GameDefinition, sharedStrings } from '@kobold/documentation';
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
			sharedStrings.options.sheetStyles.countersOnly;
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils } = koboldUtils;
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

		// Resolve targets (can be characters, minions, or both for "All Players")
		const { characters, minions } = await gameUtils.getGameTargets(
			targetCharacterName,
			activeGame
		);

		// For "All Players", get all minions for the characters in the game
		const characterIds = characters.map(c => c.id);
		const characterMinions =
			targetCharacterName === 'All Players' && characterIds.length > 0
				? await kobold.minion.readManyByCharacterIds({ characterIds })
				: [];

		const embeds: KoboldEmbed[] = [];

		// Process characters and their minions
		for (const character of _.uniqBy(characters, 'id')) {
			const creature = Creature.fromSheetRecord(character, undefined, intr);
			embeds.push(creature.compileEmbed('Sheet', sheetStyle));

			// Add minion statblocks after the character (for "All Players")
			if (targetCharacterName === 'All Players') {
				const minionsForChar = characterMinions.filter(
					(m: MinionWithRelations) => m.characterId === character.id
				);
				for (const minion of minionsForChar) {
					const minionCreature = Creature.fromSheetRecord(
						minion,
						`${minion.name} (${character.name}'s minion)`,
						intr
					);
					embeds.push(minionCreature.compileEmbed('Sheet', sheetStyle));
				}
			}
		}

		// Process directly targeted minions
		for (const minion of _.uniqBy(minions, 'id')) {
			const parentCharacter = activeGame.characters.find(c => c.id === minion.characterId);
			const displayName = parentCharacter
				? `${minion.name} (${parentCharacter.name}'s minion)`
				: minion.name;

			const minionCreature = Creature.fromSheetRecord(minion, displayName, intr);
			embeds.push(minionCreature.compileEmbed('Sheet', sheetStyle));
		}

		if (embeds.length === 0) {
			await InteractionUtils.send(intr, 'Yip! No targets found matching that selection.');
			return;
		}

		await InteractionUtils.send(intr, { embeds });
	}
}
