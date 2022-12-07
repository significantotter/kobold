import { Command } from './../commands/command';
import { REST } from '@discordjs/rest';
import {
	APIApplicationCommand,
	RESTGetAPIApplicationCommandsResult,
	RESTPatchAPIApplicationCommandJSONBody,
	RESTPostAPIApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';

import { Logger } from './logger.js';
import Config from './../config/config.json';
import Logs from './../config/lang/logs.json';

export class CommandRegistrationService {
	constructor(private rest: REST) {}

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
					!command.restrictedGuilds.includes(existingCommand.guild_id)
			)
		);

		switch (args[3]) {
			case 'view': {
				Logger.info(
					Logs.info.commandActionView
						.replaceAll(
							'{LOCAL_AND_REMOTE_LIST}',
							this.formatCommandList(localCmdsOnRemoteMetadata)
						)
						.replaceAll(
							'{LOCAL_ONLY_LIST}',
							this.formatCommandList(localCmdsOnlyMetadata)
						)
						.replaceAll('{REMOTE_ONLY_LIST}', this.formatCommandList(remoteCmdsOnly))
				);
				return;
			}
			case 'register': {
				if (localCmdsOnly.length > 0) {
					Logger.info(
						Logs.info.commandActionCreating.replaceAll(
							'{COMMAND_LIST}',
							this.formatCommandList(localCmdsOnlyMetadata)
						)
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
						} else {
							await this.rest.post(Routes.applicationCommands(Config.client.id), {
								body: localCmd.metadata,
							});
						}
					}
					//check existing guilds to see if any that are guild-specific changed the target guilds
					for (let remoteCmd of remoteCmds) {
						if (
							remoteCmd.guild_id &&
							!localCmdsOnRemote.find(
								localCmd =>
									localCmd.restrictedGuilds.includes(remoteCmd.guild_id) &&
									localCmd.metadata.name === remoteCmd.name
							)
						) {
							await this.rest.delete(
								Routes.applicationGuildCommand(
									Config.client.id,
									remoteCmd.guild_id,
									remoteCmd.id
								)
							);
						}
					}
					Logger.info(Logs.info.commandActionCreated);
				}

				if (localCmdsOnRemoteMetadata.length > 0) {
					Logger.info(
						Logs.info.commandActionUpdating.replaceAll(
							'{COMMAND_LIST}',
							this.formatCommandList(localCmdsOnRemoteMetadata)
						)
					);
					for (let localCmd of localCmdsOnRemoteMetadata) {
						await this.rest.post(Routes.applicationCommands(Config.client.id), {
							body: localCmd,
						});
					}
					Logger.info(Logs.info.commandActionUpdated);
				}

				return;
			}
			case 'rename': {
				let oldName = args[4];
				let newName = args[5];
				if (!(oldName && newName)) {
					Logger.error(Logs.error.commandActionRenameMissingArg);
					return;
				}

				let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == oldName);
				if (!remoteCmd) {
					Logger.error(
						Logs.error.commandActionNotFound.replaceAll('{COMMAND_NAME}', oldName)
					);
					return;
				}

				Logger.info(
					Logs.info.commandActionRenaming
						.replaceAll('{OLD_COMMAND_NAME}', remoteCmd.name)
						.replaceAll('{NEW_COMMAND_NAME}', newName)
				);
				let body: RESTPatchAPIApplicationCommandJSONBody = {
					name: newName,
				};
				await this.rest.patch(Routes.applicationCommand(Config.client.id, remoteCmd.id), {
					body,
				});
				Logger.info(Logs.info.commandActionRenamed);
				return;
			}
			case 'delete': {
				let name = args[4];
				if (!name) {
					Logger.error(Logs.error.commandActionDeleteMissingArg);
					return;
				}

				let remoteCmd = remoteCmds.find(remoteCmd => remoteCmd.name == name);
				if (!remoteCmd) {
					Logger.error(
						Logs.error.commandActionNotFound.replaceAll('{COMMAND_NAME}', name)
					);
					return;
				}

				Logger.info(
					Logs.info.commandActionDeleting.replaceAll('{COMMAND_NAME}', remoteCmd.name)
				);
				await this.rest.delete(Routes.applicationCommand(Config.client.id, remoteCmd.id));
				Logger.info(Logs.info.commandActionDeleted);
				return;
			}
			case 'clear': {
				Logger.info(
					Logs.info.commandActionClearing.replaceAll(
						'{COMMAND_LIST}',
						this.formatCommandList(remoteCmds)
					)
				);
				await this.rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
				Logger.info(Logs.info.commandActionCleared);
				return;
			}
		}
	}

	private formatCommandList(
		cmds: RESTPostAPIApplicationCommandsJSONBody[] | APIApplicationCommand[]
	): string {
		return cmds.length > 0
			? cmds.map((cmd: { name: string }) => `'${cmd.name}'`).join(', ')
			: 'N/A';
	}
}
