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

export class CharacterimportPathbuilderSubCommand implements Command {
	public names = [Language.LL.commands.character.importPathbuilder.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.importPathbuilder.name(),
		description: Language.LL.commands.character.importPathbuilder.description(),
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
		const useStamina = intr.options.getBoolean(CharacterOptions.IMPORT_USE_STAMINA_OPTION.name);
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

		const existingCharacter = await Character.query()
			.where({
				userId: intr.user.id,
			})
			.andWhereRaw('name ILIKE ?', pathBuilderChar?.build?.name.trim());

		if (existingCharacter.length) {
			const character = existingCharacter[0];
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.characterAlreadyExists({
					characterName: character.sheet.info.name,
				})
			);
			return;
		} else {
			// the character doesn't exist yet and we fetched it correctly
			const creature = Creature.fromPathBuilder(pathBuilderChar.build, null, {
				useStamina,
			});

			// set current characters owned by user to inactive state
			await Character.query()
				.patch({ isActiveCharacter: false })
				.where({ userId: intr.user.id });

			// store sheet in db
			const newCharacter = await Character.query().insertAndFetch({
				name: creature.sheet.info.name,
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
					characterName: newCharacter.sheet.info.name,
				})
			);
		}
	}
}
