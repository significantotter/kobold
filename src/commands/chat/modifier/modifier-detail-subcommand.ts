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
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '../../../services/kobold/kobold.model.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from './modifier-command-options.js';

export class ModifierDetailSubCommand implements Command {
	public names = [L.en.commands.modifier.detail.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.detail.name(),
		description: L.en.commands.modifier.detail.description(),
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
		if (option.name === ModifierOptions.MODIFIER_NAME_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ModifierOptions.MODIFIER_NAME_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedModifiers = FinderHelpers.matchAllModifiers(
				activeCharacter.sheetRecord,
				match
			).map(modifier => ({
				name: modifier.name,
				value: modifier.name,
			}));
			//return the matched saves
			return matchedModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		let name = intr.options
			.getString(ModifierOptions.MODIFIER_NAME_OPTION.name, true)
			.trim()
			.toLowerCase();

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const modifier = FinderHelpers.getModifierByName(activeCharacter.sheetRecord, name);

		if (!modifier) {
			// no matching modifier found
			await InteractionUtils.send(intr, LL.commands.modifier.interactions.notFound());
			return;
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(
			LL.commands.modifier.interactions.detailHeader({
				modifierName: modifier.name,
				modifierIsActive: modifier.isActive ? ' (active)' : '',
			})
		);
		let modifierDescription: string;
		if (modifier.modifierType === 'roll') {
			modifierDescription = LL.commands.modifier.interactions.detailBodyRoll({
				modifierDescriptionText: modifier.description,
				modifierType: modifier.type || 'untyped',
				modifierValue: modifier.value,
				modifierTargetTags: modifier.targetTags,
			});
		} else {
			modifierDescription = LL.commands.modifier.interactions.detailBodySheet({
				modifierDescriptionText: modifier.description,
				modifierType: modifier.type || 'untyped',
				modifierSheetValues: modifier.sheetAdjustments
					.map(sheetAdjustment => {
						return `${sheetAdjustment.property} ${sheetAdjustment.operation} ${sheetAdjustment.value}`;
					})
					.join(', '),
			});
		}
		embed.setDescription(modifierDescription);

		await InteractionUtils.send(intr, { embeds: [embed] });
	}
}
