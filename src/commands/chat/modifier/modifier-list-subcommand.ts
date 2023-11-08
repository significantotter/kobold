import { KoboldEmbed } from './../../../utils/kobold-embed-utils.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import L from '../../../i18n/i18n-node.js';
import { CharacterUtils } from '../../../utils/kobold-service-utils/character-utils.js';
import _ from 'lodash';

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
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}
		const modifiers = activeCharacter.modifiers;
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
		embed.setTitle(`${activeCharacter.sheet.staticInfo.name}'s Available Modifiers`);
		embed.addFields(fields);

		await embed.sendBatches(intr);
	}
}
