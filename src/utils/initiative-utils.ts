import {
	InitiativeActorGroup,
	InitiativeActor,
	Initiative,
	Character,
} from './../services/kobold/models/index.js';
import { CommandInteraction, GuildTextBasedChannel, Message, MessageEmbed, User } from 'discord.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import _ from 'lodash';
import { InteractionUtils } from './interaction-utils.js';
import { CharacterUtils } from './character-utils.js';

export class InitiativeBuilder {
	public init: Initiative;
	public actorsByGroup: { [key: number]: InitiativeActor[] };
	public groups: InitiativeActorGroup[];
	constructor({
		initiative,
		actors,
		groups,
	}: {
		initiative?: Initiative;
		actors?: InitiativeActor[];
		groups?: InitiativeActorGroup[];
	}) {
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
				errorMessage: "Yip! I can't go to the next turn when no one is in the initiative!",
			};
		}
		if (!this.init.currentTurnGroupId) {
			return {
				errorMessage:
					"Yip! I can't go to the previous turn when we haven't started initiative!",
			};
		} else {
			const currentTurnIndex = _.findIndex(
				this.groups,
				group => group.id === this.init.currentTurnGroupId
			);
			if (!this.groups[currentTurnIndex - 1]) {
				if (this.init.currentRound === 1) {
					return {
						errorMessage:
							"Yip! I can't go to the previous turn when it's " +
							'the very first turn of the first round!',
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
				errorMessage: "Yip! I can't go to the next turn when no one is in the initiative!",
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
	 * Creates a string that displays information for an actor group in an initiative display
	 * @param actorGroup The actor group to generate text for
	 * @returns
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

	async getCurrentRoundMessage(intr: CommandInteraction): Promise<Message<boolean>> {
		const targetMessageId = this.init.roundMessageIds[this.init.currentRound || 0];
		if (targetMessageId) {
			return await intr.channel.messages.fetch(targetMessageId);
		}
		return null;
	}
}

interface LowerNamedThing {
	name?: string;
}

export class InitiativeUtils {
	public static async getInitiativeForChannel(
		channel: GuildTextBasedChannel,
		options = { sendErrors: true }
	) {
		let errorMessage = null;
		if (!channel || !channel.id) {
			errorMessage =
				'Yip! You can only send initiative commands in a regular server channel.';
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
			errorMessage = "Yip! There's no active initiative in this channel.";
			return { init: null, errorMessage: errorMessage };
		}
		return { init: currentInit, errorMessage: errorMessage };
	}

	public static async updateInitiativeRoundMessageOrSendNew(
		intr: CommandInteraction,
		initBuilder: InitiativeBuilder
	): Promise<Message<boolean>> {
		try {
			const targetMessageId =
				initBuilder.init.roundMessageIds[initBuilder.init.currentRound || 0];
			if (!targetMessageId) {
				const err = new Error('Unknown Message');
				throw err;
			}
			const targetMessage = await intr.channel.messages.fetch(targetMessageId);
			const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
			await targetMessage.edit({ embeds: [embed] });
			return targetMessage;
		} catch (err) {
			if (err.message === 'Unknown Message' || err.code === 10008) {
				const embed = await KoboldEmbed.roundFromInitiativeBuilder(initBuilder);
				const newMessage = await InteractionUtils.send(intr, embed);
				const roundMessageIds = initBuilder.init.roundMessageIds;
				roundMessageIds[initBuilder.init.currentRound || 0] = newMessage.id;
				await Initiative.query().updateAndFetchById(initBuilder.init.id, {
					roundMessageIds,
				});
				return newMessage;
			}
		}
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

	public static getActiveCharacterActor(initiative: Initiative, userId: string) {
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
				errorMessage: `Yip! Your active character isn't in this initiative!`,
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
		characterName: string
	): { actor: InitiativeActor; errorMessage: string } {
		let errorMessage = null;
		let actor: InitiativeActor | null = null;
		// get actor options that match the given name, were created by you, or you're the gm of
		const actorOptions = InitiativeUtils.getControllableInitiativeActors(initiative, userId);
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActor>(
			actorOptions,
			characterName,
			`Yip! You don't have control of any characters in the initiative matching that name!`
		);

		return { actor: result.value, errorMessage: result.errorMessage };
	}

	public static getNameMatchGroupFromInitiative(
		initiative: Initiative,
		userId: string,
		groupName: string
	): { group: InitiativeActorGroup; errorMessage: string } {
		let errorMessage = null;
		let group: InitiativeActorGroup | null = null;
		// get group options that match the given name, were created by you, or you're the gm of
		const groupOptions = InitiativeUtils.getControllableInitiativeGroups(initiative, userId);
		const result = InitiativeUtils.nameMatchGeneric<InitiativeActorGroup>(
			groupOptions,
			groupName,
			`Yip! You don't have control of any characters in the initiative matching that name!`
		);

		return { group: result.value, errorMessage: result.errorMessage };
	}
}
