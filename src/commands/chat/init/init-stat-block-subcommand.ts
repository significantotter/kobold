import { InitiativeActorGroup } from '../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model';
import { ChatArgs } from '../../../constants/chat-args';
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

import { EventData } from '../../../models/internal-models.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Creature } from '../../../utils/creature.js';

export class InitStatBlockSubCommand implements Command {
	public names = [Language.LL.commands.init.statBlock.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.statBlock.name(),
		description: Language.LL.commands.init.statBlock.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

			return await AutocompleteUtils.getAllControllableInitiativeActors(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);

		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		const targetActor = await InitiativeUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInit,
			targetCharacterName,
			LL
		);

		if (targetActor.errorMessage) {
			await InteractionUtils.send(intr, targetActor.errorMessage);
			return;
		}

		const actor = targetActor.actor;

		let sheetEmbed: KoboldEmbed;
		if (actor.sheet) {
			const creature = new Creature(actor.sheet);
			sheetEmbed = creature.compileSheetEmbed();
		} else {
			sheetEmbed = new KoboldEmbed();
			sheetEmbed.setTitle(actor.name);
			sheetEmbed.setDescription('No sheet found!');
		}
		await InteractionUtils.send(intr, sheetEmbed);
	}
}