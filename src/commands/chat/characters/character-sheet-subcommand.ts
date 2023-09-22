import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Creature } from '../../../utils/creature.js';
import { UsingData } from '../../command.js';
import { ZCharacter } from '../../../services/kobold/models/character/character.model.js';

export class CharacterSheetSubCommand
	extends UsingData({ activeCharacter: true })
	implements Command
{
	public names = [L.en.commands.character.sheet.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.character.sheet.name(),
		description: L.en.commands.character.sheet.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ activeCharacter }: { activeCharacter: ZCharacter }
	): Promise<void> {
		// const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		const creature = Creature.fromZCharacter(activeCharacter);
		const embed = creature.compileSheetEmbed();

		await InteractionUtils.send(intr, embed);
	}
}
