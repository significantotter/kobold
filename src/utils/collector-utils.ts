// https://github.com/KevinNovak/discord.js-Collector-Utils
// v. 1.9.0
// wasn't working with jest imports, so moved here

import {
	ButtonInteraction,
	ComponentType,
	Message,
	MessageReaction,
	ModalBuilder,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	TextBasedChannel,
	User,
} from 'discord.js';
import _ from 'lodash';

export class CollectorUtils {
	/**
	 * Collect a response by buttons.
	 * @param message Message to collect button interactions on.
	 * @param retriever Method which takes a collected button interaction and returns a desired result, or `undefined` if invalid.
	 * @param options Options for collection.
	 * @returns A desired result, or `undefined` if the collector expired.
	 */
	public static async collectByButton<T>(
		message: Message,
		retriever: ButtonRetriever<T>,
		options: CollectOptions = {}
	): Promise<
		| {
				intr: ButtonInteraction;
				value: T;
		  }
		| undefined
	> {
		const defaultedOptions = _.defaults(options, {
			time: 120000,
			reset: true,
		});

		return new Promise(async (resolve, reject) => {
			let btnCollector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: intr => {
					if (defaultedOptions.target) {
						return intr.user.id === defaultedOptions.target.id;
					}

					return true;
				},
				time: defaultedOptions.time,
			});

			let stopCollector = message.channel.createMessageCollector({
				filter: message => {
					if (!defaultedOptions.stopFilter) {
						return false;
					}

					let stop = defaultedOptions.stopFilter(message);
					if (!stop) {
						return false;
					}

					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				// Make sure message collector is ahead of reaction collector
				time: defaultedOptions.time + 1000,
			});

			let expired = true;

			btnCollector.on('collect', async (intr: ButtonInteraction) => {
				let result = await retriever(intr);
				if (result === undefined) {
					if (defaultedOptions.reset) {
						btnCollector.resetTimer();
						stopCollector.resetTimer();
					}
					return;
				} else {
					expired = false;
					btnCollector.stop();
					resolve(result);
					return;
				}
			});

			btnCollector.on('end', async collected => {
				stopCollector.stop();
				if (expired && defaultedOptions.onExpire) {
					await defaultedOptions.onExpire();
				}
			});

			stopCollector.on('collect', async (nextMsg: Message) => {
				expired = false;
				btnCollector.stop();
				resolve(undefined);
			});
		});
	}

	/**
	 * Collect a response by select menu.
	 * @param message Message to collect select menu interactions on.
	 * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
	 * @param options Options for collection.
	 * @returns A desired result, or `undefined` if the collector expired.
	 */
	public static async collectBySelectMenu<T>(
		message: Message,
		retriever: SelectMenuRetriever<T>,
		options: CollectOptions = {}
	): Promise<
		| {
				intr: SelectMenuInteraction;
				value: T;
		  }
		| undefined
	> {
		const defaultedOptions = _.defaults(options, {
			time: 120000,
			reset: true,
		});

		return new Promise(async (resolve, reject) => {
			let smCollector = message.createMessageComponentCollector({
				componentType: ComponentType.SelectMenu,
				filter: intr => {
					if (defaultedOptions.target) {
						return intr.user.id === defaultedOptions.target.id;
					}

					return true;
				},
				time: defaultedOptions.time,
			});

			let stopCollector = message.channel.createMessageCollector({
				filter: message => {
					if (!defaultedOptions.stopFilter) {
						return false;
					}

					let stop = defaultedOptions.stopFilter(message);
					if (!stop) {
						return false;
					}

					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				// Make sure message collector is ahead of reaction collector
				time: defaultedOptions.time + 1000,
			});

			let expired = true;

			smCollector.on('collect', async (intr: SelectMenuInteraction) => {
				let result = await retriever(intr);
				if (result === undefined) {
					if (defaultedOptions.reset) {
						smCollector.resetTimer();
						stopCollector.resetTimer();
					}
					return;
				} else {
					expired = false;
					smCollector.stop();
					resolve(result);
					return;
				}
			});

			smCollector.on('end', async collected => {
				stopCollector.stop();
				if (expired && defaultedOptions.onExpire) {
					await defaultedOptions.onExpire();
				}
			});

			stopCollector.on('collect', async (nextMsg: Message) => {
				expired = false;
				smCollector.stop();
				resolve(undefined);
			});
		});
	}

	/**
	 * Collect a response through a modal.
	 * @param message Message to collect button interactions on.
	 * @param modal Modal to show when the button is clicked.
	 * @param retriever Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
	 * @param options Options for collection.
	 * @returns A desired result, or `undefined` if the collector expired.
	 */
	public static async collectByModal<T>(
		message: Message,
		modal: ModalBuilder,
		retriever: ModalRetriever<T>,
		options: CollectOptions = {}
	): Promise<
		| {
				intr: ModalSubmitInteraction;
				value: T;
		  }
		| undefined
	> {
		const defaultedOptions = _.defaults(options, {
			time: 120000,
			reset: true,
		});

		return new Promise(async (resolve, reject) => {
			let btnCollector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: intr => {
					if (defaultedOptions.target) {
						return intr.user.id === defaultedOptions.target.id;
					}

					return true;
				},
				time: defaultedOptions.time,
			});

			let stopCollector = message.channel.createMessageCollector({
				filter: message => {
					if (!defaultedOptions.stopFilter) {
						return false;
					}

					let stop = defaultedOptions.stopFilter(message);
					if (!stop) {
						return false;
					}

					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				// Make sure message collector is ahead of reaction collector
				time: defaultedOptions.time + 1000,
			});

			let expired = true;

			btnCollector.on('collect', async (intr: ButtonInteraction) => {
				modal.setCustomId(`modal-${intr.id}`);
				await intr.showModal(modal);

				let modalIntr: ModalSubmitInteraction;
				try {
					modalIntr = await intr.awaitModalSubmit({
						filter: (modalIntr: ModalSubmitInteraction) =>
							modalIntr.customId === `modal-${intr.id}`,
						time: defaultedOptions.time,
					});
				} catch (error) {
					// Timed out
					return;
				}

				let result = await retriever(modalIntr);
				if (result === undefined) {
					if (defaultedOptions.reset) {
						btnCollector.resetTimer();
						stopCollector.resetTimer();
					}
					return;
				} else {
					expired = false;
					btnCollector.stop();
					resolve(result);
					return;
				}
			});

			btnCollector.on('end', async collected => {
				stopCollector.stop();
				if (expired && defaultedOptions.onExpire) {
					await defaultedOptions.onExpire();
				}
			});

			stopCollector.on('collect', async (nextMsg: Message) => {
				expired = false;
				btnCollector.stop();
				resolve(undefined);
			});
		});
	}

	/**
	 * Collect a response by reactions.
	 * @param message Message to collect reactions on.
	 * @param retriever Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
	 * @param options Options for collection.
	 * @returns A desired result, or `undefined` if the collector expired.
	 */
	public static async collectByReaction<T>(
		message: Message,
		retriever: ReactionRetriever<T>,
		options: CollectOptions = {}
	): Promise<T | undefined> {
		const defaultedOptions = _.defaults(options, {
			time: 120000,
			reset: true,
		});

		return new Promise(async (resolve, reject) => {
			let reactCollector = message.createReactionCollector({
				filter: (msgReaction, reactor) => {
					if (defaultedOptions.target) {
						return reactor.id === defaultedOptions.target.id;
					}

					return true;
				},
				time: defaultedOptions.time,
			});

			let stopCollector = message.channel.createMessageCollector({
				filter: message => {
					if (!defaultedOptions.stopFilter) {
						return false;
					}

					let stop = defaultedOptions.stopFilter(message);
					if (!stop) {
						return false;
					}

					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				// Make sure message collector is ahead of reaction collector
				time: defaultedOptions.time + 1000,
			});

			let expired = true;

			reactCollector.on('collect', async (msgReaction: MessageReaction, reactor: User) => {
				let result = await retriever(msgReaction, reactor);
				if (result === undefined) {
					if (defaultedOptions.reset) {
						reactCollector.resetTimer();
						stopCollector.resetTimer();
					}
					return;
				} else {
					expired = false;
					reactCollector.stop();
					resolve(result);
					return;
				}
			});

			reactCollector.on('end', async collected => {
				stopCollector.stop();
				if (expired && defaultedOptions.onExpire) {
					await defaultedOptions.onExpire();
				}
			});

			stopCollector.on('collect', async (nextMsg: Message) => {
				expired = false;
				reactCollector.stop();
				resolve(undefined);
			});
		});
	}

	/**
	 * Collect a response by messages.
	 * @param channel Channel to collect messages on.
	 * @param retriever Method which takes a collected message and returns a desired result, or `undefined` if invalid.
	 * @param options Options for collection.
	 * @returns A desired result, or `undefined` if the collector expired.
	 */
	public static async collectByMessage<T>(
		channel: TextBasedChannel,
		retriever: MessageRetriever<T>,
		options: CollectOptions = {}
	): Promise<T | undefined> {
		const defaultedOptions = _.defaults(options, {
			time: 120000,
			reset: true,
		});

		return new Promise(async (resolve, reject) => {
			let msgCollector = channel.createMessageCollector({
				filter: message => {
					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				time: defaultedOptions.time,
			});

			let stopCollector = channel.createMessageCollector({
				filter: message => {
					if (!defaultedOptions.stopFilter) {
						return false;
					}

					let stop = defaultedOptions.stopFilter(message);
					if (!stop) {
						return false;
					}

					if (defaultedOptions.target) {
						return message.author.id === defaultedOptions.target.id;
					}

					return true;
				},
				// Make sure message collector is ahead of reaction collector
				time: defaultedOptions.time + 1000,
			});

			let expired = true;

			msgCollector.on('collect', async (nextMsg: Message) => {
				let stop = defaultedOptions?.stopFilter?.(nextMsg);
				if (stop) {
					// Let the stopCollector handle
					return;
				}

				let result = await retriever(nextMsg);
				if (result === undefined) {
					if (defaultedOptions.reset) {
						msgCollector.resetTimer();
						stopCollector.resetTimer();
					}
					return;
				} else {
					expired = false;
					msgCollector.stop();
					resolve(result);
					return;
				}
			});

			msgCollector.on('end', async collected => {
				stopCollector.stop();
				if (expired && defaultedOptions.onExpire) {
					await defaultedOptions.onExpire();
				}
			});

			stopCollector.on('collect', async (nextMsg: Message) => {
				expired = false;
				msgCollector.stop();
				resolve(undefined);
			});
		});
	}
}

export interface CollectOptions {
	/**
	 * Time in milliseconds before the collector expires.
	 * @defaultValue `120000` (2 minutes)
	 */
	time?: number;
	/**
	 * Whether the collector time should be reset on a invalid response.
	 * @defaultValue `true`
	 */
	reset?: boolean;
	/**
	 * Target user to collect from.
	 */
	target?: User;
	/**
	 * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
	 */
	stopFilter?: StopFilter;
	/**
	 * Method which is run if the timer expires.
	 */
	onExpire?: ExpireFunction;
}
export type StopFilter = (message: Message) => boolean;
export type ExpireFunction = () => void | Promise<void>;

export type ButtonRetriever<T> = (buttonInteraction: ButtonInteraction) => Promise<
	| {
			intr: ButtonInteraction;
			value: T;
	  }
	| undefined
>;
export type SelectMenuRetriever<T> = (selectMenuInteraction: SelectMenuInteraction) => Promise<
	| {
			intr: SelectMenuInteraction;
			value: T;
	  }
	| undefined
>;
export type ModalRetriever<T> = (modalSubmitInteraction: ModalSubmitInteraction) => Promise<
	| {
			intr: ModalSubmitInteraction;
			value: T;
	  }
	| undefined
>;
export type ReactionRetriever<T> = (
	messageReaction: MessageReaction,
	reactor: User
) => Promise<T | undefined>;
export type MessageRetriever<T> = (message: Message) => Promise<T | undefined>;
