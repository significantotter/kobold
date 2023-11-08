import { ChatArgs } from '../../../constants/chat-args.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils } from '../../../utils/initiative-builder.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { Creature } from '../../../utils/creature.js';
import { InitOptions } from './init-command-options.js';

export class InitStatBlockSubCommand implements Command {
	public names = [L.en.commands.init.statBlock.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.statBlock.name(),
		description: L.en.commands.init.statBlock.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name);

			return await AutocompleteUtils.getAllControllableInitiativeActors(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options.getString(
			InitOptions.INIT_CHARACTER_OPTION.name,
			true
		);
		const secretMessage = intr.options.getString(ChatArgs.ROLL_SECRET_OPTION.name);
		const isSecretMessage =
			secretMessage === L.en.commandOptions.statBlockSecret.choices.secret.value();

		const currentInit = await InitiativeUtils.getInitiativeForChannel(intr.channel);

		const actor = await InitiativeUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInit,
			targetCharacterName,
			LL,
			true
		);

		let sheetEmbed: KoboldEmbed;
		if (actor.sheet) {
			const creature = new Creature(actor.sheet, actor.name);
			sheetEmbed = creature.compileSheetEmbed();
		} else {
			sheetEmbed = new KoboldEmbed();
			sheetEmbed.setTitle(actor.name);
			sheetEmbed.setDescription('No sheet found!');
		}
		await InteractionUtils.send(intr, sheetEmbed, isSecretMessage);
	}
}
