import { TranslationFunctions } from './../i18n/i18n-types';
import {
	InitiativeActorGroup,
	InitiativeActor,
	Initiative,
	Character,
} from './../services/kobold/models/index.js';
import {
	CommandInteraction,
	GuildTextBasedChannel,
	Message,
	EmbedBuilder,
	User,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import _ from 'lodash';
import { InteractionUtils } from './interaction-utils.js';
import { CharacterUtils } from './character-utils.js';
import { Language } from '../models/enum-helpers/index.js';
import { DiceUtils, RollBuilder } from './dice-utils.js';

export class InitiativeBuilder {
	public init: Initiative;
	public actorsByGroup: { [key: number]: InitiativeActor[] };
	public groups: InitiativeActorGroup[];
	private LL: TranslationFunctions;

	constructor({
		initiative,
		actors,
		groups,
		LL,
	}: {
		initiative?: Initiative;
		actors?: InitiativeActor[];
		groups?: InitiativeActorGroup[];
		LL?: TranslationFunctions;
	}) {
		this.LL = LL || Language.LL;
		this.init = initiative;
		if (initiative && !actors) actors = initiative.actors;
		if (initiative && !groups) groups = initiative.actorGroups;
		this.actorsByGroup = _.groupBy(actors || [], actor => actor.initiativeActorGroupId);
		this.groups = (groups || []).sort(InitiativeBuilder.groupSortFunction);
	}

	public static groupSortFunction(a: InitiativeActorGroup, b: InitiativeActorGroup) {
		let comparison = b.initiativeResult - a.initiativeResult;
		if (comparison === 0) comparison = a.name.localeCompare(b.name);
		if (comparison === 0) comparison = a.id - b.id;
		return comparison;
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
	 * Gets the changed initiative data when going to the previous turn in the built initiative
	 * @returns An object containing updates to the initiative, or an error message
	 */
	getPreviousTurnChanges(): {
		currentRound?: number;
		currentTurnGroupId?: number;
		errorMessage?: string;
	} {
		if (!this.groups.length) {
			return {
				errorMessage: this.LL.utils.initiative.prevTurnInitEmptyError(),
			};
		}
		if (!this.init.currentTurnGroupId) {
			return {
				errorMessage: this.LL.utils.initiative.prevTurnInitNotStartedError(),
			};
		} else {
			const currentTurnIndex = _.findIndex(
				this.groups,
				group => group.id === this.init.currentTurnGroupId
			);
			if (!this.groups[currentTurnIndex - 1]) {
				if (this.init.currentRound === 1) {
					return {
						errorMessage: this.LL.utils.initiative.prevTurnNotPossibleError(),
					};
				}
				//move to the previous round!
				return {
					currentRound: (this.init.currentRound || 1) - 1,
					currentTurnGroupId: this.groups[this.groups.length - 1].id,
					errorMessage: undefined,
				};
			} else {
				return {
					currentRound: this.init.currentRound || 1,
					currentTurnGroupId: this.groups[currentTurnIndex - 1].id,
					errorMessage: undefined,
				};
			}
		}
	}

	/**
	 * Gets the changed initiative data when going to the next turn in the built initiative
	 * @returns An object containing updates to the initiative, or an error message
	 */
	getNextTurnChanges(): {
		currentRound?: number;
		currentTurnGroupId?: number;
		errorMessage?: string;
	} {
		if (!this.groups.length) {
			return {
				errorMessage: this.LL.utils.initiative.nextTurnInitEmptyError(),
			};
		}
		if (!this.init.currentTurnGroupId) {
			return {
				currentRound: this.init.currentRound || 1,
				currentTurnGroupId: this.groups[0].id,
				errorMessage: undefined,
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
					errorMessage: undefined,
				};
			} else {
				return {
					currentRound: this.init.currentRound || 1,
					currentTurnGroupId: this.groups[currentTurnIndex + 1].id,
					errorMessage: undefined,
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
	public getAllGroupsTurnText(): string {
		let builtTurnText = '```md\n';
		for (const group of this.groups) {
			builtTurnText += this.getActorGroupTurnText(group);
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
	public getActorGroupTurnText(actorGroup: InitiativeActorGroup): string {
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
		} else {
			turnText += `${extraSymbol} ${actorGroup.initiativeResult}: ${actorGroup.name}\n`;
			const sortedActors = actorsInGroup.sort((a, b) => a.name.localeCompare(b.name));
			for (let i = 0; i < sortedActors.length; i++) {
				turnText += `       ${i}. ${sortedActors[i].name}\n`;
			}
		}
		return turnText;
	}

	get activeGroup() {
		return this.groups.find(group => group.id === this.init.currentTurnGroupId);
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
		LL,
	}: {
		character: Character;
		currentInit: Initiative;
		skillChoice?: string;
		diceExpression: string;
		initiativeValue?: number;
		userName: string;
		userId: string;
		LL: TranslationFunctions;
	}): Promise<KoboldEmbed> {
		let finalInitiative = 0;
		let rollResultMessage: KoboldEmbed;
		if (initiativeValue) {
			finalInitiative = initiativeValue;
			rollResultMessage = new KoboldEmbed()
				.setTitle(
					LL.commands.init.join.interactions.joinedEmbed.title({
						characterName: character.characterData.name,
					})
				)
				.setDescription(
					LL.commands.init.join.interactions.joinedEmbed.setDescription({
						initValue: finalInitiative,
					})
				);
			if (character.characterData.infoJSON?.imageURL) {
				rollResultMessage.setThumbnail(character.characterData.infoJSON?.imageURL);
			}
		} else if (skillChoice) {
			const response = await DiceUtils.rollSkill({
				userName,
				activeCharacter: character,
				skillChoice,
				modifierExpression: diceExpression,
				tags: ['initiative'],
				LL,
			});
			finalInitiative = response.getRollTotalArray()[0] || 0;
			rollResultMessage = response.compileEmbed();
		} else if (diceExpression) {
			const rollBuilder = new RollBuilder({
				character: character,
				rollDescription: LL.commands.init.join.interactions.joinedEmbed.rollDescription(),
				LL,
			});
			rollBuilder.addRoll({
				rollExpression: diceExpression,
				tags: ['initiative'],
			});
			finalInitiative = rollBuilder.getRollTotalArray()[0] || 0;
			rollResultMessage = rollBuilder.compileEmbed();
		} else {
			const response = await DiceUtils.rollSkill({
				userName,
				activeCharacter: character,
				skillChoice: 'Perception',
				modifierExpression: diceExpression,
				tags: ['initiative'],
			});
			finalInitiative = response.getRollTotalArray()[0] || 0;
			rollResultMessage = response.compileEmbed();
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
		let existingName = currentInit.actors.find(
			actor => actor.name.toLowerCase() === character.characterData.name.toLowerCase()
		);
		let uniqueName = character.characterData.name;
		if (existingName) {
			while (
				currentInit.actors.find(
					actor => actor.name.toLowerCase() === uniqueName.toLowerCase()
				)
			) {
				uniqueName = character.characterData.name + `-${nameCount++}`;
			}
		}

		const newActor = await InitiativeActor.query().insertGraphAndFetch({
			initiativeId: currentInit.id,
			name: uniqueName,
			characterId: character.id,
			userId,

			actorGroup: {
				initiativeId: currentInit.id,
				userId,
				name: uniqueName,
				initiativeResult: finalInitiative,
			},
		});

		currentInit.actors = currentInit.actors.concat(newActor);
		currentInit.actorGroups = currentInit.actorGroups.concat(newActor.actorGroup);

		return rollResultMessage;
	}

	public static async getInitiativeForChannel(
		channel: GuildTextBasedChannel,
		options = { sendErrors: true, LL: Language.LL }
	) {
		const LL = options.LL;
		let errorMessage = null;
		if (!channel || !channel.id) {
			errorMessage = LL.utils.initiative.initOutsideServerChannelError();
			return { init: null, errorMessage: errorMessage };
		}
		const channelId = channel.id;

		const currentInit = await Initiative.query()
			.withGraphFetched('[actors.[character], actorGroups]')
			.where({
				channelId,
			})
			.first();
		if (!currentInit || currentInit.length === 0) {
			errorMessage = LL.utils.initiative.noActiveInitError();
			return { init: null, errorMessage: errorMessage };
		}
		return { init: currentInit, errorMessage: errorMessage };
	}

	public static async sendNewRoundMessage(
		intr: CommandInteraction,
		initBuilder: InitiativeBuilder
	): Promise<Message<boolean>> {
		const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
		return await InteractionUtils.send(intr, embed);
	}

	public static getControllableInitiativeActors(initiative: Initiative, userId: string) {
		const actorOptions = initiative.actors;
		const controllableActors = actorOptions.filter(
			actor => initiative.gmUserId === userId || actor.userId === userId
		);
		return controllableActors;
	}
	public static getControllableInitiativeGroups(initiative: Initiative, userId: string) {
		const actorGroupOptions = initiative.actorGroups;
		const controllableGroups = actorGroupOptions.filter(
			group => initiative.gmUserId === userId || group.userId === userId
		);
		return controllableGroups;
	}

	public static getActiveCharacterActor(
		initiative: Initiative,
		userId: string,
		LL: TranslationFunctions
	) {
		LL = Language.LL;
		let actor: InitiativeActor = null;
		let errorMessage: string = null;
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
			return {
				actor,
				errorMessage: LL.utils.initiative.activeCharacterNotInInitError(),
			};
		}
		return { actor, errorMessage };
	}

	public static nameMatchGeneric<T extends LowerNamedThing>(
		options: T[],
		name: string,
		noChoicesError: string
	): { value: T; errorMessage: string } {
		let thing;
		let errorMessage;
		if (options.length === 0) {
			return {
				value: null,
				errorMessage: noChoicesError,
			};
		} else {
			const nameMatch = CharacterUtils.getBestNameMatch<{ Name: string; thing: T }>(
				name,
				options.map(thing => ({
					Name: thing.name,
					thing: thing,
				}))
			);
			thing = nameMatch.thing;
		}
		return { value: thing, errorMessage: '' };
	}

	public static getNameMatchActorFromInitiative(
		userId: string,
		initiative: Initiative,
		characterName: string,
		LL: TranslationFunctions
	): { actor: InitiativeActor; errorMessage: string } {
		LL = LL || Language.LL;
		let errorMessage = null;
		let actor: InitiativeActor | null = null;
		// get actor options that match the given name, were created by you, or you're the gm of
		const actorOptions = InitiativeUtils.getControllableInitiativeActors(initiative, userId);
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActor>(
			actorOptions,
			characterName,
			LL.utils.initiative.characterNameNotFoundError()
		);

		return { actor: result.value, errorMessage: result.errorMessage };
	}

	public static getNameMatchGroupFromInitiative(
		initiative: Initiative,
		userId: string,
		groupName: string,
		LL: TranslationFunctions
	): { group: InitiativeActorGroup; errorMessage: string } {
		LL = LL || Language.LL;
		let errorMessage = null;
		let group: InitiativeActorGroup | null = null;
		// get group options that match the given name, were created by you, or you're the gm of
		const groupOptions = InitiativeUtils.getControllableInitiativeGroups(initiative, userId);
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActorGroup>(
			groupOptions,
			groupName,
			LL.utils.initiative.characterNameNotFoundError()
		);

		return { group: result.value, errorMessage: result.errorMessage };
	}
}
