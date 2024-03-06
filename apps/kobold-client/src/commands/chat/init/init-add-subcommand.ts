import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

import _ from 'lodash';
import { ChatArgs } from '../../../constants/chat-args.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from 'kobold-db';
import { CompendiumModel } from 'pf2etools-data';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { NpcUtils } from '../../../utils/kobold-service-utils/npc-utils.js';
import {
	applyStatOverrides,
	convertBestiaryCreatureToSheet,
} from '../../../utils/sheet/sheet-import-utils.js';
import { SheetProperties } from '../../../utils/sheet/sheet-properties.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

export class InitAddSubCommand implements Command {
	public names = [L.en.commands.init.add.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.add.name(),
		description: L.en.commands.init.add.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold, compendium }: { kobold: Kobold; compendium: CompendiumModel }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return [];
		if (option.name === InitOptions.INIT_CREATURE_OPTION.name) {
			const match = intr.options.getString(InitOptions.INIT_CREATURE_OPTION.name);
			const { autocompleteUtils } = new KoboldUtils(kobold);
			const npcs = await autocompleteUtils.getBestiaryCreatures(
				intr,
				compendium,
				match ?? ''
			);
			if (npcs.length > 20) {
				npcs.unshift({ name: 'Custom NPC', value: 'Custom NPC' });
			} else {
				const sorter = StringUtils.generateSorterByWordDistance<{
					name: string;
					value: string;
				}>(match ?? '', c => c.name);
				npcs.sort(sorter);
				npcs.push({ name: 'Custom NPC', value: 'Custom NPC' });
				return npcs;
			}
			return npcs;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold, compendium }: { kobold: Kobold; compendium: CompendiumModel }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				userSettings: true,
			});

		let actorName = intr.options.getString(InitOptions.ACTOR_NAME_OPTION.name);
		const targetCreature = intr.options.getString(InitOptions.INIT_CREATURE_OPTION.name, true);
		const customStatsString = intr.options.getString(InitOptions.INIT_CUSTOM_STATS_OPTION.name);
		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const hideStats = intr.options.getBoolean(InitOptions.INIT_HIDE_STATS_OPTION.name) ?? true;
		const template = (intr.options.getString(InitOptions.INIT_ADD_TEMPLATE_OPTION.name) ?? '')
			.trim()
			.toLocaleLowerCase();

		let sheet = SheetProperties.defaultSheet;
		let referenceNpcName: string | null = null;

		if (targetCreature.toLowerCase().trim() != 'custom npc') {
			const npcNameSourceRegex = /(.*) \((.*)\)/;
			const [fullMatch, matchedName, matchedSource] =
				npcNameSourceRegex.exec(targetCreature) ?? [];
			let name = targetCreature;
			let source = undefined;
			if (matchedName && matchedSource) {
				name = matchedName;
				source = matchedSource;
			}
			const { bestiaryCreature, bestiaryCreatureFluff } =
				await NpcUtils.fetchCompendiumCreatureData(intr, compendium, name, source);

			sheet = convertBestiaryCreatureToSheet(bestiaryCreature, bestiaryCreatureFluff, {
				useStamina: false,
				template,
				customName: actorName || undefined,
			});
			referenceNpcName = bestiaryCreature.name;

			if (!actorName)
				actorName = (template ? `${_.capitalize(template)} ` : '') + bestiaryCreature.name;
		}

		if (!actorName) actorName = 'unnamed enemy';
		sheet = _.merge(sheet, { staticInfo: { name: actorName } });

		let finalName: string = actorName;

		if (customStatsString) {
			sheet = applyStatOverrides(sheet, customStatsString);
			const creature = new Creature(sheet, {
				actions: [],
				rollMacros: [],
				modifiers: [],
			});
			creature.recover();
			sheet = creature._sheet;
		}

		let nameCount = 1;
		let existingName = currentInitiative.actors.find(
			actor => actor.name.toLowerCase() === finalName.toLowerCase()
		);

		if (existingName) {
			while (
				currentInitiative.actors.find(
					actor => actor.name.toLowerCase() === finalName.toLowerCase()
				)
			) {
				finalName = actorName + `-${nameCount++}`;
			}
		}

		const sheetRecord = await kobold.sheetRecord.create({ sheet });

		let finalInitiative = 0;
		let rollResultMessage: EmbedBuilder;

		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					L.en.commands.init.add.interactions.joinedEmbed.joinedTitle({
						actorName: finalName,
					})
				)
				.setDescription(
					L.en.commands.init.add.interactions.joinedEmbed.description({
						finalInitiative,
					})
				);
		} else {
			const creature = Creature.fromSheetRecord(sheetRecord);
			const rollBuilder = new RollBuilder({
				title: L.en.commands.init.add.interactions.joinedEmbed.rolledTitle({
					actorName: finalName,
				}),
				userSettings,
				LL,
			});
			rollBuilder.addRoll({
				rollExpression: DiceUtils.buildDiceExpression(
					'd20',
					String(creature.statBonuses.perception || 0),
					diceExpression
				),
				tags: ['skill', 'perception', 'initiative'],
			});
			finalInitiative = rollBuilder.getRollTotalArray()[0] || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		}

		const newActorGroup = await kobold.initiativeActorGroup.create({
			initiativeId: currentInitiative.id,
			userId: intr.user.id,
			name: actorName,
			initiativeResult: finalInitiative,
		});

		const newActor = await kobold.initiativeActor.create({
			initiativeId: currentInitiative.id,
			sheetRecordId: sheetRecord.id,
			name: actorName,
			userId: intr.user.id,
			referenceNpcName,
			hideStats,
			initiativeActorGroupId: newActorGroup.id,
		});
		newActor.actorGroup = newActorGroup;
		newActor.initiative = currentInitiative;
		newActorGroup.actors.push(newActor);
		newActorGroup.initiative = currentInitiative;
		currentInitiative.actorGroups.push(newActorGroup);
		currentInitiative.actors.push(newActor);

		const initBuilder = new InitiativeBuilder({
			initiative: currentInitiative,
			actors: currentInitiative.actors,
			groups: currentInitiative.actorGroups,
		});
		await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
		await InteractionUtils.send(intr, rollResultMessage);
	}
}
