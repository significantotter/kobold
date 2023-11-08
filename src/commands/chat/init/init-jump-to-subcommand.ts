import { KoboldEmbed } from './../../../utils/kobold-embed-utils.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-builder.js';
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
import { Command, CommandDeferType } from '../../index.js';
import _ from 'lodash';
import { Initiative, InitiativeModel } from '../../../services/kobold/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { InitOptions } from './init-command-options.js';
import { SettingsUtils } from '../../../utils/kobold-service-utils/user-settings-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';

export class InitJumpToSubCommand implements Command {
	public names = [L.en.commands.init.jumpTo.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.jumpTo.name(),
		description: L.en.commands.init.jumpTo.description(),
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
			return AutocompleteUtils.getAllInitMembers(intr, match);
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
		const [currentInit, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			SettingsUtils.getSettingsForUser(intr),
		]);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			userSettings,
			LL,
		});
		const currentTurn = initBuilder.getCurrentTurnInfo();
		const targetTurn = initBuilder.getJumpToTurnChanges(targetCharacterName);

		const updatedInitiative = await InitiativeModel.query()
			.patchAndFetchById(initBuilder.init.id, {
				currentTurnGroupId: targetTurn.currentTurnGroupId,
			})
			.withGraphFetched('[actors.[character], actorGroups]');

		initBuilder.set({
			initiative: updatedInitiative,
			actors: updatedInitiative.actors,
			groups: updatedInitiative.actorGroups,
		});

		const currentTurnEmbed = await KoboldEmbed.turnFromInitiativeBuilder(initBuilder);
		const activeGroup = initBuilder.activeGroup;

		await InteractionUtils.send(intr, {
			content: activeGroup ? `<@!${activeGroup.userId}>` : undefined,
			embeds: [currentTurnEmbed],
		});
		if (_.some(initBuilder.activeActors, actor => actor.hideStats)) {
			await KoboldEmbed.dmInitiativeWithHiddenStats({
				intr,
				initBuilder,
				currentTurn,
				targetTurn,
				LL,
			});
		}
	}
}
