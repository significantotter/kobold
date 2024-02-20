interface config {
    developers: string[];
    adminGuilds: string[];
    client: {
        id: string;
        token: string;
        intents: string[];
        partials: string[];
        caches: {
            [k: string]: number;
        };
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
export declare const Config: config;
export {};
//# sourceMappingURL=config.d.ts.map