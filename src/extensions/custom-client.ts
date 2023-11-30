import { ActivityType, Awaitable, Client, ClientOptions, Presence } from 'discord.js';

export class CustomClient extends Client {
	constructor(clientOptions: ClientOptions) {
		super(clientOptions);
	}

	public setPresence(
		type: Exclude<ActivityType, ActivityType.Custom>,
		name?: string,
		url?: string
	): Awaitable<Presence | undefined> {
		return this.user?.setPresence({
			activities: [
				{
					type,
					name: name ?? '',
					url,
				},
			],
		});
	}
}
