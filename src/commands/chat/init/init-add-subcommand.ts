import { DiceUtils } from './../../../utils/dice-utils.js';
import { RollBuilder } from '../../../utils/roll-builder.js';
import { InitiativeActor } from './../../../services/kobold/models/initiative-actor/initiative-actor.model.js';
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

import { InteractionUtils, StringUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitiativeUtils, InitiativeBuilder } from '../../../utils/initiative-utils.js';
import { ChatArgs } from '../../../constants/chat-args.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { Npc, Sheet } from '../../../services/kobold/models/index.js';
import { Creature } from '../../../utils/creature.js';
import _ from 'lodash';
import { InitOptions } from './init-command-options.js';
import { generateStatOverrides } from '../../../utils/sheet-import-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { SettingsUtils } from '../../../utils/settings-utils.js';
import L from '../../../i18n/i18n-node.js';
import { DeepPartial } from 'fishery';
import { CreatureFluff } from '../../../services/pf2etools/pf2etools-types.js';

export class InitAddSubCommand implements Command {
	public names = [L.en.commands.init.add.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.add.name(),
		description: L.en.commands.init.add.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return [];
		if (option.name === InitOptions.INIT_CREATURE_OPTION.name) {
			const match = intr.options.getString(InitOptions.INIT_CREATURE_OPTION.name);
			const npcs = await AutocompleteUtils.getBestiaryNpcs(intr, match ?? '');
			if (npcs.length > 20) {
				npcs.unshift({ name: 'Custom NPC', value: 'Custom NPC' });
			} else {
				const sorter = StringUtils.generateSorterByWordDistance<{
					name: string;
					value: string;
				}>(match ?? '', c => c.name);
				npcs.sort(sorter);
				npcs.push({ name: 'Custom NPC', value: 'Custom NPC' });
				return npcs;
			}
			return npcs;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions
	): Promise<void> {
		const [currentInit, userSettings] = await Promise.all([
			InitiativeUtils.getInitiativeForChannel(intr.channel),
			SettingsUtils.getSettingsForUser(intr),
		]);

		let actorName = intr.options.getString(InitOptions.ACTOR_NAME_OPTION.name);
		const targetCreature = intr.options.getString(InitOptions.INIT_CREATURE_OPTION.name, true);
		const customStatsString = intr.options.getString(InitOptions.INIT_CUSTOM_STATS_OPTION.name);
		const initiativeValue = intr.options.getNumber(InitOptions.INIT_VALUE_OPTION.name);
		const diceExpression = intr.options.getString(ChatArgs.ROLL_EXPRESSION_OPTION.name);
		const hideStats = intr.options.getBoolean(InitOptions.INIT_HIDE_STATS_OPTION.name) ?? true;
		const template = (intr.options.getString(InitOptions.INIT_ADD_TEMPLATE_OPTION.name) ?? '')
			.trim()
			.toLocaleLowerCase();

		let sheet: DeepPartial<Sheet> = {};
		let referenceNpcName = null;

		if (targetCreature.toLowerCase().trim() != 'custom npc') {
			const npcNameSourceRegex = /(.*) \((.*)\)/;
			const [fullMatch, matchedName, matchedSource] =
				npcNameSourceRegex.exec(targetCreature) ?? [];
			let name = targetCreature;
			let source = undefined;
			if (matchedName && matchedSource) {
				name = matchedName;
				source = matchedSource;
			}
			// search for the npc's name case insensitively
			let npcPromise = Npc.query().whereRaw('name ilike ?', [`%${name ?? ''}%`]);
			// if we're targeting a specific source book, add that to the search
			if (source)
				npcPromise = npcPromise.andWhereRaw("(data->'source')::TEXT ilike ?", [
					`%${source ?? ''}%`,
				]);
			const npcs = await npcPromise;
			if (!npcs.length)
				throw new KoboldError(`Yip! I couldn't find ${fullMatch} in the bestiary!`);
			// we know there's at least 1, so there will be a match
			const npc = StringUtils.findClosestInObjectArray(name, npcs, 'name') as Npc;
			const variantData = await npc.fetchVariantDataIfExists();
			if (!actorName) actorName = (template ? `${_.capitalize(template)} ` : '') + npc.name;
			const creature = Creature.fromBestiaryEntry(
				variantData,
				(npc.fluff as CreatureFluff) ?? undefined,
				{
					useStamina: false,
					template,
					customName: actorName || undefined,
				}
			);
			sheet = creature.sheet;
			referenceNpcName = npc.name;
		}

		if (!actorName) actorName = 'unnamed enemy';
		sheet = _.merge(sheet, { info: { name: actorName } });

		let finalName: string = actorName;

		if (customStatsString) {
			const statOverrides = generateStatOverrides(customStatsString);
			sheet = _.merge(sheet, statOverrides);
		}

		let nameCount = 1;
		let existingName = currentInit.actors.find(
			actor => actor.name.toLowerCase() === finalName.toLowerCase()
		);

		if (existingName) {
			while (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === finalName.toLowerCase()
				)
			) {
				finalName = actorName + `-${nameCount++}`;
			}
		}
		let finalInitiative = 0;
		let rollResultMessage: EmbedBuilder;

		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					L.en.commands.init.add.interactions.joinedEmbed.joinedTitle({
						actorName: finalName,
					})
				)
				.setDescription(
					L.en.commands.init.add.interactions.joinedEmbed.description({
						finalInitiative,
					})
				);
		} else {
			const rollBuilder = new RollBuilder({
				title: L.en.commands.init.add.interactions.joinedEmbed.rolledTitle({
					actorName: finalName,
				}),
				userSettings,
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

		const newActor = await InitiativeActor.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: actorName,
			userId: intr.user.id,
			sheet,
			referenceNpcName,
			hideStats,

			actorGroup: {
				initiativeId: currentInit.id,
				userId: intr.user.id,
				name: actorName,
				initiativeResult: finalInitiative,
			},
		});

		const finalActorGroups = currentInit.actorGroups;
		if (newActor.actorGroup) finalActorGroups.push(newActor.actorGroup);
		const initBuilder = new InitiativeBuilder({
			initiative: currentInit,
			actors: currentInit.actors.concat(newActor),
			groups: finalActorGroups,
			LL,
		});
		await InitiativeUtils.sendNewRoundMessage(intr, initBuilder);
		await InteractionUtils.send(intr, rollResultMessage);
	}
}
