import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold } from '../../../services/kobold/index.js';

import _ from 'lodash';
import { refs } from '../../../constants/common-text.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { PathBuilder } from '../../../services/pathbuilder/index.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CharacterOptions } from './command-options.js';

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
		const koboldUtils = new KoboldUtils(kobold);

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
		const existingCharacter = await kobold.character.read({
			name: pathBuilderChar?.build?.name ?? 'unnamed character',
			userId: intr.user.id,
		});

		if (existingCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.importPathbuilder.interactions.characterAlreadyExists({
					characterName: existingCharacter.name,
				})
			);
			return;
		} else {
			// the character doesn't exist yet and we fetched it correctly
			const creature = Creature.fromPathBuilder(pathBuilderChar.build, undefined, {
				useStamina,
			});

			const sheetRecord = await kobold.sheetRecord.create({
				sheet: creature._sheet,
			});

			// store sheet in db
			const newCharacter = await kobold.character.create({
				name: creature.name,
				charId: jsonId,
				userId: intr.user.id,
				sheetRecordId: sheetRecord.id,
				isActiveCharacter: true,
				importSource: 'pathbuilder',
			});

			await kobold.character.setIsActive({
				id: newCharacter.id,
				userId: intr.user.id,
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
