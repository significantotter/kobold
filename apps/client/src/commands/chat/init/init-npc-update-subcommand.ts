import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { InitDefinition } from '@kobold/documentation';
import { SheetUtils } from '@kobold/sheet';
import { KoboldError } from '@kobold/util';
import { BaseCommandClass } from '../../command.js';
import { Creature } from '../../../utils/creature.js';
import { InitiativeBuilderUtils } from '../../../utils/initiative-builder.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { SheetStaticInfoUtils } from '../../../utils/sheet-static-info-utils.js';

const commandOptions = InitDefinition.options;
const commandOptionsEnum = InitDefinition.commandOptionsEnum;

export class InitNpcUpdateSubCommand extends BaseCommandClass(
	InitDefinition,
	InitDefinition.subCommandEnum.npcUpdate
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name !== commandOptions[commandOptionsEnum.initNpc].name) return;

		const match =
			intr.options.getString(commandOptions[commandOptionsEnum.initNpc].name) ?? '';
		return await new KoboldUtils(kobold).autocompleteUtils.getInitNpcTargetOptions(
			intr,
			match
		);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const npcName = intr.options
			.getString(commandOptions[commandOptionsEnum.initNpc].name, true)
			.trim();
		const statsInput = intr.options.getString(
			commandOptions[commandOptionsEnum.npcStats].name
		);
		const level = intr.options.getInteger(commandOptions[commandOptionsEnum.level].name);
		const keyAbilityInput = intr.options.getString(
			commandOptions[commandOptionsEnum.keyAbility].name
		);
		const usesStamina = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.usesStamina].name
		);
		const keyAbility = SheetStaticInfoUtils.parseKeyAbility(keyAbilityInput);

		if (
			!statsInput &&
			level === null &&
			keyAbilityInput === null &&
			usesStamina === null
		) {
			throw new KoboldError('Yip! You must provide at least one value to update the NPC!');
		}

		const koboldUtils = new KoboldUtils(kobold);
		const { currentInitiative } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			currentInitiative: true,
		});
		const actor = InitiativeBuilderUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInitiative,
			npcName,
			true
		);

		if (actor.characterId !== null || actor.minionId !== null) {
			throw new KoboldError(
				'Yip! `/init npc-update` can only target NPCs added directly to this initiative.'
			);
		}

		const baseSheetRecord = await kobold.sheetRecord.read({ id: actor.sheetRecordId });
		if (!baseSheetRecord) {
			throw new KoboldError(`Yip! I couldn't find ${actor.name}'s sheet.`);
		}

		let sheet = SheetUtils.withStaticInfo(baseSheetRecord.sheet, {
			name: actor.name,
			level: level ?? undefined,
			keyAbility,
			usesStamina: usesStamina ?? undefined,
		});

		if (statsInput) {
			const adjustments = SheetUtils.stringToSheetAdjustments(
				statsInput,
				SheetAdjustmentTypeEnum.untyped
			);
			sheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);

			const creature = new Creature(
				{
					sheet,
					actions: actor.actions ?? [],
					rollMacros: actor.rollMacros ?? [],
					modifiers: actor.modifiers ?? [],
					conditions: baseSheetRecord.conditions ?? [],
				},
				undefined,
				intr
			);
			creature.recover();
			sheet = creature._sheet;
		}

		// The command can update static inputs but stats syntax cannot rename the actor.
		sheet = SheetUtils.withStaticInfo(sheet, { name: actor.name });
		await kobold.sheetRecord.update({ id: actor.sheetRecordId }, { sheet });
		koboldUtils.adjustedSheetService.triggerRecompute(actor.sheetRecordId);

		const updates: string[] = [];
		if (statsInput) updates.push('stats');
		if (level !== null) updates.push(`level: ${level}`);
		if (keyAbilityInput !== null) updates.push(`key ability: ${keyAbilityInput}`);
		if (usesStamina !== null) updates.push(`uses stamina: ${usesStamina}`);

		await InteractionUtils.send(
			intr,
			`Yip! I've updated the NPC "${actor.name}" (${updates.join(', ')})!`
		);
	}
}
