import { DiceUtils } from './../../../utils/dice-utils';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { InitiativeActor } from './../../../services/kobold/models/initiative-actor/initiative-actor.model';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionsString,
	AutocompleteInteraction,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	CacheType,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Language } from '../../../models/enum-helpers/language.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Npc, Sheet } from '../../../services/kobold/models/index.js';
import { Creature } from '../../../utils/creature.js';
import _ from 'lodash';

export class InitAddSubCommand implements Command {
	public names = [Language.LL.commands.init.add.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.add.name(),
		description: Language.LL.commands.init.add.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ChatArgs.INIT_CREATURE_OPTION.name) {
			const match = intr.options.getString(ChatArgs.INIT_CREATURE_OPTION.name);
			const npcs = await AutocompleteUtils.getBestiaryNpcs(intr, match);
			if (npcs.length > 20) {
				npcs.unshift({ name: 'Custom NPC', value: '-1' });
			} else {
				npcs.splice(1, 0, { name: 'Custom NPC', value: '-1' });
				const sorter = StringUtils.generateSorterByWordDistance(match, c => c.name);

				return npcs.sort(sorter);
			}
			return npcs;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const currentInitResponse = await InitiativeUtils.getInitiativeForChannel(intr.channel, {
			sendErrors: true,
			LL,
		});
		if (currentInitResponse.errorMessage) {
			await InteractionUtils.send(intr, currentInitResponse.errorMessage);
			return;
		}
		const currentInit = currentInitResponse.init;

		let actorName = intr.options.getString(ChatArgs.ACTOR_NAME_OPTION.name);
		const targetCreature = intr.options.getString(ChatArgs.INIT_CREATURE_OPTION.name);
		const initiativeValue = intr.options.getNumber(ChatArgs.INIT_VALUE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const template = (intr.options.getString(ChatArgs.INIT_ADD_TEMPLATE_OPTION.name) ?? '')
			.trim()
			.toLocaleLowerCase();

		let creature: Creature = null;
		let sheet: Sheet = null;
		let referenceNpcName = null;

		if (targetCreature == '-1') {
			sheet = {};
			if (!actorName) actorName = 'unnamed enemy';
		} else {
			const npc = await Npc.query().findOne({ id: targetCreature });
			const variantData = await npc.fetchVariantDataIfExists();
			if (!actorName) actorName = (template ? `${_.capitalize(template)} ` : '') + npc.name;
			creature = Creature.fromBestiaryEntry(variantData, npc.fluff, {
				useStamina: false,
				template,
				customName: actorName || undefined,
			});
			sheet = creature.sheet;
			referenceNpcName = npc.name;
		}

		let nameCount = 1;
		let existingName = currentInit.actors.find(
			actor => actor.name.toLowerCase() === actorName.toLowerCase()
		);
		const baseName = actorName;
		if (existingName) {
			while (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === actorName.toLowerCase()
				)
			) {
				actorName = baseName + `-${nameCount++}`;
			}
		}
		let finalInitiative = 0;
		let rollResultMessage: EmbedBuilder;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					Language.LL.commands.init.add.interactions.joinedEmbed.joinedTitle({
						actorName,
					})
				)
				.setDescription(
					Language.LL.commands.init.add.interactions.joinedEmbed.description({
						finalInitiative,
					})
				);
		} else {
			const rollBuilder = new RollBuilder({
				title: Language.LL.commands.init.add.interactions.joinedEmbed.rolledTitle({
					actorName,
				}),
				LL,
			});
			rollBuilder.addRoll({
				rollExpression: DiceUtils.buildDiceExpression(
					'd20',
					String(sheet?.general?.perception || 0),
					diceExpression
				),
				tags: ['skill', 'perception', 'initiative'],
			});
			finalInitiative = rollBuilder.getRollTotalArray()[0] || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		}

		const targetMessageId = currentInit.roundMessageIds[currentInit.currentRound || 0];
		if (targetMessageId) {
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			rollResultMessage.addFields([
				{
					name: Language.LL.commands.init.add.interactions.joinedEmbed.roundField.name(),
					value: Language.LL.commands.init.add.interactions.joinedEmbed.roundField.value({
						currentRound: currentInit.currentRound,
						url: targetMessage.url,
					}),
				},
			]);
		}
		const newActor = await InitiativeActor.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: actorName,
			userId: intr.user.id,
			sheet: sheet,
			referenceNpcName,

			actorGroup: {
				initiativeId: currentInit.id,
				userId: intr.user.id,
				name: actorName,
				initiativeResult: finalInitiative,
			},
		});

		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			actors: currentInit.actors.concat(newActor),
			groups: currentInit.actorGroups.concat(newActor.actorGroup),
			LL,
		});
		await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
		await InteractionUtils.send(intr, rollResultMessage);
	}
}
