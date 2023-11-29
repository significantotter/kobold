import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { PathbuilderCharacterFetcher } from './Fetchers/pathbuilder-character-fetcher.js';

export class CharacterImportPathbuilderSubCommand implements Command {
	public names = [L.en.commands.character.importPathbuilder.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.importPathbuilder.name(),
		description: L.en.commands.character.importPathbuilder.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

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
