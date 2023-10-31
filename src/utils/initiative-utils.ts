import { TranslationFunctions } from './../i18n/i18n-types.js';
import {
	InitiativeActorGroup,
	InitiativeActor,
	Initiative,
	Character,
	UserSettings,
	InitiativeWithRelations,
	InitiativeActorModel,
	InitiativeModel,
	InitiativeActorWithRelations,
} from './../services/kobold/index.js';
import {
	ChatInputCommandInteraction,
	CommandInteraction,
	Message,
	TextBasedChannel,
} from 'discord.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import _ from 'lodash';
import { InteractionUtils } from './interaction-utils.js';
import { CharacterUtils } from './character-utils.js';
import { DiceUtils } from './dice-utils.js';
import { RollBuilder } from './roll-builder.js';
import { Creature } from './creature.js';
import { KoboldError } from './KoboldError.js';
import { SettingsUtils } from './settings-utils.js';
import L from '../i18n/i18n-node.js';

export type TurnData = {
	currentRound: number;
	currentTurnGroupId: number | null;
};

export class InitiativeBuilder {
	public init: InitiativeWithRelations;
	public actorsByGroup: { [key: number]: InitiativeActorWithRelations[] };
	public groups: InitiativeActorGroup[];
	public userSettings: UserSettings;
	protected LL: TranslationFunctions;

	constructor({
		initiative,
		actors,
		groups,
		userSettings,
		LL,
	}: {
		initiative: InitiativeWithRelations;
		actors?: InitiativeActor[];
		groups?: InitiativeActorGroup[];
		userSettings?: UserSettings;
		LL?: TranslationFunctions;
	}) {
		this.LL = LL || L.en;
		this.init = initiative;
		if (initiative && !actors) actors = initiative.actors;
		if (initiative && !groups) groups = initiative.actorGroups;
		this.actorsByGroup = _.groupBy(actors || [], actor => actor.initiativeActorGroupId);
		this.groups = (groups || []).sort(InitiativeBuilder.groupSortFunction);
		this.userSettings = _.defaults(userSettings, SettingsUtils.defaultSettings);
	}

	public static groupSortFunction(a: InitiativeActorGroup, b: InitiativeActorGroup) {
		let comparison = b.initiativeResult - a.initiativeResult;
		if (comparison === 0) comparison = a.name.localeCompare(b.name);
		if (comparison === 0) comparison = a.id - b.id;
		return comparison;
	}

	public hasActorsWithHiddenStats() {
		return _.some(this.init.actors, actor => actor.hideStats);
	}

	public get currentTurnGroup() {
		return this.groups.find(group => group.id === this.init.currentTurnGroupId) ?? null;
	}

	/**
	 * Updates the initiative builder with new initiative data
	 * @param param0.initiative The new initiative data
	 * @param param0.actors The new actors data, defaults to initiative.actors if not set
	 * @param param0.groups The new groups data defaults to initiative.groups if not set
	 */
	set({
		initiative,
		actors,
		groups,
	}: {
		initiative?: Initiative;
		actors?: InitiativeActor[];
		groups?: InitiativeActorGroup[];
	}) {
		if (initiative) {
			this.init = initiative;
		}
		if (actors !== undefined) {
			this.actorsByGroup = _.groupBy(actors, actor => actor.initiativeActorGroupId);
		}
		if (groups !== undefined) {
			this.groups = groups.sort(InitiativeBuilder.groupSortFunction);
		}
	}

	/**
	 * Gets the changed initiative data when going to the a target group's turn in the built initiative
	 * @returns An object containing updates to the initiative, or an error message
	 */
	getJumpToTurnChanges(groupName: string): TurnData {
		let errorMessage = null;
		let group: InitiativeActorGroup | null = null;
		// get group options that match the given name, were created by you, or you're the gm of
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActorGroup>(
			this.groups,
			groupName
		);
		if (!result) throw new KoboldError(this.LL.utils.initiative.characterNameNotFoundError());

		return {
			currentRound: this.init.currentRound || 1,
			currentTurnGroupId: result.id,
		};
	}

