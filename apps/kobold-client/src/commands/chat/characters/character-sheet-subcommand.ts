import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold, SheetRecordTrackerModeEnum } from 'kobold-db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameOptions } from '../game/game-command-options.js';

export class CharacterSheetSubCommand implements Command {
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const sheetStyle =
			intr.options.getString(GameOptions.GAME_SHEET_STYLE.name) ??
			SheetRecordTrackerModeEnum.full_sheet;
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		const creature = new Creature(activeCharacter.sheetRecord);
		const embed = creature.compileEmbed('Sheet', sheetStyle);

		await InteractionUtils.send(intr, embed);
	}
}
