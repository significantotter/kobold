import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';
import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CompendiumModel } from '../../../services/pf2etools/compendium.model.js';
import { CompendiumOptions } from './compendium-command-options.js';
import { CompendiumEmbedParser } from '../../../services/pf2etools/parser/compendium-parser.js';
import { getEmoji } from '../../../constants/emoji.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CompendiumUtils } from '../../../services/pf2etools/utils/compendium-utils.js';
import { Ability, Action, Creature } from '../../../services/pf2etools/models/index.js';
import { DrizzleUtils } from '../../../services/pf2etools/utils/drizzle-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

export class CompendiumSearchSubCommand implements Command {
	public names = [L.en.commands.compendium.search.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.compendium.search.name(),
		description: L.en.commands.compendium.search.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ compendium }: { compendium: CompendiumModel }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) {
			const search =
				intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true) ?? '';
			return AutocompleteUtils.searchCompendium(intr, search, compendium);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		data: any,
		{ compendium }: { compendium: CompendiumModel }
	): Promise<void> {
		const search = intr.options
			.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true)
			.trim();

		const embedParser = new CompendiumEmbedParser(compendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);

		let result: KoboldEmbed | undefined = undefined;

		if (search.toLowerCase().startsWith('ability: ')) {
			const ability = await compendium.abilities.db.query.Abilities.findFirst({
				where: DrizzleUtils.ilike(compendium.abilities.table.search, search),
			});
			if (!ability) {
				throw new KoboldError("Yip! I couldn't find that ability in the compendium.");
			}
			result = await embedParser.parseAbility(ability.data as Ability);
		} else if (search.toLowerCase().startsWith('action: ')) {
			const query = compendium.db.query.Actions.findFirst({
				where: DrizzleUtils.ilike(compendium.actions.table.search, search),
			}).toSQL();
			const action = await compendium.db.query.Actions.findFirst({
				where: DrizzleUtils.ilike(compendium.actions.table.search, search),
			});
			if (!action) {
				throw new KoboldError("Yip! I couldn't find that action in the compendium.");
			}
			result = await embedParser.parseAction(action.data as Action);
		} else if (search.toLowerCase().startsWith('creature: ')) {
			const creature = await compendium.db.query.Creatures.findFirst({
				where: DrizzleUtils.ilike(compendium.creatures.table.search, search),
			});
			if (!creature) {
				throw new KoboldError("Yip! I couldn't find that creature in the compendium.");
			}
			result = await embedParser.parseCreature(creature.data as Creature);
		} else {
			// Cut away my special search characters
			const removedPrefix = search.split(':')[1] ?? '';
			const removedEmoji = search.split('<')[0] ?? '';
			const removeParens = search.split('(')[0] ?? '';
			const {} = await CompendiumUtils.search(search, compendium);
		}
		if (!result) {
			throw new KoboldError(
				"Yip! I couldn't find any results for that search in the compendium."
			);
		}

		await result.sendBatches(intr);
	}
}
