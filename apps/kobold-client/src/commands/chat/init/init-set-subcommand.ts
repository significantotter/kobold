import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

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
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === InitOptions.INIT_CHARACTER_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(InitOptions.INIT_CHARACTER_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getInitTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
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
		const koboldUtils = new KoboldUtils(kobold);
		let { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});

		const actor = await InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			targetCharacterName,
			true
		);
		const actorsInGroup = _.filter(
			currentInitiative.actors,
			possibleActor => possibleActor.initiativeActorGroupId === actor.initiativeActorGroupId
		);

		let finalValue: any = newFieldValue;

		// validate the updates
		if (fieldToChange === 'name') {
			//a name can't be an empty string
			if (newFieldValue === '') {
				await InteractionUtils.send(
					intr,
					LL.commands.init.set.interactions.emptyNameError()
				);
				return;
				//a name can't already be in the initiative
			} else if (
				currentInitiative.actors.find(
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
			await kobold.initiative.update(
				{ id: currentInitiative.id },
				{
					gmUserId: finalValue,
				}
			);
		} else if (fieldToChange === 'initiative') {
			await kobold.initiativeActorGroup.update(
				{ id: actor.initiativeActorGroupId },
				{
					initiativeResult: finalValue,
				}
			);
		} else if (fieldToChange === 'name') {
			await kobold.initiativeActor.update({ id: actor.id }, { name: finalValue });
			if (actorsInGroup.length === 1) {
				await kobold.initiativeActorGroup.update(
					{ id: actor.initiativeActorGroupId },
					{
						name: finalValue,
					}
				);
				// if this is NOT a character's sheet, we should update
				// the name on the sheet as well.
				if (!actor.characterId) {
					actor.sheetRecord.sheet.staticInfo.name = finalValue;
					await kobold.sheetRecord.update(
						{ id: actor.sheetRecordId },
						{
							sheet: actor.sheetRecord.sheet,
						}
					);
				}
			}
		} else if (fieldToChange === 'hide-stats') {
			await kobold.initiativeActor.update(
				{ id: actor.id },
				{
					hideStats: finalValue,
				}
			);
		}

		({ currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		}));

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
			initiative: currentInitiative,
			LL,
		});
		if (currentInitiative.currentRound === 0) {
			await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
		}
	}
}
