import {
	InitiativeActorGroup,
	InitiativeActor,
	Initiative,
	Character,
} from './../services/kobold/models/index.js';
import { CommandInteraction, GuildTextBasedChannel, MessageEmbed, User } from 'discord.js';
import _ from 'lodash';
import { InteractionUtils } from './interaction-utils.js';
import { getBestNameMatch } from './character-utils.js';
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
		this.groups = (groups || []).sort((a, b) => {
			let comparison = a.initiativeResult - b.initiativeResult;
			if (comparison === 0) comparison = a.name.localeCompare(b.name);
			if (comparison === 0) comparison = a.id - b.id;
			return comparison;
		});
	}

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
			this.groups = groups.sort((a, b) => {
				let comparison = a.initiativeResult - b.initiativeResult;
				if (comparison === 0) comparison = a.name.localeCompare(b.name);
				if (comparison === 0) comparison = a.id - b.id;
				return comparison;
			});
		}
	}

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

	compileEmbed(): MessageEmbed {
		const result = new MessageEmbed()
			.setColor('GREEN')
			.setTitle(`Initiative Round ${this.init?.currentRound || 0}`);
		let builtTurnText = '';
		for (const group of this.groups) {
			const actorsInGroup = this.actorsByGroup[group.id];
			if (actorsInGroup.length === 1 && actorsInGroup[0].name === group.name) {
				//We're just displaying the actor in its initiative slot
				builtTurnText += `${group.initiativeResult}: ${group.name}`;
			} else {
				builtTurnText += `${group.initiativeResult}: ${group.name}\n` + '```';
				for (const actor of actorsInGroup.sort((a, b) => a.name.localeCompare(b.name))) {
					builtTurnText += `    ${actor.name}\n`;
				}
				builtTurnText += '```';
			}
			builtTurnText += '\n';
		}
		result.setDescription(builtTurnText);
		return result;
	}
}

export async function getInitiativeForChannel(
	channel: GuildTextBasedChannel,
	options = { sendErrors: true }
) {
	let errorMessage = null;
	if (!channel || !channel.id) {
		errorMessage = 'Yip! You can only send initiative commands in a regular server channel.';
		return { init: null, error: errorMessage };
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
		return { init: null, error: errorMessage };
	}
	return { init: currentInit, errorMessage: errorMessage };
}

export async function updateInitiativeRoundMessageOrSendNew(intr, initBuilder) {
	try {
		const targetMessageId =
			initBuilder.init.roundMessageIds[initBuilder.init.currentRound || 0];
		if (!targetMessageId) {
			const err = new Error('Unknown Message');
			throw err;
		}
		const targetMessage = await intr.channel.messages.fetch(targetMessageId);
		await targetMessage.edit({ embeds: [initBuilder.compileEmbed()] });
	} catch (err) {
		if (err.message === 'Unknown Message' || err.code === 10008) {
			const newMessage = await InteractionUtils.send(intr, initBuilder.compileEmbed());
			const roundMessageIds = initBuilder.init.roundMessageIds;
			roundMessageIds[initBuilder.init.currentRound || 0] = newMessage.id;
			await Initiative.query().updateAndFetchById(initBuilder.init.id, { roundMessageIds });
		}
	}
}

export function getControllableInitiativeActors(initiative, userId) {
	const actorOptions = initiative.actors as InitiativeActor[];
	const controllableActors = actorOptions.filter(
		actor => initiative.gmUserId === userId || actor.userId === userId
	);
	return actorOptions;
}

export async function getNameMatchCharacterFromInitiative(
	userId: string,
	initiative: Initiative,
	characterName?: string
) {
	let errorMessage = null;
	let actor = null;
	if (characterName) {
		// get actor options that match the given name, were created by you, or you're the gm of
		const actorOptions = getControllableInitiativeActors(initiative, userId);
		if (actorOptions.length === 0) {
			return {
				actor,
				errorMessage:
					`Yip! You don't have control of any characters ` +
					`in the initiative matching that name!`,
			};
		} else {
			const actorMatch = getBestNameMatch<{ Name: string; actor: InitiativeActor }>(
				characterName,
				actorOptions.map(actor => ({
					Name: actor.name,
					actor: actor,
				}))
			);
			actor = actorMatch.actor;
		}
	} else {
		for (const possibleActor of initiative.actors as InitiativeActor[]) {
			const actorCharacter = possibleActor.character as Character;
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
	}
	return { actor, errorMessage: '' };
}
