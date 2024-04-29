import djs, {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	Locale,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { filesize } from 'filesize';
import os from 'node:os';
import typescript from 'typescript';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { ShardUtils } from '../../../utils/shard-utils.js';
import { Command, CommandDeferType, InjectedServices } from '../../command.js';
import { Config } from '@kobold/config';

export class AdminCommand implements Command {
	public names = [L.en.commands.admin.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.admin.name(),
		description: L.en.commands.admin.description(),
		dm_permission: false,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.HIDDEN;
	public requireClientPerms: PermissionsString[] = [];
	public restrictedGuilds = Config.adminGuilds || ([] as string[]);

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		services: InjectedServices
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		if (
			!Config.developers.includes(intr.user.id) ||
			!this.restrictedGuilds.includes(intr.guildId ?? '')
		) {
			await InteractionUtils.send(intr, 'Yip! This is a kobold admin command. Sorry!');
			return;
		}
		let shardCount = intr.client.shard?.count ?? 1;
		let serverCount: number;
		if (intr.client.shard) {
			try {
				serverCount = await ShardUtils.serverCount(intr.client.shard);
			} catch (error) {
				if (error instanceof Error && error.name.includes('ShardingInProcess')) {
					const embed = new KoboldEmbed();
					embed.setTitle('Yip! Kobold is still starting up. Try again later.');
					await InteractionUtils.send(intr, embed);
					return;
				} else {
					throw error;
				}
			}
		} else {
			serverCount = intr.client.guilds.cache.size;
		}

		let memory = process.memoryUsage();
		const embed = new KoboldEmbed({
			title: `Kobold - Developer Info`,
			fields: [
				{
					name: `Versions`,
					value: [
						`**Node.js**: ${process.version}`,
						`**TypeScript**: v${typescript.version}`,
						`**ECMAScript**:"ESNext"`,
						`**discord.js**: v${djs.version}`,
					].join('\n'),
				},
				{
					name: `Stats`,
					value: [
						`**Shards**: ${shardCount.toLocaleString(Locale.EnglishUS)}`,
						`**Servers**: ${serverCount.toLocaleString(Locale.EnglishUS)} (${Math.round(
							serverCount / shardCount
						).toLocaleString(Locale.EnglishUS)}/Shard)`,
						`**Guild Count**: ${intr.client.guilds.cache.size} `,
					].join('\n'),
				},
				{
					name: `Memory`,
					value: [
						`**RSS**: ${filesize(memory.rss)} (${
							serverCount > 0 ? filesize(memory.rss / serverCount) : 'N/A'
						}/Server)`,
						`**Heap**: ${filesize(memory.heapTotal)} (${
							serverCount > 0 ? filesize(memory.heapTotal / serverCount) : 'N/A'
						}/Server)`,
						`**Used**: ${filesize(memory.heapUsed)} (${
							serverCount > 0 ? filesize(memory.heapUsed / serverCount) : 'N/A'
						}/Server)`,
					].join('\n'),
				},
				{
					name: `IDs`,
					value: [
						`**Hostname**: ${os.hostname()}`,
						`**Shard ID**: ${(intr.guild?.shardId ?? 0).toString()}`,
						`**Server ID**: ${intr.guild?.id ?? 'N/A'}`,
						`**Bot ID**: ${intr.client.user?.id}`,
						`**User ID**: ${intr.user.id}`,
					].join('\n'),
				},
			],
		});
		await InteractionUtils.send(intr, embed);
		return;
	}
}
