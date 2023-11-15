import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '../../../services/kobold/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierListSubCommand implements Command {
	public names = [L.en.commands.modifier.list.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.list.name(),
		description: L.en.commands.modifier.list.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const modifiers = activeCharacter.sheetRecord.modifiers;
		const fields = [];
		for (const modifier of modifiers.sort((a, b) => (a.name || '').localeCompare(b.name))) {
			let value: string;
			if (modifier.modifierType === 'roll') {
				value = LL.commands.modifier.interactions.detailBodyRoll({
					modifierDescriptionText: modifier.description,
					modifierType: modifier.type || 'untyped',
					modifierValue: modifier.value,
					modifierTargetTags: modifier.targetTags,
				});
			} else {
				value = LL.commands.modifier.interactions.detailBodySheet({
					modifierDescriptionText: modifier.description,
					modifierType: modifier.type || 'untyped',
					modifierSheetValues: modifier.sheetAdjustments
						.map(sheetAdjustment => {
							return `${sheetAdjustment.property} ${sheetAdjustment.operation} ${sheetAdjustment.value}`;
						})
						.join(', '),
				});
			}

			fields.push({
				name: LL.commands.modifier.interactions.detailHeader({
					modifierName: modifier.name,
					modifierIsActive: modifier.isActive ? ' (active)' : '',
				}),
				value,
				inline: true,
			});
		}

		const embeds = [];

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Available Modifiers`);
		embed.addFields(fields);

		await embed.sendBatches(intr);
	}
}
