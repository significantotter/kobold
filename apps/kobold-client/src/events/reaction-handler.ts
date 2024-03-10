import { Message, MessageReaction, User } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Reaction } from '../reactions/index.js';
import { EventHandler } from './event-handler.js';
import { Config } from 'kobold-config';

export class ReactionHandler implements EventHandler {
	protected rateLimiter = new RateLimiter(
		Config.rateLimiting.reactions.amount,
		Config.rateLimiting.reactions.interval * 1000
	);

	constructor(protected reactions: Reaction[]) {}

	public async process(msgReaction: MessageReaction, msg: Message, reactor: User): Promise<void> {
		// Don't respond to self, or other bots
		if (reactor.id === msgReaction.client.user?.id || reactor.bot) {
			return;
		}

		// Check if user is rate limited
		let limited = this.rateLimiter.take(msg.author.id);
		if (limited) {
			return;
		}

		// Try to find the reaction the user wants
		let reaction = this.findReaction(msgReaction.emoji.name ?? '');
		if (!reaction) {
			return;
		}

		if (reaction.requireGuild && !msg.guild) {
			return;
		}

		if (reaction.requireSentByClient && msg.author.id !== msg.client.user?.id) {
			return;
		}

		// Check if the embeds author equals the reactors tag
		if (reaction.requireEmbedAuthorTag && msg.embeds[0]?.author?.name !== reactor.tag) {
			return;
		}

		// TODO: Get data from database

		// Execute the reaction
		await reaction.execute(msgReaction, msg, reactor);
	}

	protected findReaction(emoji: string): Reaction | undefined {
		return this.reactions.find(reaction => reaction.emoji === emoji);
	}
}
