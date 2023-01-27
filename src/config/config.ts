import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

interface config {
	developers: string[];
	adminGuilds: string[];
	client: {
		id: string;
		token: string;
		intents: string[];
		partials: string[];
		caches: { [k: string]: number };
		inviteUrl: string;
	};
	wanderersGuide: {
		apiKey: string;
		oauthBaseUrl: string;
	};
	database: {
		url: string;
		testUrl: string;
	};
	api: {
		port: number;
		secret: string;
	};
	pastebin: {
		apiKey: string;
	};
	sharding: {
		spawnDelay: number;
		spawnTimeout: number;
		serversPerShard: number;
	};
	clustering: {
		enabled: boolean;
		shardCount: number;
		callbackUrl: string;
		masterApi: {
			url: string;
			token: string;
		};
	};
	jobs: {
		updateServerCount: {
			schedule: string;
			log: boolean;
		};
	};
	rateLimiting: {
		commands: {
			amount: number;
			interval: number;
		};
		buttons: {
			amount: number;
			interval: number;
		};
		triggers: {
			amount: number;
			interval: number;
		};
		reactions: {
			amount: number;
			interval: number;
		};
	};
	logging: {
		pretty: boolean;
		rateLimit: {
			minTimeout: number;
		};
	};
}

function parseEnvArray(envVariable: string) {
	return (envVariable || '').split(',');
}

function parseEnvObject(envVariable: string) {
	if (!envVariable) return undefined;
	return JSON.parse(envVariable);
}

function parseEnvNumber(envVariable: string) {
	if (!envVariable || isNaN(Number(envVariable))) return undefined;
	return Number(envVariable);
}

function parseEnvBoolean(envVariable: string) {
	if (!envVariable) return undefined;
	return Boolean(envVariable);
}

export const Config: config = Object.freeze({
	developers: parseEnvArray(env.DEVELOPER_IDS) ?? [],
	adminGuilds: parseEnvArray(env.ADMIN_GUILD_IDS) ?? [],
	client: {
		id: env.CLIENT_ID ?? '',
		token: env.CLIENT_TOKEN ?? '',
		intents: parseEnvArray(env.CLIENT_INTENTS) ?? [
			'Guilds',
			'GuildMessages',
			'GuildMessageReactions',
			'DirectMessages',
			'DirectMessageReactions',
		],
		partials: parseEnvArray(env.CLIENT_PARTIALS) ?? ['Message', 'Channel', 'Reaction'],
		caches: parseEnvObject(env.CLIENT_CACHES) ?? {
			BaseGuildEmojiManager: 0,
			GuildBanManager: 0,
			GuildInviteManager: 0,
			GuildStickerManager: 0,
			MessageManager: 0,
			PresenceManager: 0,
			StageInstanceManager: 0,
			ThreadManager: 0,
			ThreadMemberManager: 0,
			VoiceStateManager: 0,
		},
		inviteUrl: env.CLIENT_INVITE_URL ?? '',
	},
	wanderersGuide: {
		apiKey: env.WANDERERS_GUIDE_API_KEY ?? '',
		oauthBaseUrl: env.WANDERERS_GUIDE_OAUTH_BASE_URL ?? '',
	},
	database: {
		url: env.DATABASE_URL ?? '',
		testUrl: env.DATABASE_TEST_URL ?? '',
	},
	api: {
		port: parseEnvNumber(env.API_PORT) ?? 8080,
		secret: env.API_SECRET ?? '',
	},
	pastebin: {
		apiKey: env.PASTEBIN_API_KEY ?? '',
	},
	sharding: {
		spawnDelay: parseEnvNumber(env.SHARDING_SPAWN_DELAY) ?? 5,
		spawnTimeout: parseEnvNumber(env.SHARDING_SPAWN_TIMEOUT) ?? 300,
		serversPerShard: parseEnvNumber(env.SHARDING_SERVERS_PER_SHARD) ?? 1000,
	},
	clustering: {
		enabled: parseEnvBoolean(env.CLUSTERING_ENABLED) ?? false,
		shardCount: parseEnvNumber(env.CLUSTERING_SHARD_COUNT) ?? 16,
		callbackUrl: env.CLUSTERING_CALLBACK_URL ?? 'http://localhost:8080/',
		masterApi: {
			url: env.CLUSTERING_MASTER_API_URL ?? 'http://localhost:5000/',
			token: env.CLUSTERING_MASTER_API_TOKEN ?? '',
		},
	},
	jobs: {
		updateServerCount: {
			schedule: env.JOBS_UPDATE_SERVER_COUNT_SCHEDULE ?? '0 */10 * * * *',
			log: parseEnvBoolean(env.JOBS_UPDATE_SERVER_COUNT_LOG) ?? false,
		},
	},
	rateLimiting: {
		commands: {
			amount: parseEnvNumber(env.RATE_LIMITING_COMMANDS_AMOUNT) ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_COMMANDS_INTERVAL) ?? 30,
		},
		buttons: {
			amount: parseEnvNumber(env.RATE_LIMITING_BUTTONS_AMOUNT) ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_BUTTONS_INTERVAL) ?? 30,
		},
		triggers: {
			amount: parseEnvNumber(env.RATE_LIMITING_TRIGGERS_AMOUNT) ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_TRIGGERS_INTERVAL) ?? 30,
		},
		reactions: {
			amount: parseEnvNumber(env.RATE_LIMITING_REACTIONS_AMOUNT) ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_REACTIONS_INTERVAL) ?? 30,
		},
	},
	logging: {
		pretty: parseEnvBoolean(env.LOGGING_PRETTY) ?? true,
		rateLimit: {
			minTimeout: parseEnvNumber(env.LOGGING_RATE_LIMIT_MIN_TIMEOUT) ?? 30,
		},
	},
});
