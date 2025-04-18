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
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import {
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	DefaultCompendiumEnum,
	Kobold,
	RollTypeEnum,
	Sheet,
	SheetAdjustmentTypeEnum,
} from '@kobold/db';
import {
	AbilityEntry,
	CompendiumEmbedParser,
	Pf2eToolsCompendiumModel,
	parseActivityRaw,
} from '@kobold/pf2etools';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { NpcUtils } from '../../../utils/kobold-service-utils/npc-utils.js';
import { convertPf2eToolsCreatureToSheet } from '../../../utils/sheet/sheet-import-pf2etools.js';
import { SheetProperties } from '../../../utils/sheet/sheet-properties.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { getEmoji } from '../../../constants/emoji.js';
import { filterNotNullOrUndefined } from '../../../utils/type-guards.js';
import { StringUtils } from '@kobold/base-utils';
import { NethysDb } from '@kobold/nethys';
import { NethysSheetImporter } from '../../../utils/sheet/sheet-import-nethys.js';
import { RollOptions } from '../roll/roll-command-options.js';

export class InitAddSubCommand implements Command {
	public name = L.en.commands.init.add.name();
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
		{
			kobold,
			pf2eToolsCompendium,
			nethysCompendium,
		}: {
			kobold: Kobold;
			pf2eToolsCompendium: Pf2eToolsCompendiumModel;
			nethysCompendium: NethysDb;
		}
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return [];
		if (option.name === InitOptions.INIT_CREATURE_OPTION.name) {
			const match = intr.options.getString(InitOptions.INIT_CREATURE_OPTION.name);
			const { autocompleteUtils, userSettingsUtils } = new KoboldUtils(kobold);
			const userSettings = await userSettingsUtils.getSettingsForUser(intr);
			let searchResults: { name: string; value: string }[] = [];
			if (userSettings.defaultCompendium === DefaultCompendiumEnum.pf2etools) {
				searchResults = await autocompleteUtils.getPf2eToolsBestiaryCreatures(
					intr,
					pf2eToolsCompendium,
					match ?? ''
				);
			} else {
				searchResults = await autocompleteUtils.getNethysBestiaryCreatures(
					nethysCompendium,
					match ?? ''
				);
			}
			if (searchResults.length > 20) {
				searchResults.unshift({ name: 'Custom NPC', value: 'Custom NPC' });
			} else {
				const sorter = StringUtils.generateSorterByWordDistance<{
					name: string;
					value: string;
				}>(match ?? '', c => c.name);
				searchResults.sort(sorter);
				searchResults.push({ name: 'Custom NPC', value: 'Custom NPC' });
				return searchResults;
			}
			return searchResults;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{
			kobold,
			pf2eToolsCompendium,
			nethysCompendium,
		}: {
			kobold: Kobold;
			pf2eToolsCompendium: Pf2eToolsCompendiumModel;
			nethysCompendium: NethysDb;
		}
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
		const diceExpression = intr.options.getString(RollOptions.ROLL_EXPRESSION_OPTION.name);
		const hideStats = intr.options.getBoolean(InitOptions.INIT_HIDE_STATS_OPTION.name) ?? true;
		const template = (intr.options.getString(InitOptions.INIT_ADD_TEMPLATE_OPTION.name) ?? '')
			.trim()
			.toLocaleLowerCase();

		let sheet = SheetProperties.defaultSheet;
		const actions: Action[] = [];
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
			if (userSettings.defaultCompendium === DefaultCompendiumEnum.pf2etools) {
				const { bestiaryCreature, bestiaryCreatureFluff } =
					await NpcUtils.fetchPf2eToolsCompendiumCreatureData(
						intr,
						pf2eToolsCompendium,
						name,
						source
					);

				const compendiumEmbedParser = new CompendiumEmbedParser(
					pf2eToolsCompendium,
					emojiData => getEmoji(intr, emojiData)
				);
				sheet = convertPf2eToolsCreatureToSheet(bestiaryCreature, bestiaryCreatureFluff, {
					useStamina: false,
					template,
					customName: actorName || undefined,
				});
				referenceNpcName = bestiaryCreature.name;

				// convert bestiary abilities to sheet abilities
				// TODO: this should be moved to a utility function
				const allAbilities = [
					bestiaryCreature.abilities?.top,
					bestiaryCreature.abilities?.mid,
					bestiaryCreature.abilities?.bot,
				]
					.flat()
					.filter(filterNotNullOrUndefined);

				for (const ability of allAbilities) {
					const actionCost: ActionCostEnum =
						'activity' in ability
							? (compendiumEmbedParser.entryParser.parseActivity(
									ability.activity!,
									false
								) as ActionCostEnum)
							: ActionCostEnum.none;
					const title = ability.name ?? 'Ability';
					actions.push({
						type: ActionTypeEnum.other,
						name: title,
						description: null,
						actionCost: actionCost,
						baseLevel: null,
						autoHeighten: false,
						tags: [],
						rolls: [
							{
								name: 'Details',
								type: RollTypeEnum.text,
								defaultText: compendiumEmbedParser.entryParser.parseEntries(
									ability.entries ?? []
								),
								allowRollModifiers: false,
								criticalSuccessText: null,
								successText: null,
								failureText: null,
								criticalFailureText: null,
								extraTags: [],
							},
						],
					});
				}
				if (!actorName) {
					actorName =
						(template ? `${_.capitalize(template)} ` : '') + bestiaryCreature.name;
				}
			} else {
				const { bestiaryCreature, bestiaryCreatureFamily } =
					await NpcUtils.fetchNethysCompendiumCreatureData(nethysCompendium, name);

				const nethysSheetImporter = new NethysSheetImporter(bestiaryCreature, {
					creatureFamilyEntry: bestiaryCreatureFamily,
					template,
					customName: actorName || undefined,
					emojiConverter: emojiData => getEmoji(intr, emojiData),
				});
				sheet = await nethysSheetImporter.buildSheet();
				const newActions = await nethysSheetImporter.buildActions();
				actions.push(...newActions);
				referenceNpcName = bestiaryCreature.name;
				if (!actorName) {
					actorName =
						(template ? `${_.capitalize(template)} ` : '') + bestiaryCreature.name;
				}
			}
		}

		if (!actorName) actorName = 'unnamed enemy';
		sheet = _.merge(sheet, { staticInfo: { name: actorName } });

		let finalName: string = actorName;

		if (customStatsString) {
			// treat the stat override string as just a bunch of sheet modifier adjustments
			const adjustments = SheetUtils.stringToSheetAdjustments(
				customStatsString,
				SheetAdjustmentTypeEnum.untyped
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

			const creature = new Creature(
				{
					sheet: adjustedSheet,
					actions,
					rollMacros: [],
					modifiers: [],
					conditions: [],
				},
				undefined,
				intr
			);
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
				sheet.staticInfo.name = finalName;
			}
		}

		const sheetRecord = await kobold.sheetRecord.create({ sheet, actions });

		let finalInitiative = 0;
		let rollResultMessage: EmbedBuilder;

		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setSheetRecord(sheetRecord)
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
			const creature = new Creature(sheetRecord, undefined, intr);
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
			rollResultMessage = rollBuilder.compileEmbed().setSheetRecord(sheetRecord);
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
