import { KoboldEmbed } from './../../../utils/kobold-embed-utils';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils';
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
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative } from '../../../services/kobold/models/index.js';

export class InitJumpToSubCommand implements Command {
	public names = ['jump_to'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'jump_to',
		description: `Jumps to a specific participant in the initiative order`,
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

			const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel);
			if (currentInitResponse.errorMessage) {
				return [];
			}
			//get the character matches
			let actorOptions = InitiativeUtils.getControllableInitiativeActors(
				currentInitResponse.init,
				//get all initiative actors
				currentInitResponse.init.gmUserId
			);
			actorOptions = actorOptions.filter(actor =>
				actor.name.toLowerCase().includes(match.toLowerCase())
			);

			//return the matched actors
			return actorOptions.map(actor => ({
				name: actor.name,
				value: actor.name,
			}));
		}
	}

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		const targetCharacterName = intr.options.getString(ChatArgs.INIT_CHARACTER_OPTION.name);
		const initResult = await InitiativeUtils.getInitiativeForChannel(intr.channel);
		if (initResult.errorMessage) {
			await InteractionUtils.send(intr, initResult.errorMessage);
			return;
		}

		const groupResponse = InitiativeUtils.getNameMatchGroupFromInitiative(
			initResult.init,
			initResult.init.gmUserId,
			targetCharacterName
		);
		if (groupResponse.errorMessage) {
			await InteractionUtils.send(intr, groupResponse.errorMessage);
			return;
		}

		const updatedInitiative = await Initiative.query()
			.updateAndFetchById(initResult.init.id, { currentTurnGroupId: groupResponse.group.id })
			.withGraphFetched('[actors.[character], actorGroups]');

		const initBuilder = new InitiativeBuilder({ initiative: updatedInitiative });
		const currentRoundMessage = await initBuilder.getCurrentRoundMessage(intr);
		const url = currentRoundMessage ? currentRoundMessage.url : '';
		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder, url);
		const activeGroup = initBuilder.activeGroup;

		await InitiativeUtils.updateInitiativeRoundMessageOrSendNew(intr, initBuilder);

		await InteractionUtils.send(intr, {
			content: `<@${activeGroup.userId}>`,
			embeds: [currentTurnEmbed],
		});
	}
}
