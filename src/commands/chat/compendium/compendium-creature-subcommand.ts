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
import { Pf2eToolsModel } from '../../../services/pf2etools/pf2eTools.model.js';
import { CompendiumOptions } from './compendium-command-options.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { Pf2eToolsEmbedParser } from '../../../services/pf2etools/parser/pf2etools-parser.js';
import { getEmoji } from '../../../constants/emoji.js';

export class CompendiumCreatureSubCommand implements Command {
	public names = [L.en.commands.compendium.creature.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.compendium.creature.name(),
		description: L.en.commands.compendium.creature.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ compendium }: { compendium: Pf2eToolsModel }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) {
			const search =
				intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) ?? '';

			const creatures = await compendium.creatures.collection
				.query()
				.like('name', search)
				.limit(50)
				.find();
			return creatures.map(creature => {
				return {
					name: creature.name,
					value: creature.name,
				};
			});
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		data: any,
		{ compendium }: { compendium: Pf2eToolsModel }
	): Promise<void> {
		const search = intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name);
		const creature = await compendium.creatures.collection
			.query()
			.equalTo('name', search)
			.find();
		if (creature.length == 0) {
			await InteractionUtils.send(
				intr,
				"Yip! I couldn't find that creature in the compendium."
			);
		}
		const embedParser = new Pf2eToolsEmbedParser(compendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);
		const result = await embedParser.parseCreature(creature[0]);

		await result.sendBatches(intr);
	}
}
