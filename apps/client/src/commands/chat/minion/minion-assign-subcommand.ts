import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, MinionWithRelations } from '@kobold/db';
import { MinionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';

const commandOptions = MinionDefinition.options;
const commandOptionsEnum = MinionDefinition.commandOptionsEnum;

export class MinionAssignSubCommand extends BaseCommandClass(
	MinionDefinition,
	MinionDefinition.subCommandEnum.assign
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

			// Get all user's minions, not just the active character's
			const minions = await kobold.minion.readManyByUserId({
				userId: intr.user.id,
			});

			return minions
				.filter((m: MinionWithRelations) =>
					m.name.toLowerCase().includes((match ?? '').toLowerCase())
				)
				.map((m: MinionWithRelations) => ({
					name: m.name,
					value: m.name,
				}));
		}

		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match = intr.options.getString(
				commandOptions[commandOptionsEnum.targetCharacter].name
			);

			// Get all user's characters
			const characters = await kobold.character.readMany({
				userId: intr.user.id,
			});

			return characters
				.filter(c => c.name.toLowerCase().includes((match ?? '').toLowerCase()))
				.map(c => ({
					name: c.name,
					value: c.name,
				}));
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const minionName = intr.options.getString(
			commandOptions[commandOptionsEnum.minion].name,
			true
		);
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);

		// Find the minion
		const minions = await kobold.minion.readManyByUserId({
			userId: intr.user.id,
		});

		const matchedMinion = minions.find(m => m.name.toLowerCase() === minionName.toLowerCase());

		if (!matchedMinion) {
			throw new KoboldError(MinionDefinition.strings.notFound);
		}

		// Find the target character
		const characters = await kobold.character.readMany({
			userId: intr.user.id,
		});

		const targetCharacter = characters.find(
			c => c.name.toLowerCase() === targetCharacterName.toLowerCase()
		);

		if (!targetCharacter) {
			throw new KoboldError(MinionDefinition.strings.assign.targetNotFound);
		}

		// Check if the minion is already assigned to this character
		if (matchedMinion.characterId === targetCharacter.id) {
			await InteractionUtils.send(
				intr,
				`Yip! ${matchedMinion.name} is already assigned to ${targetCharacter.name}.`
			);
			return;
		}

		// Update the minion's characterId
		await kobold.minion.update({ id: matchedMinion.id }, { characterId: targetCharacter.id });

		await InteractionUtils.send(
			intr,
			MinionDefinition.strings.assign.success({
				minionName: matchedMinion.name,
				characterName: targetCharacter.name,
			})
		);
	}
}
