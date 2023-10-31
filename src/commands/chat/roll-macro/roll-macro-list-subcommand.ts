import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import _ from 'lodash';

export class RollMacroListSubCommand implements Command {
	public names = [L.en.commands.rollMacro.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.list.name(),
		description: L.en.commands.rollMacro.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const rollMacros = activeCharacter.rollMacros;
		const fields = [];
		for (const rollMacro of rollMacros.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			fields.push({
				name: rollMacro.name,
				value: rollMacro.macro,
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.sheet.staticInfo.name}'s Roll Macros`);
		embed.addFields(fields);
		await embed.sendBatches(intr);
	}
}
