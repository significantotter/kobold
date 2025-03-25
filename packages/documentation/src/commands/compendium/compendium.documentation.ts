import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import {
	compendiumCommandDefinition,
	CompendiumSubCommandEnum,
} from './compendium.command-definition.js';

export const compendiumCommandDocumentation: CommandDocumentation<
	typeof compendiumCommandDefinition
> = {
	name: 'compendium',
	description: 'Commands for fetching information about PF2E.',
	subCommands: {
		[CompendiumSubCommandEnum.search]: {
			name: CompendiumSubCommandEnum.search,
			description: 'Fetches pathfinder 2E stat-blocks or rules information',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					embeds: [
						{
							title: 'Kobold Lore',
							url: 'https://2e.aonprd.com/Feats.aspx?ID=1273',
							description:
								'[Kobold](https://2e.aonprd.com/Traits.aspx?ID=224)\n\n' +
								"**Source** [Advanced Player's Guide](https://2e.aonprd.com/Sources.aspx?ID=39) pg. 142.0\n\n" +
								'You attentively learned key kobold survival strategies and mythology from your elders. You gain the trained proficiency rank in [Stealth](https://2e.aonprd.com/Skills.aspx?ID=15) and [Thievery](https://2e.aonprd.com/Skills.aspx?ID=17). If you would automatically become trained in one of those skills (from your background or class, for example), you instead become trained in a skill of your choice. You also become trained in [Kobold Lore](https://2e.aonprd.com/Skills.aspx?ID=8).',
							fields: [],
						},
					],
					options: {
						search: '(feat 1) Kobold Lore',
					},
				},
			],
		},
	},
};