	/**
	 * Gets the changed initiative data when going to the previous turn in the built initiative
	 * @returns An object containing updates to the initiative, or an error message
	 */
	getPreviousTurnChanges(): TurnData {
		if (!this.groups.length) {
			throw new KoboldError(this.LL.utils.initiative.prevTurnInitEmptyError());
		}
		if (!this.init.currentTurnGroupId) {
			throw new KoboldError(this.LL.utils.initiative.prevTurnInitNotStartedError());
		} else {
			const currentTurnIndex = _.findIndex(
				this.groups,
				group => group.id === this.init.currentTurnGroupId
			);
			if (!this.groups[currentTurnIndex - 1]) {
				if (this.init.currentRound === 1) {
					throw new KoboldError(this.LL.utils.initiative.prevTurnNotPossibleError());
				}
				//move to the previous round!
				return {
					currentRound: (this.init.currentRound || 1) - 1,
					currentTurnGroupId: this.groups[this.groups.length - 1].id,
				};
			} else {
				return {
					currentRound: this.init.currentRound || 1,
					currentTurnGroupId: this.groups[currentTurnIndex - 1].id,
				};
			}
		}
	}
	getCurrentTurnInfo(): TurnData {
		return {
			currentRound: this.init.currentRound || 1,
			currentTurnGroupId: this.init.currentTurnGroupId,
		};
	}

	/**
	 * Gets the changed initiative data when going to the next turn in the built initiative
	 * @returns An object containing updates to the initiative, or an error message
	 */
	getNextTurnChanges(): TurnData {
		if (!this.groups.length) {
			throw new KoboldError(this.LL.utils.initiative.nextTurnInitEmptyError());
		}
		if (!this.init.currentTurnGroupId) {
			return {
				currentRound: this.init.currentRound || 1,
				currentTurnGroupId: this.groups[0].id,
			};
		} else {
			const currentTurnIndex = _.findIndex(
				this.groups,
				group => group.id === this.init.currentTurnGroupId
			);
			if (!this.groups[currentTurnIndex + 1]) {
				//move to the next round!
				return {
					currentRound: (this.init.currentRound || 1) + 1,
					currentTurnGroupId: this.groups[0].id,
				};
			} else {
				return {
					currentRound: this.init.currentRound || 1,
					currentTurnGroupId: this.groups[currentTurnIndex + 1].id,
				};
			}
		}
	}

	/**
	 * Removes an actor from the current initiative
	 * The removal operation is easy to do outside the builder, so this
	 * operation is a helper to deeply alter the initiative values
	 */
	removeActor(actor: InitiativeActor) {
		if (this.actorsByGroup[actor.initiativeActorGroupId]?.length === 1) {
			_.remove(this.groups, group => group.id === actor.initiativeActorGroupId);
			delete this.actorsByGroup[actor.initiativeActorGroupId];
		} else {
			_.remove(
				this.actorsByGroup[actor.initiativeActorGroupId],
				possibleActor => possibleActor.id === actor.id
			);
		}
	}

	/**
	 * Creates a string that displays information for all actor groups in an initiative display
	 */
	public getAllGroupsTurnText(
		options: {
			showHiddenCreatureStats?: boolean;
		} = { showHiddenCreatureStats: false }
	): string {
		let builtTurnText = '```md\n';
		for (const group of this.groups) {
			builtTurnText += this.getActorGroupTurnText(group, options);
		}
		builtTurnText += '```';
		if (this.groups.length === 0) {
			builtTurnText = ' ';
		}
		return builtTurnText;
	}

	/**
	 * Creates a string that displays information for an actor group in an initiative display
	 * @param actorGroup The actor group to generate text for
	 */
	public getActorGroupTurnText(
		actorGroup: InitiativeActorGroup,
		options: {
			showHiddenCreatureStats?: boolean;
		} = { showHiddenCreatureStats: false }
	): string {
		const actorsInGroup = this.actorsByGroup[actorGroup.id] || [];
		const isActiveGroup = this.init.currentTurnGroupId === actorGroup.id;
		let turnText = '';
		let extraSymbol = ' ';
		if (isActiveGroup) {
			extraSymbol = '#';
		}
		turnText += '\n';
		if (actorsInGroup.length === 1 && actorsInGroup[0].name === actorGroup.name) {
			//We're just displaying the actor in its initiative slot
			turnText += `${extraSymbol} ${actorGroup.initiativeResult}: ${actorGroup.name}`;
			turnText += this.generateActorStatDisplayString(actorsInGroup[0], options);
		} else {
			turnText += `${extraSymbol} ${actorGroup.initiativeResult}: ${actorGroup.name}\n`;
			const sortedActors = actorsInGroup.sort((a, b) => a.name.localeCompare(b.name));
			for (let i = 0; i < sortedActors.length; i++) {
				turnText += `       ${i}. ${sortedActors[i].name}`;
				turnText += this.generateActorStatDisplayString(sortedActors[i], options);
				turnText += `\n`;
			}
		}
		return turnText;
	}

