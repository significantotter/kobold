import { Character, CharacterModel } from '../../../services/kobold/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import _ from 'lodash';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { Creature } from '../../../utils/creature.js';
import { refs } from '../../../constants/common-text.js';
import L from '../../../i18n/i18n-node.js';

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

		//check if we have an existing character
		const pathBuilderChar = await new PathBuilder().get({ characterJsonId: jsonId });
		if (!pathBuilderChar.success) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.failedRequest({
					supportServerUrl: refs.links.support,
				})
			);
		}

		const existingCharacter = await CharacterModel.query()
			.where({
				userId: intr.user.id,
			})
			.andWhereRaw(
				'name ILIKE ?',
				(pathBuilderChar?.build?.name ?? 'unnamed character').trim()
			);

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.characterAlreadyExists({
					characterName: character.name,
				})
			);
			return;
		} else {
			// the character doesn't exist yet and we fetched it correctly
			const creature = Creature.fromPathBuilder(pathBuilderChar.build, undefined, {
				useStamina,
			});

			// set current characters owned by user to inactive state
			await CharacterModel.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await CharacterModel.query().insertAndFetch({
				name: creature.name,
				charId: jsonId,
				userId: intr.user.id,
				sheet: creature.sheet,
				isActiveCharacter: true,
				importSource: 'pathbuilder',
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.success({
					characterName: newCharacter.name,
				})
			);
		}
	}
}
