import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { ChatArgs } from '../../../constants/index.js';
import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { DiceUtils, RollBuilder } from '../../../utils/dice-utils.js';

export class RollSaveSubCommand implements Command {
	public names = ['save'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'save',
		description: `rolls a save for your active character`,
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.SAVE_CHOICE_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ChatArgs.SAVE_CHOICE_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const matchedSaves = CharacterUtils.findPossibleSaveFromString(
				activeCharacter,
				match
			).map(save => ({
				name: save.Name,
				value: save.Name,
			}));
			//return the matched saves
			return matchedSaves;
		}
	}

	public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const saveChoice = intr.options.getString(ChatArgs.SAVE_CHOICE_OPTION.name);
		const modifierExpression = intr.options.getString(ChatArgs.ROLL_MODIFIER_OPTION.name);
		const rollNote = intr.options.getString(ChatArgs.ROLL_NOTE_OPTION.name);

		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id);
		if (!activeCharacter) {
			await InteractionUtils.send(intr, `Yip! You don't have any active characters!`);
			return;
		}

		//use the first save that matches the text of what we were sent, or preferably a perfect match
		let targetSave = CharacterUtils.getBestNameMatch(
			saveChoice,
			activeCharacter.calculatedStats.totalSaves as WG.NamedBonus[]
		);

		const rollBuilder = new RollBuilder({
			actorName: intr.user.username,
			character: activeCharacter,
			rollNote,
			rollDescription: `rolled ${targetSave.Name}`,
		});
		rollBuilder.addRoll(
			DiceUtils.buildDiceExpression('d20', String(targetSave.Bonus), modifierExpression)
		);
		const response = rollBuilder.compileEmbed();

		await InteractionUtils.send(intr, response);
	}
}
