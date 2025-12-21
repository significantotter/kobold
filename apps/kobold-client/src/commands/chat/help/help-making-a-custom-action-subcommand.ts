import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpLinks, actionCreationWalkthroughs } from '@kobold/documentation';

const { options, commandOptionsEnum } = HelpDefinition;

export class HelpMakingACustomActionSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.makingACustomAction
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const exampleChoice =
			intr.options.getString(options[commandOptionsEnum.customActionExample].name, true) ||
			'produceFlame';

		const walkthrough =
			actionCreationWalkthroughs[exampleChoice as keyof typeof actionCreationWalkthroughs];

		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);

		if (walkthrough) {
			embed.setTitle(walkthrough.title);
			embed.setDescription(walkthrough.description);
		} else {
			embed.setTitle('Custom Action Walkthrough');
			embed.setDescription('Select an example action to see a step-by-step walkthrough.');
		}

		await embed.sendBatches(intr, false);
	}
}
