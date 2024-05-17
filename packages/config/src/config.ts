import dotenv from 'dotenv';
import _ from 'lodash';
dotenv.config({ path: './../../.env' });

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
	nethys: {
		baseUrl: string;
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
			runOnce: boolean;
			initialDelaySecs: number;
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
	debug: {
		dummyMode: {
			enabled: boolean;
			whiteList: string[];
		};
		shardMode: {
			enabled: boolean;
			value: string;
		};
	};
	botSites: {
		name: string;
		enabled: boolean;
		url: string;
		authorization: string;
		body: string;
	}[];
}

function parseEnvArray(envVariable: string) {
	if (envVariable == '') return [];
	return (envVariable || '').split(',');
}
function parseEnvObjectArray(envVariable: string, params: { [k: string]: string }) {
	if (envVariable == '') return [];
	try {
		const initialResult = JSON.parse(envVariable) as any[];
		if (!_.isArray(initialResult)) throw new Error('Not an array');
		const parsedResult: { [k: string]: any } = [];
		for (const envObject of initialResult) {
			const currentParsedObject: { [k: string]: any } = {};
			for (const [key, value] of Object.entries(params)) {
				if (!envObject[key])
					throw new Error(`Missing key ${key} on object ${JSON.stringify(envObject)}`);
				else if (typeof envObject[key] !== value) {
					throw new Error(
						`Key ${key} on object ${JSON.stringify(envObject)} is not of type ${value}`
					);
				} else {
					currentParsedObject[key] = envObject[key];
				}
			}
			parsedResult.push(currentParsedObject);
		}
		return parsedResult;
	} catch (err) {
		console.warn('Error parsing bot sites env from: ' + envVariable);
		console.warn(err);
	}
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
	return envVariable.toLocaleLowerCase().trim() === 'false' ? false : true;
}

export const Config: config = Object.freeze({
	developers: parseEnvArray(env.DEVELOPER_IDS ?? '') ?? [],
	adminGuilds: parseEnvArray(env.ADMIN_GUILD_IDS ?? '') ?? [],
	client: {
		id: env.CLIENT_ID ?? '',
		token: env.CLIENT_TOKEN ?? '',
		intents: parseEnvArray(env.CLIENT_INTENTS ?? '') ?? [
			'Guilds',
			'GuildMessages',
			'GuildEmojisAndStickers',
			'GuildMessageReactions',
			'DirectMessages',
			'DirectMessageReactions',
		],
		partials: parseEnvArray(env.CLIENT_PARTIALS ?? '') ?? ['Message', 'Channel', 'Reaction'],
		caches: parseEnvObject(env.CLIENT_CACHES ?? '') ?? {
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
	nethys: {
		baseUrl: env.NETHYS_BASE_URL ?? 'https://2e.aonprd.com/',
	},
	database: {
		url: env.DATABASE_URL ?? '',
		testUrl: env.DATABASE_TEST_URL ?? '',
	},
	api: {
		port: parseEnvNumber(env.API_PORT ?? '') ?? 8080,
		secret: env.API_SECRET ?? '',
	},
	pastebin: {
		apiKey: env.PASTEBIN_API_KEY ?? '',
	},
	sharding: {
		spawnDelay: parseEnvNumber(env.SHARDING_SPAWN_DELAY ?? '') ?? 5,
		spawnTimeout: parseEnvNumber(env.SHARDING_SPAWN_TIMEOUT ?? '') ?? 300,
		serversPerShard: parseEnvNumber(env.SHARDING_SERVERS_PER_SHARD ?? '') ?? 1000,
	},
	clustering: {
		enabled: parseEnvBoolean(env.CLUSTERING_ENABLED ?? '') ?? false,
		shardCount: parseEnvNumber(env.CLUSTERING_SHARD_COUNT ?? '') ?? 16,
		callbackUrl: env.CLUSTERING_CALLBACK_URL ?? 'http://localhost:8080/',
		masterApi: {
			url: env.CLUSTERING_MASTER_API_URL ?? 'http://localhost:5000/',
			token: env.CLUSTERING_MASTER_API_TOKEN ?? '',
		},
	},
	jobs: {
		updateServerCount: {
			schedule: env.JOBS_UPDATE_SERVER_COUNT_SCHEDULE ?? '0 */10 * * * *',
			log: parseEnvBoolean(env.JOBS_UPDATE_SERVER_COUNT_LOG ?? '') ?? false,
			runOnce: parseEnvBoolean(env.JOBS_UPDATE_SERVER_COUNT_RUN_ONCE ?? '') ?? false,
			initialDelaySecs:
				parseEnvNumber(env.JOBS_UPDATE_SERVER_COUNT_RUN_INITIAL_DELAY_SECS ?? '') ?? 0,
		},
	},
	rateLimiting: {
		commands: {
			amount: parseEnvNumber(env.RATE_LIMITING_COMMANDS_AMOUNT ?? '') ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_COMMANDS_INTERVAL ?? '') ?? 30,
		},
		buttons: {
			amount: parseEnvNumber(env.RATE_LIMITING_BUTTONS_AMOUNT ?? '') ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_BUTTONS_INTERVAL ?? '') ?? 30,
		},
		triggers: {
			amount: parseEnvNumber(env.RATE_LIMITING_TRIGGERS_AMOUNT ?? '') ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_TRIGGERS_INTERVAL ?? '') ?? 30,
		},
		reactions: {
			amount: parseEnvNumber(env.RATE_LIMITING_REACTIONS_AMOUNT ?? '') ?? 10,
			interval: parseEnvNumber(env.RATE_LIMITING_REACTIONS_INTERVAL ?? '') ?? 30,
		},
	},
	logging: {
		pretty: parseEnvBoolean(env.LOGGING_PRETTY ?? '') ?? true,
		rateLimit: {
			minTimeout: parseEnvNumber(env.LOGGING_RATE_LIMIT_MIN_TIMEOUT ?? '') ?? 30,
		},
	},
	debug: {
		dummyMode: {
			enabled: parseEnvBoolean(env.DEBUG_DUMMY_MODE_ENABLED ?? '') ?? false,
			whiteList: parseEnvArray(env.DEBUG_DUMMY_MODE_WHITELIST ?? '') ?? [],
		},
		shardMode: {
			enabled: parseEnvBoolean(env.DEBUG_SHARD_MODE_ENABLED ?? '') ?? false,
			value: env.DEBUG_SHARD_MODE_VALUE ?? 'worker',
		},
	},
	botSites:
		(parseEnvObjectArray(env.BOT_SITES_0 ?? '', {
			name: 'string',
			enabled: 'boolean',
			url: 'string',
			authorization: 'string',
			body: 'string',
		}) as config['botSites']) ?? [],
});
