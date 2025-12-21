import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { TextParseHelpers } from '../../../utils/kobold-helpers/text-parse-helpers.js';
import { Command } from '../../index.js';
import { WgCharacterFetcher } from './Fetchers/wg-character-fetcher.js';
import { CharacterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export class CharacterImportWanderersGuideSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.importWanderersGuide
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const url = intr.options
			.getString(commandOptions[commandOptionsEnum.wgUrl].name, true)
			.trim();
		let charId = TextParseHelpers.parseCharacterIdFromText(url);
		if (charId === null) {
			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.importWanderersGuide.invalidUrl({
					url,
				})
			);
			return;
		}
		const fetcher = new WgCharacterFetcher(intr, kobold, intr.user.id);
		const newCharacter = await fetcher.create({ charId });

		//send success message

		await InteractionUtils.send(
			intr,
			CharacterDefinition.strings.importWanderersGuide.success({
				characterName: newCharacter.name,
			})
		);
	}
}
