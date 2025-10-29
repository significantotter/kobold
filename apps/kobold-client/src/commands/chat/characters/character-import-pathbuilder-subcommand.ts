import { ChatInputCommandInteraction } from 'discord.js';
import { Kobold } from '@kobold/db';

import _ from 'lodash';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';
import { BaseCommandClass } from '../../command.js';
import { CharacterCommand } from '@kobold/documentation';

export class CharacterImportPathbuilderSubCommand extends BaseCommandClass(
	CharacterCommand,
	CharacterCommand.subCommandEnum.importPathbuilder
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const jsonId = intr.options.getNumber(
			CharacterOptions.IMPORT_PATHBUILDER_OPTION.name,
			true
		);
		const useStamina =
			intr.options.getBoolean(CharacterOptions.IMPORT_USE_STAMINA_OPTION.name) ?? false;
		if (!_.isInteger(jsonId) || jsonId < 1) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.invalidUrl({
					id: jsonId,
				})
			);
			return;
		}
		const fetcher = new PathbuilderCharacterFetcher(intr, kobold, intr.user.id, { useStamina });
		const newCharacter = await fetcher.create({ jsonId });

		//send success message

		await InteractionUtils.send(
			intr,
			LL.commands.character.importPathbuilder.interactions.success({
				characterName: newCharacter.name,
			})
		);
	}
}
