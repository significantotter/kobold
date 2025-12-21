import { ChatInputCommandInteraction } from 'discord.js';

import { Kobold } from '@kobold/db';

import _ from 'lodash';
import { InteractionUtils } from '../../../utils/index.js';
import { Command } from '../../index.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';
import { BaseCommandClass } from '../../command.js';
import { CharacterDefinition } from '@kobold/documentation';
const commandOptions = CharacterDefinition.options;
const commandOptionsEnum = CharacterDefinition.commandOptionsEnum;

export class CharacterImportPathbuilderSubCommand extends BaseCommandClass(
	CharacterDefinition,
	CharacterDefinition.subCommandEnum.importPathbuilder
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const jsonId = intr.options.getNumber(
			commandOptions[commandOptionsEnum.pathbuilderJsonId].name,
			true
		);
		const useStamina =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.useStamina].name) ?? false;
		if (!_.isInteger(jsonId) || jsonId < 1) {
			await InteractionUtils.send(
				intr,
				CharacterDefinition.strings.importPathbuilder.invalidUrl({
					id: String(jsonId),
				})
			);
			return;
		}
		const fetcher = new PathbuilderCharacterFetcher(intr, kobold, intr.user.id, { useStamina });
		const newCharacter = await fetcher.create({ jsonId });

		//send success message

		await InteractionUtils.send(
			intr,
			CharacterDefinition.strings.importPathbuilder.success({
				characterName: newCharacter.name,
			})
		);
	}
}
