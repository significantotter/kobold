import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import {
	Action,
	Kobold,
	NewAction,
	SheetAdjustmentTypeEnum,
	GameSystemEnum,
	isGameSystemEnum,
} from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { SheetProperties } from '../../../utils/sheet/sheet-properties.js';
import { SheetUtils } from '../../../utils/sheet/sheet-utils.js';
import { Creature } from '../../../utils/creature.js';
import { NethysDb } from '@kobold/nethys';
import { NpcUtils } from '../../../utils/kobold-service-utils/npc-utils.js';
import { NethysSheetImporter } from '../../../utils/sheet/sheet-import-nethys.js';
import { getEmoji } from '../../../constants/emoji.js';
import { StringUtils } from '@kobold/base-utils';
import { Config } from '@kobold/config';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionCreateSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.create
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

		if (option.name === commandOptions[commandOptionsEnum.creature].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.creature].name);
			const gameSystemOverride = intr.options.getString(
				commandOptions[commandOptionsEnum.gameSystem].name
			);
			const koboldUtils = new KoboldUtils(kobold);
			const userSettings = await koboldUtils.userSettingsUtils.getSettingsForUser(intr);
			const gameSystem =
				(isGameSystemEnum(gameSystemOverride) ? gameSystemOverride : null) ??
				userSettings.gameSystem ??
				GameSystemEnum.pf2e;
			const { autocompleteUtils } = koboldUtils;
			let searchResults: { name: string; value: string }[] = [];

			searchResults = await autocompleteUtils.getNethysBestiaryCreatures(
				nethysCompendium,
				match ?? '',
				gameSystem
			);

			const sorter = StringUtils.generateSorterByWordDistance<{
				name: string;
				value: string;
			}>(match ?? '', c => c.name);
			searchResults.sort(sorter);

			return searchResults.slice(0, 25);
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
		const { activeCharacter, userSettings } = await koboldUtils.fetchNonNullableDataForCommand(
			intr,
			{
				activeCharacter: true,
				userSettings: true,
			}
		);
		const gameSystemOverride = intr.options.getString(
			commandOptions[commandOptionsEnum.gameSystem].name
		);
		const gameSystem =
			(isGameSystemEnum(gameSystemOverride) ? gameSystemOverride : null) ??
			userSettings.gameSystem ??
			GameSystemEnum.pf2e;

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name)
			?.trim();
		const statsInput = intr.options.getString(commandOptions[commandOptionsEnum.stats].name);
		const creatureInput = intr.options.getString(
			commandOptions[commandOptionsEnum.creature].name
		);
		const template = (
			intr.options.getString(commandOptions[commandOptionsEnum.template].name) ?? ''
		)
			.trim()
			.toLowerCase();
		const autoJoinInitiative =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.autoJoinInitiative].name) ??
			true;

		// Either name or creature must be provided
		if (!minionName && !creatureInput) {
			throw new KoboldError(
				'Yip! You must provide either a name or a creature from the bestiary!'
			);
		}

		let sheet = SheetProperties.defaultSheet;
		const actions: NewAction[] = [];
		let finalName = minionName ?? '';

		// If a creature is specified, import from bestiary
		if (creatureInput) {
			const npcNameSourceRegex = /(.*) \((.*)\)/;
			const [fullMatch, matchedName, matchedSource] =
				npcNameSourceRegex.exec(creatureInput) ?? [];
			let name = creatureInput;
			let source = undefined;
			if (matchedName && matchedSource) {
				name = matchedName;
				source = matchedSource;
			}

			const { bestiaryCreature, bestiaryCreatureFamily } =
				await NpcUtils.fetchNethysCompendiumCreatureData(
					nethysCompendium,
					name,
					gameSystem
				);

			const baseUrl =
				gameSystem === GameSystemEnum.sf2e
					? Config.nethys.sf2eBaseUrl
					: Config.nethys.baseUrl;
			const nethysSheetImporter = new NethysSheetImporter(bestiaryCreature, {
				creatureFamilyEntry: bestiaryCreatureFamily,
				template,
				customName: minionName || undefined,
				emojiConverter: emojiData => getEmoji(intr, emojiData),
				baseUrl,
			});
			sheet = await nethysSheetImporter.buildSheet();
			const newActions = await nethysSheetImporter.buildActions(intr.user.id);
			actions.push(...newActions);

			if (!minionName) {
				finalName = (template ? `${_.capitalize(template)} ` : '') + bestiaryCreature.name;
			}
		}

		// Validate name
		if (!finalName || finalName.length === 0) {
			throw new KoboldError('Yip! You must provide a name for the minion!');
		}

		if (finalName.length > 100) {
			throw new KoboldError('Yip! The minion name must be 100 characters or less!');
		}

		// Check if a minion with this name already exists for this character
		const existingMinions = await kobold.minion.readManyLite({
			characterId: activeCharacter.id,
		});
		const existingMinion = existingMinions.find(
			(m: { name: string }) => m.name.toLowerCase() === finalName.toLowerCase()
		);
		if (existingMinion) {
			throw new KoboldError(
				`Yip! A minion named "${finalName}" already exists for ${activeCharacter.name}!`
			);
		}

		// Set the minion name on the sheet
		sheet = _.merge(sheet, { staticInfo: { name: finalName } });

		// If custom stats are provided, parse and apply them
		if (statsInput) {
			const adjustments = SheetUtils.stringToSheetAdjustments(
				statsInput,
				SheetAdjustmentTypeEnum.untyped
			);
			const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

			const creature = new Creature(
				{
					sheet: adjustedSheet,
					actions: actions as Action[],
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

		// Create a sheetRecord for the minion's sheet and relations
		const sheetRecord = await kobold.sheetRecord.create({ sheet });

		// Create actions for the minion if imported from bestiary
		for (const action of actions) {
			await kobold.action.create({
				...action,
				sheetRecordId: sheetRecord.id,
			});
		}

		// Create the minion (references sheetRecord instead of storing sheet directly)
		await kobold.minion.create({
			name: finalName,
			userId: intr.user.id,
			characterId: activeCharacter.id,
			sheetRecordId: sheetRecord.id,
			autoJoinInitiative,
		});

		const creatureInfo = creatureInput
			? ` based on ${creatureInput}${template ? ` (${template})` : ''}`
			: '';
		await InteractionUtils.send(
			intr,
			`Yip! I've created the minion "${finalName}"${creatureInfo} for ${activeCharacter.name}!`
		);
	}
}