	public hpTextFromValue(currentHp: number, maxHp: number) {
		if (currentHp === 0) return `DOWN`;
		else if (currentHp / maxHp < 0.15) return `CRITICAL`;
		else if (currentHp / maxHp < 0.5) return `BLOODIED`;
		else if (currentHp < maxHp) return `INJURED`;
		else return `HEALTHY`;
	}
	public staminaTextFromValue(currentStamina: number, maxStamina: number) {
		if (currentStamina === 0) return `EXHAUSTED`;
		else if (currentStamina / maxStamina < 0.15) return `DRAINED`;
		else if (currentStamina / maxStamina < 0.5) return `TIRED`;
		else if (currentStamina < maxStamina) return `SLOWING`;
		else return `RESTED`;
	}

	public generateActorStatDisplayString(
		actor: InitiativeActor,
		options: {
			showHiddenCreatureStats?: boolean;
		} = { showHiddenCreatureStats: false }
	): string {
		let turnText = '';
		// if the character doesn't have a full sheet, don't show stats
		if (!actor.sheet) return turnText;
		// use a second line for an actor with a too-long name
		if (actor.name.length > 40) {
			turnText += '\n';
		}
		if (actor.sheet.baseCounters.hp.current === undefined) {
			return turnText;
		}
		// if we should hide the creature's stats, do so
		if (!options.showHiddenCreatureStats && actor.hideStats) {
			const hp = actor.sheet.baseCounters.hp.current;
			turnText += ` <${this.hpTextFromValue(
				actor.sheet.baseCounters.hp.current,
				actor.sheet.baseCounters.hp.max ?? 0
			)}>`;
			if (actor.sheet.staticInfo.usesStamina) {
				turnText += ` <${this.staminaTextFromValue(
					actor.sheet.baseCounters.stamina.current,
					actor.sheet.baseCounters.stamina.max ?? 0
				)}>`;
			}
			if (actor.sheet.baseCounters.tempHp.current) {
				turnText += `<THP ?/?>`;
			}
		}

		// otherwise, display the creature's stats if we can
		else {
			turnText += ` <HP ${actor.sheet.baseCounters.hp.current}`;
			turnText += `/${actor.sheet.baseCounters.hp.max}`;
			turnText += `>`;
			if (actor.sheet.staticInfo.usesStamina) {
				turnText += `<SP ${actor.sheet.baseCounters.stamina.current}`;
				turnText += `/${actor.sheet.baseCounters.stamina.max}`;
				turnText += `>`;

				turnText += `<RP ${actor.sheet.baseCounters.resolve.current}`;
				turnText += `/${actor.sheet.baseCounters.resolve.max}`;
				turnText += `>`;
			}
			if (actor.sheet.baseCounters.tempHp.current) {
				turnText += `<THP ${actor.sheet.baseCounters.tempHp.current}>`;
			}
		}

		return turnText;
	}

	get activeGroup() {
		return this.groups.find(group => group.id === this.init.currentTurnGroupId);
	}
	get activeActors() {
		return (
			this.init?.actors ??
			_.flatten(_.values(this.actorsByGroup)) ??
			([] as InitiativeActor[])
		).filter(
			(actor: InitiativeActor) =>
				actor.initiativeActorGroupId === this.init.currentTurnGroupId
		);
	}
}

interface LowerNamedThing {
	name?: string;
}

