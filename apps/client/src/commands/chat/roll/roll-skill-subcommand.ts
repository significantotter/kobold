import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { DiceUtils } from '../../../utils/dice-utils.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { KoboldError } from '@kobold/util';
import { RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { RollContextService, RollEngine } from '../../../utils/roll-engine.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;

export class RollSkillSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.skill
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.skillChoice].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.skillChoice].name) ?? '';

			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
			const { activeCharacterAdjusted } = await koboldUtils.fetchDataForCommand(intr, {
				activeCharacterAdjusted: true,
			});

			//get the active character
			if (!activeCharacterAdjusted) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a skill on the character matching the autocomplete string
			const matchedSkills = FinderHelpers.matchAllSkills(
				Creature.fromAdjustedSheetRecord(activeCharacterAdjusted, undefined, intr),
				match
			).map(skill => ({ name: skill.name, value: skill.name }));
			//return the matched skills
			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const skillChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.skillChoice].name,
			true
		);
		const modifierExpression = intr.options.getString(
			commandOptions[commandOptionsEnum.rollModifier].name
		);
		const rollNote = intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name);

		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

		const contextService = new RollContextService(kobold);
		const context = await contextService.getExpansionContext({
			userId: intr.user.id,
			guildId: intr.guildId ?? undefined,
			channelId: intr.channelId ?? undefined,
			includeGmUserId: RollEngine.secretRequiresGm(secretRoll),
		});
		if (!context.subject) {
			throw new KoboldError("Yip! You don't have any characters! Use /import to import one.");
		}

		const rollName = RollEngine.getStructuredRollName(skillChoice, 'skill');
		const attributeName = RollEngine.structuredAttributeName(rollName);
		const { builder } = await RollEngine.rollWithContext({
			context,
			attributeContextService: contextService,
			options: {
				rollExpression: DiceUtils.buildDiceExpression(
					'd20',
					`[${attributeName}]`,
					modifierExpression ?? ''
				),
				rollTitle: _.startCase(rollName),
				actorName: context.subject.character.name,
				rollDescription: `rolled ${_.startCase(rollName)}`,
				rollNote: rollNote ?? '',
				baseTags: RollEngine.structuredTags({ rollName, rollKind: 'skill' }),
			},
		});

		await EmbedUtils.dispatchEmbeds(
			intr,
			[builder.compileEmbed()],
			secretRoll,
			context.subject.gmUserId
		);
	}
}
