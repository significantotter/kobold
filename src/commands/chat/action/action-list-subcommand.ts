import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import _ from 'lodash';

export class ActionListSubCommand implements Command {
	public names = [Language.LL.commands.action.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.list.name(),
		description: Language.LL.commands.action.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const actions = activeCharacter.actions;
		const fields = [];
		for (const action of actions.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			const fieldValue = `${action.description}\n${action.rolls.map(
				roll => `${roll.name}: ${roll.diceRoll} (${roll.tags})`
			)}`;
			fields.push({
				name: action.name,
				value: action.description || '\u200B',
				inline: true,
			});
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.characterData.name}'s Available Actions`);
		embed.addFields(fields);
		await embed.sendBatches(intr);
	}
}
