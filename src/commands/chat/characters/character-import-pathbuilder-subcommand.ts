import { Language } from '../../../models/enum-helpers/language';
import { Lang } from '../../../services/lang';
import { Character } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WgToken } from '../../../services/kobold/models/index.js';
import { CharacterHelpers } from './helpers.js';
import { Config } from '../../../config/config.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { CharacterOptions } from './command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import _ from 'lodash';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { Creature } from '../../../utils/creature.js';
import { refs } from '../../../i18n/en/common.js';

export class CharacterImportPathBuilderSubCommand implements Command {
	public names = [Language.LL.commands.character.importPathBuilder.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.importPathBuilder.name(),
		description: Language.LL.commands.character.importPathBuilder.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const jsonId = intr.options.getNumber(CharacterOptions.IMPORT_PATHBUILDER_OPTION.name);
		if (!_.isInteger(jsonId) || jsonId < 1) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathBuilder.interactions.invalidUrl({
					id: jsonId,
				})
			);
			return;
		}

		//check if we have an existing character
		const [pathBuilderChar, existingCharacter] = await Promise.all([
			new PathBuilder().get({ characterJsonId: jsonId }),
			Character.query().where({
				name: jsonId,
				importSource: 'pathbuilder',
				userId: intr.user.id,
			}),
		]);

		if (!pathBuilderChar.success) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathBuilder.interactions.failedRequest({
					supportServerUrl: refs.links.support,
				})
			);
		}

		if (false && existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathBuilder.interactions.characterAlreadyExists({
					characterName: character.sheet.info.name,
				})
			);
			return;
		} else {
			// the character doesn't exist yet and we fetched it correctly
			const creature = Creature.fromPathBuilder(pathBuilderChar.build);

			// set current characters owned by user to inactive state
			await Character.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				charId: jsonId,
				userId: intr.user.id,
				sheet: creature.sheet,
				isActiveCharacter: true,
				importSource: 'pathbuilder',
			});

			//send success message

			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathBuilder.interactions.success({
					characterName: newCharacter.sheet.info.name,
				})
			);
		}
	}
}