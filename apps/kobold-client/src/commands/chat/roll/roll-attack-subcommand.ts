import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold, SheetRecord } from '@kobold/db';
import { ActionRoller } from '../../../utils/action-roller.js';
import { Creature } from '../../../utils/creature.js';
import { EmbedUtils } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InitDefinition, RollDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = RollDefinition.options;
const commandOptionsEnum = RollDefinition.commandOptionsEnum;
const initCommandOptions = InitDefinition.options;
const initCommandOptionsEnum = InitDefinition.commandOptionsEnum;

export class RollAttackSubCommand extends BaseCommandClass(
	RollDefinition,
	RollDefinition.subCommandEnum.attack
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.attackChoice].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.attackChoice].name) ?? '';

			//get the active character
			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchDataForCommand(intr, {
				activeCharacter: true,
			});
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a attack on the character matching the autocomplete string
			const matchedAttack = FinderHelpers.matchAllAttacks(
				new Creature(activeCharacter.sheetRecord, undefined, intr),
				match
			).map(attack => ({
				name: attack.name,
				value: attack.name,
			}));
			//return the matched attacks
			return matchedAttack;
		}
		if (option.name === initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(
					initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name
				) ?? '';
			const koboldUtils: KoboldUtils = new KoboldUtils(kobold);

			return await koboldUtils.autocompleteUtils.getAllTargetOptions(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const attackChoice = intr.options.getString(
			commandOptions[commandOptionsEnum.attackChoice].name,
			true
		);
		const targetSheetName = intr.options.getString(
			initCommandOptions[initCommandOptionsEnum.initCharacterTarget].name,
			true
		);
		const attackModifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.attackRollModifier].name) ??
			'';
		const damageModifierExpression =
			intr.options.getString(commandOptions[commandOptionsEnum.damageRollModifier].name) ??
			'';
		const attackRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteAttack].name) ??
			undefined;
		const damageRollOverwrite =
			intr.options.getString(commandOptions[commandOptionsEnum.rollOverwriteDamage].name) ??
			undefined;
		const rollNote =
			intr.options.getString(commandOptions[commandOptionsEnum.rollNote].name) ?? '';
		const targetAC = intr.options.getInteger(
			commandOptions[commandOptionsEnum.rollTargetAc].name
		);
		const secretRoll =
			intr.options.getString(commandOptions[commandOptionsEnum.rollSecret].name) ??
			RollDefinition.optionChoices.rollSecret.public;

		const koboldUtils: KoboldUtils = new KoboldUtils(kobold);
		const { gameUtils, creatureUtils } = koboldUtils;
		const { activeCharacter, userSettings } = await koboldUtils.fetchDataForCommand(intr, {
			activeCharacter: true,
			userSettings: true,
		});
		koboldUtils.assertActiveCharacterNotNull(activeCharacter);

		const creature = new Creature(activeCharacter.sheetRecord, undefined, intr);

		let targetSheetRecord: SheetRecord | null = null;
		let targetCreature: Creature | null = null;
		let hideStats = false;

		if (
			targetSheetName &&
			targetSheetName.trim().toLocaleLowerCase() != '__none__' &&
			targetSheetName.trim().toLocaleLowerCase() != '(none)'
		) {
			const results = await gameUtils.getCharacterOrInitActorTarget(intr, targetSheetName);
			targetSheetRecord = results.targetSheetRecord;
			hideStats = results.hideStats;
			targetCreature = new Creature(targetSheetRecord, targetSheetName, intr);
		}

		const { builtRoll, actionRoller } = ActionRoller.fromCreatureAttack({
			creature,
			targetCreature,
			attackName: attackChoice,
			rollNote,
			attackModifierExpression,
			damageModifierExpression,
			targetAC: targetAC ?? undefined,
			userSettings,
			attackRollOverwrite: attackRollOverwrite,
			damageRollOverwrite: damageRollOverwrite,
		});

		const embed = builtRoll.compileEmbed({ forceFields: true });

		if (targetCreature && targetSheetRecord && actionRoller.shouldDisplayDamageText()) {
			// apply any effects from the action to the creature
			await creatureUtils.saveSheet(intr, {
				...targetSheetRecord,
				sheet: targetCreature._sheet,
			});

			const damageField = await EmbedUtils.getOrSendActionDamageField({
				intr,
				actionRoller,
				hideStats,
				targetNameOverwrite: targetSheetName,
			});

			embed.addFields(damageField);
		}

		await EmbedUtils.dispatchEmbeds(intr, [embed], secretRoll, activeCharacter.game?.gmUserId);
	}
}
