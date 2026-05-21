import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, SheetAttack } from '@kobold/db';

import { ActionDefinition } from '@kobold/documentation';
import { KoboldError } from '@kobold/util';
import { InteractionUtils } from '../../../utils/index.js';
import { buildImportedAttackAction } from '../../../utils/imported-attack-action-builder.js';
import { BaseCommandClass } from '../../command.js';

const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

function findImportedAttack(attacks: SheetAttack[], name: string): SheetAttack | undefined {
	return attacks.find(attack => attack.name.toLowerCase() === name.toLowerCase());
}

function importedAttackChoices(
	attacks: SheetAttack[],
	match: string
): ApplicationCommandOptionChoiceData[] {
	const normalizedMatch = match.trim().toLowerCase();
	return attacks
		.filter(attack => attack.name.toLowerCase().includes(normalizedMatch))
		.slice(0, 25)
		.map(attack => ({
			name: attack.name,
			value: attack.name,
		}));
}

function nextAvailableActionName(preferredName: string, existingNames: string[]): string {
	const takenNames = new Set(existingNames.map(name => name.toLowerCase()));
	if (!takenNames.has(preferredName.toLowerCase())) return preferredName;

	const copyName = `${preferredName} Copy`;
	if (!takenNames.has(copyName.toLowerCase())) return copyName;

	for (let i = 2; i < 1000; i++) {
		const numberedCopyName = `${copyName} ${i}`;
		if (!takenNames.has(numberedCopyName.toLowerCase())) return numberedCopyName;
	}

	throw new KoboldError('Yip! I could not find an available action name.');
}

export class ActionCopyImportedAttackSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.copyImportedAttack
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name !== commandOptions[commandOptionsEnum.attack].name) return;

		const activeCharacter = await kobold.character.readActiveAdjusted({
			userId: intr.user.id,
			channelId: intr.channelId,
			guildId: intr.guildId ?? undefined,
		});
		if (!activeCharacter) return [];

		const match = intr.options.getString(commandOptions[commandOptionsEnum.attack].name) ?? '';
		return importedAttackChoices(activeCharacter.sheetRecord.sheet.attacks, match);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const activeCharacter = await kobold.character.readActiveAdjusted({
			userId: intr.user.id,
			channelId: intr.channelId,
			guildId: intr.guildId ?? undefined,
		});
		if (!activeCharacter) {
			throw new KoboldError('Yip! You need an active character to copy an imported attack.');
		}

		const attackName = intr.options.getString(
			commandOptions[commandOptionsEnum.attack].name,
			true
		);
		const importedAttack = findImportedAttack(
			activeCharacter.sheetRecord.sheet.attacks,
			attackName
		);
		if (!importedAttack) {
			await InteractionUtils.send(intr, ActionDefinition.strings.copyImportedAttack.notFound);
			return;
		}

		const requestedName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name)
			?.trim();
		const actionName = nextAvailableActionName(
			requestedName || importedAttack.name,
			activeCharacter.actions.map(action => action.name)
		);
		const action = buildImportedAttackAction({
			attack: importedAttack,
			userId: intr.user.id,
			sheetRecordId: activeCharacter.sheetRecordId,
		});

		await kobold.action.create({
			userId: intr.user.id,
			sheetRecordId: activeCharacter.sheetRecordId,
			name: actionName,
			description: action.description,
			type: action.type,
			actionCost: action.actionCost,
			baseLevel: action.baseLevel,
			autoHeighten: action.autoHeighten,
			rolls: action.rolls,
			tags: action.tags,
		});

		await InteractionUtils.send(
			intr,
			ActionDefinition.strings.copyImportedAttack.success({
				newActionName: actionName,
				attackName: importedAttack.name,
			})
		);
	}
}
