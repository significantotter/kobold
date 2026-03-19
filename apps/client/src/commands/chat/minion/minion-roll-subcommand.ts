import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import _ from 'lodash';
import { getEmoji } from '../../../constants/emoji.js';
import { Kobold, MinionWithRelations, SheetRecord } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils, KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionRollSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.roll
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.minion].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.minion].name);
			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions = await kobold.minion.readMany({
				characterId: activeCharacter.id,
			});

			return minions
				.filter((m: MinionWithRelations) =>
					m.name.toLowerCase().includes((match ?? '').toLowerCase())
				)
				.map((m: MinionWithRelations) => ({
					name: m.name,
					value: m.name,
				}));
		} else if (option.name === commandOptions[commandOptionsEnum.rollType].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.rollType].name) ?? '';
			const minionName =
				intr.options.getString(commandOptions[commandOptionsEnum.minion].name) ?? '';

			const activeCharacter = await koboldUtils.characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) return [];

			const minions = await kobold.minion.readMany({
				characterId: activeCharacter.id,
			});

			const targetMinion = minions.find(
				(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
			);

			if (!targetMinion) return [];

			const creature = new Creature(
				{
					sheet: targetMinion.sheet,
					actions: targetMinion.actions ?? [],
					rollMacros: targetMinion.rollMacros ?? [],
					modifiers: targetMinion.modifiers ?? [],
					conditions: [],
				},
				targetMinion.name,
				intr
			);

			const allRolls = _.uniq([
				..._.keys(creature.attackRolls),
				...creature.actions.map(action => action.name),
				..._.keys(creature.rolls),
			]);

			const matchedRolls = allRolls.filter(roll =>
				roll.toLowerCase().includes(match.toLowerCase())
			);
			return matchedRolls.map(roll => ({
				name: roll,
				value: roll,
			}));
		} else if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter, userSettings } = await koboldUtils.fetchNonNullableDataForCommand(
			intr,
			{
				activeCharacter: true,
				userSettings: true,
			}
		);

		const minionName = intr.options
			.getString(commandOptions[commandOptionsEnum.minion].name, true)
			.trim();
		const rollChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.rollType].name,
			true
		);
		const targetSheetName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const modifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.diceRollOrModifier].name) ??
			'';
		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ?? 'public';

		// Find the minion
		const minions = await kobold.minion.readMany({
			characterId: activeCharacter.id,
		});
		const targetMinion = minions.find(
			(m: MinionWithRelations) => m.name.toLowerCase() === minionName.toLowerCase()
		);

		if (!targetMinion) {
			throw new KoboldError(
				`Yip! I couldn't find a minion named "${minionName}" for ${activeCharacter.name}!`
			);
		}

		const creature = new Creature(
			{
				sheet: targetMinion.sheet,
				actions: targetMinion.actions ?? [],
				rollMacros: targetMinion.rollMacros ?? [],
				modifiers: targetMinion.modifiers ?? [],
				conditions: [],
			},
			targetMinion.name,
			intr
		);

		const { gameUtils, creatureUtils } = new KoboldUtils(kobold);

		let targetCreature: Creature | null = null;
		let targetSheetRecord: SheetRecord | null = null;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			hideStats = results.hideStats;
			targetSheetRecord = results.targetSheetRecord;
			targetCreature = Creature.fromSheetRecord(results.targetEntity, targetSheetName, intr);
		}

		const targetRoll = creature.attackRolls[rollChoice] ?? creature.rolls[rollChoice];

		const targetAction = creature.actions.find(
			action => action.name.toLowerCase().trim() === rollChoice.toLowerCase().trim()
		);

		if (!targetRoll && !targetAction) {
			throw new KoboldError(
				`Yip! I couldn't find a roll called "${rollChoice}" for ${targetMinion.name}!`
			);
		}

		let embed: KoboldEmbed;

		if (targetAction) {
			const actionRoller = new ActionRoller(
				userSettings,
				targetAction,
				creature,
				targetCreature,
				{}
			);

			const builtRoll = actionRoller.buildRoll('', targetAction.description ?? '', {
				attackModifierExpression: modifierExpression,
				damageModifierExpression: '',
				title: `${getEmoji(intr, targetAction.actionCost)} ${creature.name} used ${
					targetAction.name
				}!`,
			});

			embed = builtRoll.compileEmbed({ forceFields: true, showTags: false });

			embed = EmbedUtils.describeActionResult({
				embed,
				action: targetAction,
			});

			if (targetSheetRecord && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats,
					targetNameOverwrite: targetSheetName,
				});

				embed.addFields(damageField);
			}
		} else if (['check', 'skill', 'ability', 'save', 'spell'].includes(targetRoll.type)) {
			const response = RollBuilder.fromSimpleCreatureRoll({
				userName: intr.user.username,
				actorName: targetMinion.name,
				creature,
				attributeName: targetRoll.name,
				rollNote: '',
				modifierExpression,
				userSettings,
			});

			embed = response.compileEmbed();
		} else if (targetRoll.type === 'attack') {
			const { builtRoll, actionRoller } = ActionRoller.fromCreatureAttack({
				creature,
				targetCreature,
				attackName: targetRoll.name,
				rollNote: '',
				attackModifierExpression: modifierExpression,
				damageModifierExpression: '',
				userSettings,
			});

			embed = builtRoll.compileEmbed({ forceFields: true });

			if (targetSheetRecord && targetCreature && actionRoller.shouldDisplayDamageText()) {
				await creatureUtils.saveSheet(intr, targetSheetRecord);

				const damageField = await EmbedUtils.getOrSendActionDamageField({
					intr,
					actionRoller,
					hideStats: hideStats,
					targetNameOverwrite: targetSheetName,
				});

				embed.addFields(damageField);
			}
		} else {
			throw new KoboldError(`Yip! I ran into trouble rolling ${targetRoll.name}`);
		}

		await EmbedUtils.dispatchEmbeds(
			intr,
			[embed],
			secretRoll,
			activeCharacter.game?.gmUserId ?? undefined
		);
	}
}
