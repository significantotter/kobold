import djs, {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
} from 'discord.js';
import os from 'node:os';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../i18n/i18n-types.js';
import { Language } from '../../models/enum-helpers/language.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import { Command, CommandDeferType } from '../command.js';
import Config from './../../config/config.json';
import fs from 'fs';
import typescript from 'typescript';
import fileSize from 'filesize';
import { ShardUtils } from '../../utils/shard-utils.js';
import { Lang } from '../../services/lang.js';

const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.json').toString());

export class AdminCommand implements Command {
	public names = [Language.LL.commands.admin.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.admin.name(),
		description: Language.LL.commands.admin.description(),
		dm_permission: false,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.HIDDEN;
	public requireClientPerms: PermissionsString[] = [];
	public restrictedGuilds = Config.adminGuilds || ([] as string[]);

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		if (!Config.developers.includes(intr.user.id)) {
			await InteractionUtils.send(intr, 'Yip! This is a kobold admin command. Sorry!');
			return;
		}
		let shardCount = intr.client.shard?.count ?? 1;
		let serverCount: number;
		if (intr.client.shard) {
			try {
				serverCount = await ShardUtils.serverCount(intr.client.shard);
			} catch (error) {
				if (error.name.includes('ShardingInProcess')) {
					await InteractionUtils.send(
						intr,
						Lang.getEmbed('errorEmbeds.startupInProcess', data.lang())
					);
					return;
				} else {
					throw error;
				}
			}
		} else {
			serverCount = intr.client.guilds.cache.size;
		}

		let memory = process.memoryUsage();
		const embed = Lang.getEmbed('displayEmbeds.dev', data.lang(), {
			NODE_VERSION: process.version,
			TS_VERSION: `v${typescript.version}`,
			ES_VERSION: tsConfig.compilerOptions.target,
			DJS_VERSION: `v${djs.version}`,
			SHARD_COUNT: shardCount.toLocaleString(data.lang()),
			SERVER_COUNT: serverCount.toLocaleString(data.lang()),
			SERVER_COUNT_PER_SHARD: Math.round(serverCount / shardCount).toLocaleString(
				data.lang()
			),
			RSS_SIZE: fileSize(memory.rss),
			RSS_SIZE_PER_SERVER:
				serverCount > 0
					? fileSize(memory.rss / serverCount)
					: Lang.getRef('other.na', data.lang()),
			HEAP_TOTAL_SIZE: fileSize(memory.heapTotal),
			HEAP_TOTAL_SIZE_PER_SERVER:
				serverCount > 0
					? fileSize(memory.heapTotal / serverCount)
					: Lang.getRef('other.na', data.lang()),
			HEAP_USED_SIZE: fileSize(memory.heapUsed),
			HEAP_USED_SIZE_PER_SERVER:
				serverCount > 0
					? fileSize(memory.heapUsed / serverCount)
					: Lang.getRef('other.na', data.lang()),
			HOSTNAME: os.hostname(),
			SHARD_ID: (intr.guild?.shardId ?? 0).toString(),
			SERVER_ID: intr.guild?.id ?? Lang.getRef('other.na', data.lang()),
			BOT_ID: intr.client.user?.id,
			USER_ID: intr.user.id,
			ALL_GUILDS: intr.client.guilds.cache.map(guild => guild.name).join('\n'),
		});
		await InteractionUtils.send(intr, embed);
	}
}
