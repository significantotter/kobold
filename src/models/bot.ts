import {
	AutocompleteInteraction,
	CommandInteraction,
	ButtonInteraction,
	Client,
	Events,
	Guild,
	Interaction,
	Message,
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	RateLimitData,
	RESTEvents,
	User,
} from 'discord.js';

import {
	ButtonHandler,
	CommandHandler,
	GuildJoinHandler,
	GuildLeaveHandler,
	MessageHandler,
	ReactionHandler,
} from '../events/index.js';
import { JobService, Logger } from '../services/index.js';
import { PartialUtils } from '../utils/index.js';
import { Config } from './../config/config.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };

export class Bot {
	protected ready = false;

	constructor(
		protected token: string,
		protected client: Client,
		protected guildJoinHandler: GuildJoinHandler,
		protected guildLeaveHandler: GuildLeaveHandler,
		protected messageHandler: MessageHandler,
		protected commandHandler: CommandHandler,
		protected buttonHandler: ButtonHandler,
		protected reactionHandler: ReactionHandler,
		protected jobService: JobService
	) {}

	public async start(): Promise<void> {
		this.registerListeners();
		await this.login(this.token);
	}

	protected registerListeners(): void {
		this.client.on(Events.ClientReady, () => this.onReady());
		this.client.on(
			Events.ShardReady,
			(shardId: number, unavailableGuilds: Set<string> | undefined) =>
				this.onShardReady(shardId, unavailableGuilds ?? new Set())
		);
		this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild));
		this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild));
		this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
		this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
		this.client.on(
			Events.MessageReactionAdd,
			(messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
				this.onReaction(messageReaction, user)
		);
		this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
			this.onRateLimit(rateLimitData)
		);
	}

	protected async login(token: string): Promise<void> {
		try {
			await this.client.login(token);
		} catch (error) {
			Logger.error(Logs.error.clientLogin, error);
			return;
		}
	}

	protected async onReady(): Promise<void> {
		let userTag = this.client.user?.tag ?? '';
		Logger.info(Logs.info.clientLogin.replaceAll('{USER_TAG}', userTag));

		if (!Config.debug.dummyMode.enabled) {
			this.jobService.start();
		}

		this.ready = true;
		Logger.info(Logs.info.clientReady);
	}

	protected onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
		Logger.setShardId(shardId);
	}

	protected async onGuildJoin(guild: Guild): Promise<void> {
		if (!this.ready || Config.debug.dummyMode.enabled) {
			return;
		}

		try {
			await this.guildJoinHandler.process(guild);
		} catch (error) {
			Logger.error(Logs.error.guildJoin, error);
		}
	}

	protected async onGuildLeave(guild: Guild): Promise<void> {
		if (!this.ready || Config.debug.dummyMode.enabled) {
			return;
		}

		try {
			await this.guildLeaveHandler.process(guild);
		} catch (error) {
			Logger.error(Logs.error.guildLeave, error);
		}
	}

	protected async onMessage(msg: Message): Promise<void> {
		if (
			!this.ready ||
			(Config.debug.dummyMode.enabled &&
				!(Config.debug.dummyMode.whiteList ?? []).includes(msg.author.id))
		) {
			return;
		}

		try {
			const filledMessage = await PartialUtils.fillMessage(msg);
			if (!filledMessage) {
				return;
			}

			await this.messageHandler.process(filledMessage);
		} catch (error) {
			Logger.error(Logs.error.message, error);
		}
	}

	protected async onInteraction(intr: Interaction): Promise<void> {
		if (
			!this.ready ||
			(Config.debug.dummyMode.enabled &&
				!(Config.debug.dummyMode.whiteList ?? []).includes(intr.user.id))
		) {
			return;
		}

		if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
			try {
				await this.commandHandler.process(intr);
			} catch (error) {
				Logger.error(Logs.error.command, error);
			}
		} else if (intr instanceof ButtonInteraction) {
			try {
				await this.buttonHandler.process(intr);
			} catch (error) {
				Logger.error(Logs.error.button, error);
			}
		}
	}

	protected async onReaction(
		msgReaction: MessageReaction | PartialMessageReaction,
		reactor: User | PartialUser
	): Promise<void> {
		if (
			!this.ready ||
			(Config.debug.dummyMode.enabled &&
				!(Config.debug.dummyMode.whiteList ?? []).includes(reactor.id))
		) {
			return;
		}

		try {
			const filledReaction = await PartialUtils.fillReaction(msgReaction);
			if (!filledReaction) {
				return;
			}

			const filledReactor = await PartialUtils.fillUser(reactor);
			if (!filledReactor) {
				return;
			}

			await this.reactionHandler.process(
				filledReaction,
				msgReaction.message as Message,
				filledReactor
			);
		} catch (error) {
			Logger.error(Logs.error.reaction, error);
		}
	}

	protected async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
		if (rateLimitData.timeToReset >= Config.logging.rateLimit.minTimeout * 1000) {
			Logger.error(Logs.error.apiRateLimit, rateLimitData);
		}
	}
}
