import { Command } from './../commands/command.js';
import { REST } from 'discord.js';
import {
	APIApplicationCommand,
	RESTGetAPIApplicationCommandsResult,
	RESTPatchAPIApplicationCommandJSONBody,
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';

import { Logger } from './logger.js';
import { Config } from '@kobold/config';

export class CommandRegistrationService {
	constructor(protected rest: REST) {}

	public async process(commands: Command[], args: string[]): Promise<void> {
		let localCmds = commands.map(command => command.metadata);
		let remoteCmds = (await this.rest.get(
			Routes.applicationCommands(Config.client.id)
		)) as RESTGetAPIApplicationCommandsResult;

		let localCmdsOnRemote = commands.filter(localCmd =>
			remoteCmds.some(remoteCmd => remoteCmd.name === localCmd.metadata.name)
		);
		const localCmdsOnRemoteMetadata = localCmdsOnRemote.map(cmd => cmd.metadata);
		let localCmdsOnly = commands.filter(
			localCmd => !remoteCmds.some(remoteCmd => remoteCmd.name === localCmd.metadata.name)
		);
		const localCmdsOnlyMetadata = localCmdsOnly.map(cmd => cmd.metadata);
		let remoteCmdsOnly = remoteCmds.filter(
			remoteCmd => !commands.some(localCmd => localCmd.metadata.name === remoteCmd.name)
		);

		let guildCommands = remoteCmds.filter(cmd => cmd.guild_id);
		let guildCommandsToRemove = guildCommands.filter(existingCommand =>
			commands.find(
				command =>
					command.metadata.name === existingCommand.name &&
					!(command.restrictedGuilds ?? []).includes(existingCommand.guild_id ?? '')
			)
		);

		switch (args[3]) {
			case 'view': {
				Logger.info(
					`\nLocal and remote:\n    ${this.formatCommandList(localCmdsOnRemoteMetadata)}\n` +
						`Local only:\n    ${this.formatCommandList(localCmdsOnlyMetadata)}\n` +
						`Remote only:\n    ${this.formatCommandList(remoteCmdsOnly)}`
				);
				return;
			}
			case 'register': {
				if (localCmdsOnly.length > 0) {
					Logger.info(
						`Creating commands: ${this.formatCommandList(localCmdsOnlyMetadata)}`
					);
					//insert new guilds
					for (let localCmd of localCmdsOnly) {
						if (localCmd.restrictedGuilds?.length) {
							for (const guildId of localCmd.restrictedGuilds) {
								await this.rest.post(
									Routes.applicationGuildCommands(Config.client.id, guildId),
									{ body: localCmd.metadata }
								);
							}
						} else if (localCmd.restrictedGuilds !== undefined) {
							//if we just define empty restricted guilds, we don't allow it to show up in any guilds
							continue;
						} else {
							await this.rest.post(Routes.applicationCommands(Config.client.id), {
								body: localCmd.metadata,
							});
						}
					}
					Logger.info(`Commands created.`);
				}

				if (localCmdsOnRemoteMetadata.length > 0) {
					Logger.info(
						`Updating commands: ${this.formatCommandList(localCmdsOnRemoteMetadata)}`
					);
					for (let localCmd of localCmdsOnRemoteMetadata) {
						try {
							await this.rest.post(Routes.applicationCommands(Config.client.id), {
								body: localCmd,
							});
						} catch (err) {
							Logger.info('Error when trying to register ', localCmd.name);
							throw err;
						}
					}
					Logger.info(`Commands updated.`);
				}

				return;
			}
			case 'rename': {
				let oldName = args[4];
				let newName = args[5];
				if (!(oldName && newName)) {
					Logger.error(`Please supply the current command name and new command name.`);
					return;
				}

				let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == oldName);
				if (!remoteCmd) {
					Logger.error(`Could not find a command with the name '${oldName}'.`);
					return;
				}

				Logger.info(`Renaming command: '${remoteCmd.name}' --> '${newName}'`);
				let body: RESTPatchAPIApplicationCommandJSONBody = {
					name: newName,
				};
				await this.rest.patch(Routes.applicationCommand(Config.client.id, remoteCmd.id), {
					body,
				});
				Logger.info(`Command renamed.`);
				return;
			}
			case 'delete': {
				let name = args[4];
				if (!name) {
					Logger.error(`Please supply a command name to delete.`);
					return;
				}

				let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == name);
				if (!remoteCmd) {
					Logger.error(`Could not find a command with the name '${name}'.`);
					return;
				}

				Logger.info(`Deleting command: '${remoteCmd.name}'`);
				await this.rest.delete(Routes.applicationCommand(Config.client.id, remoteCmd.id));
				Logger.info(`Command deleted.`);
				return;
			}
			case 'clear': {
				Logger.info(`Deleting all commands: ${this.formatCommandList(remoteCmds)}`);
				await this.rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
				for (const command of commands) {
					for (const guildId of command?.restrictedGuilds || []) {
						await this.rest.put(
							Routes.applicationGuildCommands(Config.client.id, guildId),
							{ body: [] }
						);
					}
				}
				Logger.info(`Commands deleted.`);
				return;
			}
		}
	}

	protected formatCommandList(
		cmds: RESTPostAPIApplicationCommandsJSONBody[] | APIApplicationCommand[]
	): string {
		return cmds.length > 0
			? cmds.map((cmd: { name: string }) => `'${cmd.name}'`).join(', ')
			: 'N/A';
	}
}
