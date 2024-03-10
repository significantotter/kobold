import { CommandInteraction, Message } from 'discord.js';
import _ from 'lodash';
import L from '../i18n/i18n-node.js';
import { TranslationFunctions } from '../i18n/i18n-types.js';
import {
	CharacterWithRelations,
	InitiativeActor,
	InitiativeActorGroup,
	InitiativeActorWithRelations,
	InitiativeWithRelations,
	UserSettings,
} from 'kobold-db';
import { KoboldError } from './KoboldError.js';
import { Creature } from './creature.js';
import { DefaultUtils } from './default-utils.js';
import { InteractionUtils } from './interaction-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { RollBuilder } from './roll-builder.js';
import { StringUtils } from './string-utils.js';

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
		actors?: InitiativeActorWithRelations[];
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
		this.userSettings = _.defaults(userSettings, DefaultUtils.userSettings);
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
		initiative?: InitiativeWithRelations;
		actors?: InitiativeActorWithRelations[];
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
		const result = StringUtils.nameMatchGeneric<InitiativeActorGroup>(this.groups, groupName);
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
		actor: InitiativeActorWithRelations,
		options: {
			showHiddenCreatureStats?: boolean;
		} = { showHiddenCreatureStats: false }
	): string {
		let turnText = '';
		const sheet = actor.sheetRecord.sheet;
		// use a second line for an actor with a too-long name
		if (actor.name.length > 40) {
			turnText += '\n';
		}
		if (sheet.baseCounters.hp.current === undefined) {
			return turnText;
		}
		// if we should hide the creature's stats, do so
		if (!options.showHiddenCreatureStats && actor.hideStats) {
			const hp = sheet.baseCounters.hp.current;
			turnText += ` <${this.hpTextFromValue(
				sheet.baseCounters.hp.current,
				sheet.baseCounters.hp.max ?? 0
			)}>`;
			if (sheet.staticInfo.usesStamina) {
				turnText += ` <${this.staminaTextFromValue(
					sheet.baseCounters.stamina.current,
					sheet.baseCounters.stamina.max ?? 0
				)}>`;
			}
			if (sheet.baseCounters.tempHp.current) {
				turnText += `<THP ?/?>`;
			}
		}

		// otherwise, display the creature's stats if we can
		else {
			turnText += ` <HP ${sheet.baseCounters.hp.current}`;
			turnText += `/${sheet.baseCounters.hp.max}`;
			turnText += `>`;
			if (sheet.staticInfo.usesStamina) {
				turnText += `<SP ${sheet.baseCounters.stamina.current}`;
				turnText += `/${sheet.baseCounters.stamina.max}`;
				turnText += `>`;

				turnText += `<RP ${sheet.baseCounters.resolve.current}`;
				turnText += `/${sheet.baseCounters.resolve.max}`;
				turnText += `>`;
			}
			if (sheet.baseCounters.tempHp.current) {
				turnText += `<THP ${sheet.baseCounters.tempHp.current}>`;
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

export class InitiativeBuilderUtils {
	public static async sendNewRoundMessage(
		intr: CommandInteraction,
		initBuilder: InitiativeBuilder
	): Promise<Message<boolean> | undefined> {
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
		return await InteractionUtils.send(intr, embed);
	}
	/**
	 * adds a character to initiative.
	 * @returns A kobold embed message with a roll result message for the initiative join operation
	 */
	public static async rollNewInitiative({
		character,
		skillChoice,
		diceExpression,
		initiativeValue,
		userSettings,
	}: {
		character: CharacterWithRelations;
		skillChoice?: string | null;
		diceExpression?: string | null;
		initiativeValue?: number | null;
		userSettings: UserSettings;
	}): Promise<RollBuilder | number> {
		let finalInitiative: number = 0;
		let rollBuilderResponse: RollBuilder | undefined = undefined;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
		} else if (skillChoice) {
			rollBuilderResponse = await RollBuilder.fromSimpleCreatureRoll({
				creature: Creature.fromSheetRecord(character.sheetRecord),
				attributeName: skillChoice,
				modifierExpression: diceExpression,
				tags: ['initiative'],
				LL: L.en,
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;
		} else if (diceExpression) {
			rollBuilderResponse = new RollBuilder({
				character: character,
				rollDescription: L.en.commands.init.join.interactions.joinedEmbed.rollDescription(),
				userSettings,
				LL: L.en,
			});
			rollBuilderResponse.addRoll({
				rollTitle: 'Initiative',
				rollExpression: diceExpression,
				tags: ['initiative'],
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;
		} else {
			rollBuilderResponse = await RollBuilder.fromSimpleCreatureRoll({
				creature: Creature.fromSheetRecord(character.sheetRecord),
				attributeName: 'perception',
				modifierExpression: diceExpression,
				tags: ['initiative'],
				userSettings,
			});
			finalInitiative = rollBuilderResponse.getRollTotalArray()[0] ?? 0;
		}
		return rollBuilderResponse ?? finalInitiative;
	}

	public static getUniqueInitActorName(
		currentInit: InitiativeWithRelations,
		desiredName: string
	) {
		let nameCount = 1;
		let existingName = (currentInit.actors ?? []).find(
			(actor: InitiativeActor) => actor.name.toLowerCase() === desiredName.toLowerCase()
		);
		let uniqueName = desiredName;
		if (existingName) {
			while (
				(currentInit.actors ?? []).find(
					(actor: InitiativeActor) =>
						actor.name.toLowerCase() === uniqueName.toLowerCase()
				)
			) {
				uniqueName = desiredName + `-${nameCount++}`;
			}
		}
		return uniqueName;
	}

	public static initiativeJoinEmbed(
		finalInitiative: RollBuilder | number,
		name: string
	): KoboldEmbed {
		let rollResultMessage: KoboldEmbed;
		if (_.isNumber(finalInitiative)) {
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					L.en.commands.init.join.interactions.joinedEmbed.title({
						characterName: name,
					})
				)
				.setDescription(
					L.en.commands.init.join.interactions.joinedEmbed.setDescription({
						initValue: finalInitiative,
					})
				);
		} else {
			rollResultMessage = finalInitiative.compileEmbed().setTitle(
				L.en.commands.init.join.interactions.joinedEmbed.title({
					characterName: name,
				})
			);
		}

		return rollResultMessage;
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

	public static getNameMatchActorFromInitiative(
		userId: string,
		initiative: InitiativeWithRelations,
		characterName: string,
		requireControlled: boolean = false
	): InitiativeActorWithRelations {
		// get actor options that match the given name, were created by you, or you're the gm of
		let actorOptions: InitiativeActorWithRelations[] = [];
		if (requireControlled) {
			actorOptions = InitiativeBuilderUtils.getControllableInitiativeActors(
				initiative,
				userId
			);
		} else {
			actorOptions = initiative.actors ?? [];
		}
		const result = StringUtils.nameMatchGeneric<InitiativeActorWithRelations>(
			actorOptions,
			characterName
		);
		if (!result) throw new KoboldError(L.en.utils.initiative.characterNameNotFoundError());
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
		const groupOptions = InitiativeBuilderUtils.getControllableInitiativeGroups(
			initiative,
			userId
		);
		const result = StringUtils.nameMatchGeneric<InitiativeActorGroup>(groupOptions, groupName);
		if (!result) throw new KoboldError(LL.utils.initiative.characterNameNotFoundError());

		return result;
	}
}
