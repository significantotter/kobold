import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

import _ from 'lodash';
import { Action, Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { NpcUtils } from '../../../utils/kobold-service-utils/npc-utils.js';
import { SheetProperties } from '../../../utils/sheet/sheet-properties.js';
import { Command } from '../../index.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { getEmoji } from '../../../constants/emoji.js';
import { StringUtils } from '@kobold/base-utils';
import { NethysDb } from '@kobold/nethys';
import { NethysSheetImporter } from '../../../utils/sheet/sheet-import-nethys.js';
import { InitDefinition, RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;
const rollCommandOptions = RollDefinition.options;
const rollCommandOptionsEnum = RollDefinition.commandOptionsEnum;

export class InitAddSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.add
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{
			kobold,
			nethysCompendium,
		}: {
			kobold: Kobold;
			nethysCompendium: NethysDb;
		}
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return [];
		if (option.name === commandOptions[commandOptionsEnum.initCreature].name) {
			const match = intr.options.getString(
				commandOptions[commandOptionsEnum.initCreature].name
			);
			const { autocompleteUtils } = new KoboldUtils(kobold);
			let searchResults: { name: string; value: string }[] = [];

			searchResults = await autocompleteUtils.getNethysBestiaryCreatures(
				nethysCompendium,
				match ?? ''
			);
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
		{
			kobold,
			nethysCompendium,
		}: {
			kobold: Kobold;
			nethysCompendium: NethysDb;
		}
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				userSettings: true,
			});

		let actorName = intr.options.getString(commandOptions[commandOptionsEnum.initActor].name);
		const targetCreature = intr.options.getString(
			commandOptions[commandOptionsEnum.initCreature].name,
			true
		);
		const customStatsString = intr.options.getString(
			commandOptions[commandOptionsEnum.initCustomStats].name
		);
		const initiativeValue = intr.options.getNumber(
			commandOptions[commandOptionsEnum.initValue].name
		);
		const diceExpression = intr.options.getString(
			rollCommandOptions[rollCommandOptionsEnum.rollExpression].name
		);
		const hideStats =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.initHideStats].name) ?? true;
		const template = (
			intr.options.getString(commandOptions[commandOptionsEnum.template].name) ?? ''
		)
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
				actorName = (template ? `${_.capitalize(template)} ` : '') + bestiaryCreature.name;
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
					InitDefinition.strings.add.joinedEmbed.joinedTitle({
						actorName: finalName,
					})
				)
				.setDescription(
					InitDefinition.strings.add.joinedEmbed.description({
						finalInitiative,
					})
				);
		} else {
			const creature = new Creature(sheetRecord, undefined, intr);
			const rollBuilder = new RollBuilder({
				title: InitDefinition.strings.add.joinedEmbed.rolledTitle({
					actorName: finalName,
				}),
				userSettings,
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