export class InitiativeUtils {
	/**
	 * adds a character to initiative.
	 * @returns A kobold embed message with a roll result message for the initiative join operation
	 */
	public static async addCharacterToInitiative({
		character,
		currentInit,
		skillChoice,
		diceExpression,
		initiativeValue,
		userName,
		userId,
		hideStats,
		userSettings,
		LL,
	}: {
		character: Character;
		currentInit: InitiativeWithRelations;
		skillChoice?: string | null;
		diceExpression?: string | null;
		initiativeValue?: number | null;
		userName: string;
		userId: string;
		hideStats: boolean;
		userSettings: UserSettings;
		LL: TranslationFunctions;
	}): Promise<KoboldEmbed> {
		let finalInitiative: number = 0;
		let rollResultMessage: KoboldEmbed;
		let rollBuilderResponse: RollBuilder;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					LL.commands.init.join.interactions.joinedEmbed.title({
						characterName: character.sheet.staticInfo.name,
					})
				)
				.setDescription(
					LL.commands.init.join.interactions.joinedEmbed.setDescription({
						initValue: finalInitiative,
					})
				);
			if (character.sheet.info.imageURL) {
				rollResultMessage.setThumbnail(character.sheet.info.imageURL);
			}
		} else if (skillChoice) {
			rollBuilderResponse = await DiceUtils.rollSimpleCreatureRoll({
				userName,
				creature: Creature.fromCharacter(character),
				attributeName: skillChoice,
				modifierExpression: diceExpression,
				tags: ['initiative'],
				LL,
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;
			rollResultMessage = rollBuilderResponse.compileEmbed();
		} else if (diceExpression) {
			rollBuilderResponse = new RollBuilder({
				character: character,
				rollDescription: LL.commands.init.join.interactions.joinedEmbed.rollDescription(),
				userSettings,
				LL,
			});
			rollBuilderResponse.addRoll({
				rollTitle: 'Initiative',
				rollExpression: diceExpression,
				tags: ['initiative'],
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;
			rollResultMessage = rollBuilderResponse.compileEmbed();
		} else {
			rollBuilderResponse = await DiceUtils.rollSimpleCreatureRoll({
				userName,
				creature: Creature.fromCharacter(character),
				attributeName: 'perception',
				modifierExpression: diceExpression,
				tags: ['initiative'],
				userSettings,
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;

			rollResultMessage = rollBuilderResponse.compileEmbed();
		}

		rollResultMessage.addFields([
			{
				name: LL.commands.init.join.interactions.joinedEmbed.roundField.name(),
				value: LL.commands.init.join.interactions.joinedEmbed.roundField.value({
					currentRound: currentInit.currentRound,
				}),
			},
		]);

		let nameCount = 1;
		let existingName = (currentInit.actors ?? []).find(
			(actor: InitiativeActor) =>
				actor.name.toLowerCase() === character.sheet.staticInfo.name.toLowerCase()
		);
		let uniqueName = character.sheet.staticInfo.name;
		if (existingName) {
			while (
				(currentInit.actors ?? []).find(
					(actor: InitiativeActor) =>
						actor.name.toLowerCase() === uniqueName.toLowerCase()
				)
			) {
				uniqueName = character.sheet.staticInfo.name + `-${nameCount++}`;
			}
		}

		const newActor = await InitiativeActorModel.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: uniqueName,
			characterId: character.id,
			sheet: character.sheet,
			userId,
			hideStats,

			actorGroup: {
				initiativeId: currentInit.id,
				userId,
				name: uniqueName,
				initiativeResult: finalInitiative,
			},
		});

		currentInit.actors = (currentInit.actors ?? []).concat({ ...newActor, character });
		currentInit.actorGroups = (currentInit.actorGroups ?? []).concat(
			newActor.actorGroup as InitiativeActorGroup
		);

		return rollResultMessage;
	}

	public static async getInitiativeForChannel(channel: TextBasedChannel | null) {
		let errorMessage = null;
		if (!channel || !channel.id) {
			throw new KoboldError(L.en.utils.initiative.initOutsideServerChannelError());
		}
		const channelId = channel.id;

		const currentInit = await InitiativeModel.queryGraphFromChannel(channelId).first();
		if (!currentInit || currentInit.length === 0) {
			throw new KoboldError(L.en.utils.initiative.noActiveInitError());
		}
		// stick the actors in the groups here in their correct locations
		for (let group of currentInit.actorGroups ?? []) {
			group.actors = [];
			for (const actor of currentInit.actors ?? []) {
				if (actor.initiativeActorGroupId === group.id) {
					group.actors.push(actor);
				}
			}
		}
		return currentInit;
	}
	public static async getInitiativeForChannelOrNull(channel: TextBasedChannel | null) {
		try {
			return await this.getInitiativeForChannel(channel);
		} catch (err) {
			return null;
		}
	}

	public static async sendNewRoundMessage(
		intr: CommandInteraction,
		initBuilder: InitiativeBuilder
	): Promise<Message<boolean> | undefined> {
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
		return await InteractionUtils.send(intr, embed);
	}

	public static getControllableInitiativeActors(
		initiative: InitiativeWithRelations,
		userId: string
	) {
		const actorOptions = initiative?.actors ?? [];
		const controllableActors = actorOptions.filter(
			(actor: InitiativeActor) => initiative.gmUserId === userId || actor.userId === userId
		);
		return controllableActors;
	}
	public static getControllableInitiativeGroups(
		initiative: InitiativeWithRelations,
		userId: string
	) {
		const actorGroupOptions = initiative.actorGroups ?? [];
		const controllableGroups = actorGroupOptions.filter(
			(group: InitiativeActorGroup) =>
				initiative.gmUserId === userId || group.userId === userId
		);
		return controllableGroups;
	}

	public static getActiveCharacterActor(
		initiative: InitiativeWithRelations,
		userId: string,
		LL: TranslationFunctions
	) {
		LL = L.en;
		let actor: InitiativeActor | null = null;
		let errorMessage: string | null = null;
		for (const possibleActor of initiative?.actors || []) {
			const actorCharacter = possibleActor.character;
			if (
				actorCharacter &&
				actorCharacter.isActiveCharacter &&
				actorCharacter.userId === userId
			) {
				actor = possibleActor;
				break;
			}
		}
		if (!actor) {
			throw new KoboldError(LL.utils.initiative.activeCharacterNotInInitError());
		}
		return actor;
	}

	public static nameMatchGeneric<T extends LowerNamedThing>(
		options: T[],
		name: string
	): T | null {
		let thing: T | null;
		if (options.length === 0) {
			return null;
		} else {
			const nameMatch = CharacterUtils.getBestNameMatch<{ Name: string; thing: T }>(
				name,
				options.map(thing => ({
					Name: String(thing.name),
					thing: thing,
				}))
			);
			thing = nameMatch?.thing ?? null;
		}
		return thing;
	}

	public static getNameMatchActorFromInitiative(
		userId: string,
		initiative: InitiativeWithRelations,
		characterName: string,
		LL?: TranslationFunctions,
		requireControlled: boolean = false
	): InitiativeActorWithRelations {
		LL = LL ?? L.en;
		// get actor options that match the given name, were created by you, or you're the gm of
		let actorOptions: InitiativeActor[] = [];
		if (requireControlled) {
			actorOptions = InitiativeUtils.getControllableInitiativeActors(initiative, userId);
		} else {
			actorOptions = initiative.actors ?? [];
		}
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActorWithRelations>(
			actorOptions,
			characterName
		);
		if (!result) throw new KoboldError(LL.utils.initiative.characterNameNotFoundError());
		return result;
	}

	public static getNameMatchGroupFromInitiative(
		initiative: InitiativeWithRelations,
		userId: string,
		groupName: string,
		LL: TranslationFunctions
	): InitiativeActorGroup {
		LL = LL || L.en;
		// get group options that match the given name, were created by you, or you're the gm of
		const groupOptions = InitiativeUtils.getControllableInitiativeGroups(initiative, userId);
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActorGroup>(
			groupOptions,
			groupName
		);
		if (!result) throw new KoboldError(LL.utils.initiative.characterNameNotFoundError());

		return result;
	}

	public static async getInitActorByName(
		intr: ChatInputCommandInteraction,
		name: string,
		LL?: TranslationFunctions
	) {
		let currentInit = await InitiativeUtils.getInitiativeForChannelOrNull(intr.channel);
		if (!currentInit) return null;

		const actor = await InitiativeUtils.getNameMatchActorFromInitiative(
			intr.user.id,
			currentInit,
			name,
			LL,
			false
		);
		return actor;
	}
}
