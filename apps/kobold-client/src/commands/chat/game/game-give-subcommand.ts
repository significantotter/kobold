import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, SheetBaseCounterKeys, SheetRecordTrackerModeEnum } from '@kobold/db';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { GameOptions } from './game-command-options.js';
import { Creature } from '../../../utils/creature.js';
import { GameCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class GameGiveSubCommand extends BaseCommandClass(
	GameCommand,
	GameCommand.subCommandEnum.give
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === GameOptions.GAME_TARGET_CHARACTER.name) {
			const targetCharacter =
				intr.options.getString(GameOptions.GAME_TARGET_CHARACTER.name) ?? '';

			const { gameUtils } = new KoboldUtils(kobold);
			const activeGame = await gameUtils.getActiveGame(intr.user.id, intr.guildId ?? '');
			return gameUtils.autocompleteGameCharacter(targetCharacter, activeGame);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const sheetStyle =
			intr.options.getString(GameOptions.GAME_SHEET_STYLE.name) ??
			SheetRecordTrackerModeEnum.counters_only;
		const targetCharacterName = intr.options.getString(
			GameOptions.GAME_TARGET_CHARACTER.name,
			true
		);
		const option = _.camelCase(
			intr.options.getString(GameOptions.GAME_GIVE_OPTION.name, true)
		) as SheetBaseCounterKeys;

		const unparsedValue = intr.options.getString(GameOptions.GAME_GIVE_AMOUNT.name, true);
		const value = `+${unparsedValue.trim()}`.replaceAll('++', '+').replaceAll('+-', '-');

		const koboldUtils = new KoboldUtils(kobold);
		const { gameplayUtils } = koboldUtils;
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

			const { initialValue, updatedValue } = await gameplayUtils.setGameplayStats(
				intr,
				character.sheetRecord,
				creature,
				option,
				value
			);
			if (initialValue == null || updatedValue == null) {
				embeds.push(
					new KoboldEmbed({
						description: `Yip! Something went wrong! I couldn't update the property ${option} to ${value} for ${character.name}.`,
					})
				);
			}
			let optionText = _.kebabCase(option).replaceAll('-', ' ');
			if (optionText.charAt(optionText.length - 1) === 's')
				optionText = optionText.slice(0, -1) + '(s)';
			let message = `Yip! I gave ${updatedValue! - initialValue!} ${optionText} to ${character.name}! New total: ${updatedValue}`;
			let maxValue = creature.sheet.baseCounters[option].max;
			if (maxValue) message += `/${maxValue}`;

			embeds.push(new KoboldEmbed({ description: message }));
		}
		await InteractionUtils.send(intr, { embeds });
	}
}
