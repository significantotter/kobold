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
import { Character } from '../../../services/kobold/models/index.js';
import { UsingData } from '../../command.js';
import { Kobold } from '../../../services/kobold/models/koboldORM.js';
import { ZCharacter } from '../../../services/kobold/models/character/character.drizzle.js';

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
		{ activeCharacter }: { activeCharacter: Character },
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		// const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const result = activeCharacter.toJSON();
		console.log(result as ZCharacter);
		console.log(result.actions[0]);

		const creature = Creature.fromCharacter(activeCharacter);
		const embed = creature.compileSheetEmbed();

		await InteractionUtils.send(intr, embed);
	}
}
