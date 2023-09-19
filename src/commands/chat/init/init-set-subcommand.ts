import { InitiativeActorGroup } from './../../../services/kobold/models/initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeUtils, InitiativeBuilder } from './../../../utils/initiative-utils.js';
import { InitiativeActor } from '../../../services/kobold/models/initiative-actor/initiative-actor.model.js';
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
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { Initiative } from '../../../services/kobold/models/index.js';
import { InitOptions } from './init-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';

export class InitSetSubCommand implements Command {
	public names = [L.en.commands.init.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.set.name(),
		description: L.en.commands.init.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			return await AutocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const targetCharacterName = intr.options
			.getString(InitOptions.INIT_CHARACTER_OPTION.name, true)
			.trim();
		const fieldToChange = intr.options
			.getString(InitOptions.ACTOR_SET_OPTION.name, true)
			.trim();
		const newFieldValue = intr.options
			.getString(InitOptions.ACTOR_SET_VALUE_OPTION.name, true)
			.trim();

		if (
			!fieldToChange ||
			!['initiative', 'name', 'player-is-gm', 'hide-stats'].includes(fieldToChange)
		) {
			await InteractionUtils.send(
				intr,
				LL.commands.init.set.interactions.invalidOptionError()
			);
			return;
		}
		let currentInit = await InitiativeUtils.getInitiativeForChannel(intr.channel);

		const actor = await InitiativeUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInit,
			targetCharacterName,
			LL,
			true
		);
		const actorsInGroup = _.filter(
			currentInit.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);

		let finalValue: any = newFieldValue;

		// validate the updates
		if (fieldToChange === targetCharacterName) {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(
					intr,
					LL.commands.init.set.interactions.emptyNameError()
				);
				return;
				//a name can't already be in the initiative
			} else if (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === newFieldValue.toLowerCase()
				)
			) {
				await InteractionUtils.send(
					intr,
					LL.commands.init.set.interactions.nameExistsError()
				);
				return;
			}
		}

		if (fieldToChange === 'initiative') {
			if (isNaN(Number(newFieldValue))) {
				await InteractionUtils.send(
					intr,
					LL.commands.init.set.interactions.initNotNumberError()
				);
				return;
			}
			finalValue = Number(newFieldValue);
		}

		if (fieldToChange === 'player-is-gm') {
			finalValue = actor.userId;
		}
		if (fieldToChange === 'hide-stats') {
			finalValue = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newFieldValue.toLocaleLowerCase().trim()
			);
		}

		// perform the updates
		if (fieldToChange === 'player-is-gm') {
			await Initiative.query().patchAndFetchById(currentInit.id, {
				gmUserId: finalValue,
			});
		} else if (fieldToChange === 'initiative') {
			await InitiativeActorGroup.query().patchAndFetchById(actor.initiativeActorGroupId, {
				initiativeResult: finalValue,
			});
		} else if (fieldToChange === 'name') {
			await InitiativeActor.query().patchAndFetchById(actor.id, { name: finalValue });
			if (actorsInGroup.length === 1) {
				await InitiativeActorGroup.query().patchAndFetchById(actor.initiativeActorGroupId, {
					name: finalValue,
				});
			}
		} else if (fieldToChange === 'hide-stats') {
			await InitiativeActor.query().patchAndFetchById(actor.id, { hideStats: finalValue });
		}
		currentInit = await InitiativeUtils.getInitiativeForChannel(intr.channel);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.init.set.interactions.successEmbed.title({
				actorName: actor.name,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			LL,
		});
		if (currentInit.currentRound === 0) {
			await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
		}
	}
}
