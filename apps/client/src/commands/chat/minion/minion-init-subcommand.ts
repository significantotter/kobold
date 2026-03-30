import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold, MinionWithRelations } from '@kobold/db';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { InitiativeBuilder, InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { MinionDefinition, utilStrings } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { RollBuilder } from '../../../utils/roll-builder.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionInitSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.init
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.minion].name) ?? '';
			return await koboldUtils.autocompleteUtils.getActiveCharacterMinionsWithUnassigned(
				intr,
				match
			);
		} else if (option.name === commandOptions[commandOptionsEnum.skillChoice].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.skillChoice].name) ?? '';
			const minionName =
				intr.options.getString(commandOptions[commandOptionsEnum.minion].name) ?? '';

			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions =
				await koboldUtils.autocompleteUtils.fetchActiveCharacterMinionsWithUnassigned(
					intr,
					activeCharacter.id
				);

			const targetMinion = minions.find(
				(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
			);

			if (!targetMinion) return [];

			const creature = new Creature(
				{
					sheet: targetMinion.sheetRecord.sheet,
					actions: targetMinion.actions ?? [],
					rollMacros: targetMinion.rollMacros ?? [],
					modifiers: targetMinion.modifiers ?? [],
					conditions: targetMinion.sheetRecord.conditions ?? [],
				},
				targetMinion.name,
				intr
			);

			const matchedSkills = FinderHelpers.matchAllSkills(creature, match).map(skill => ({
				name: skill.name,
				value: skill.name,
			}));

			return matchedSkills;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { initiativeUtils } = koboldUtils;
		const { currentInitiative, activeCharacter, userSettings } =
			await koboldUtils.fetchNonNullableDataForCommand(intr, {
				currentInitiative: true,
				activeCharacter: true,
				userSettings: true,
			});

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.minion].name, true)
			.trim();
		const separateTurn =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.separateTurn].name) ?? false;
		const initiativeValue = intr.options.getNumber(
			commandOptions[commandOptionsEnum.initValue].name
		);
		const skillChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.skillChoice].name
		);
		const diceExpression = intr.options.getString(
			commandOptions[commandOptionsEnum.rollExpression].name
		);
		const hideStats =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.hideStats].name) ?? false;

		// Find the minion (active character's minions + unassigned)
		const allMinions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});
		const minions = allMinions.filter(
			(m: MinionWithRelations) =>
				m.characterId === activeCharacter.id || m.characterId === null
		);
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name} or unassigned!`
			);
		}

		// Check if this minion is already in the initiative
		if (currentInitiative.actors.find(actor => actor.minionId === targetMinion.id)) {
			throw new KoboldError(`Yip! ${targetMinion.name} is already in this initiative!`);
		}

		// Find the parent character's actor in initiative
		const parentActor = currentInitiative.actors.find(
			actor => actor.characterId === activeCharacter.id
		);

		if (!separateTurn && !parentActor) {
			throw new KoboldError(
				`Yip! ${activeCharacter.name} must be in initiative first before adding ${targetMinion.name} to the same turn. ` +
					`Use \`/init join\` to add ${activeCharacter.name}, or use \`separate-turn: true\` to give the minion its own turn.`
			);
		}

		let initiativeResult: number | undefined;
		let rollBuilder: RollBuilder | undefined;

		if (separateTurn) {
			// Roll initiative for the minion using its own sheet
			const minionCreature = new Creature(
				{
					sheet: targetMinion.sheetRecord.sheet,
					actions: targetMinion.actions ?? [],
					rollMacros: targetMinion.rollMacros ?? [],
					modifiers: targetMinion.modifiers ?? [],
					conditions: targetMinion.sheetRecord.conditions ?? [],
				},
				targetMinion.name,
				intr
			);

			if (initiativeValue) {
				initiativeResult = initiativeValue;
			} else if (skillChoice) {
				rollBuilder = RollBuilder.fromSimpleCreatureRoll({
					creature: minionCreature,
					attributeName: skillChoice,
					modifierExpression: diceExpression ?? undefined,
					tags: ['initiative'],
					userSettings,
				});
				initiativeResult = rollBuilder.getRollTotalArray()[0] ?? 0;
			} else if (diceExpression) {
				rollBuilder = new RollBuilder({
					actorName: minionCreature.name,
					creature: minionCreature,
					rollDescription: utilStrings.initiative.joinedEmbed.rollDescription,
					userSettings,
				});
				rollBuilder.addRoll({
					rollTitle: 'Initiative',
					rollExpression: diceExpression,
					tags: ['initiative'],
				});
				initiativeResult = rollBuilder.getRollTotalArray()[0] ?? 0;
			} else {
				// Default: roll perception
				rollBuilder = RollBuilder.fromSimpleCreatureRoll({
					creature: minionCreature,
					attributeName: 'perception',
					modifierExpression: diceExpression ?? undefined,
					tags: ['initiative'],
					userSettings,
				});
				initiativeResult = rollBuilder.getRollTotalArray()[0] ?? 0;
			}
		}

		const actorName = InitiativeBuilderUtils.getUniqueInitActorName(
			currentInitiative,
			targetMinion.name
		);

		await initiativeUtils.createActorFromMinion({
			initiativeId: currentInitiative.id,
			minion: targetMinion,
			characterActorGroupId: parentActor?.initiativeActorGroupId,
			initiativeResult,
			separateTurn,
			hideStats,
			name: actorName,
		});

		const newInitiative = await initiativeUtils.getInitiativeForChannel(intr.channel);

		if (!newInitiative)
			throw new KoboldError(
				"Yip! Something went wrong and I couldn't find this channel's initiative"
			);

		const initBuilder = new InitiativeBuilder({
			initiative: newInitiative,
		});

		if (separateTurn) {
			const embed = InitiativeBuilderUtils.initiativeJoinEmbed(
				rollBuilder ?? initiativeResult!,
				actorName
			);
			await InteractionUtils.send(intr, embed);
		} else {
			await InteractionUtils.send(
				intr,
				`Yip! ${actorName} has joined ${activeCharacter.name}'s turn in initiative!`
			);
		}

		if (currentInitiative.currentRound === 0) {
			await InitiativeBuilderUtils.sendNewRoundMessage(intr, initBuilder);
		} else {
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			await InteractionUtils.send(intr, { embeds: [embed] });
		}
	}
}
