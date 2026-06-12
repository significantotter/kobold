import { hostname } from 'node:os';
import pino, {
	type DestinationStream,
	type Logger,
	type LevelWithSilent,
} from 'pino';

export interface CreateLoggerOptions {
	service: string;
	environment?: string;
	level?: LevelWithSilent;
	pretty?: boolean;
	destination?: DestinationStream;
}

const REDACTED_PATHS = [
	'authorization',
	'cookie',
	'headers.authorization',
	'headers.cookie',
	'request.headers.authorization',
	'request.headers.cookie',
	'req.headers.authorization',
	'req.headers.cookie',
	'clientSecret',
	'accessToken',
	'refreshToken',
	'sessionToken',
	'password',
];

export function createLogger({
	service,
	environment = process.env.NODE_ENV ?? 'development',
	level = (process.env.LOG_LEVEL as LevelWithSilent | undefined) ?? 'info',
	pretty = environment !== 'production',
	destination,
}: CreateLoggerOptions): Logger {
	const options: pino.LoggerOptions = {
		level,
		base: {
			pid: process.pid,
			hostname: hostname(),
			service,
			environment,
		},
		formatters: {
			level: label => ({ level: label }),
		},
		timestamp: pino.stdTimeFunctions.isoTime,
		serializers: {
			err: pino.stdSerializers.err,
			error: pino.stdSerializers.err,
		},
		redact: {
			paths: REDACTED_PATHS,
			censor: '[Redacted]',
		},
	};

	if (!pretty) {
		return pino(options, destination);
	}

	return pino(
		options,
		pino.transport({
			target: 'pino-pretty',
			options: {
				colorize: true,
				singleLine: true,
				translateTime: 'SYS:HH:MM:ss.l',
				ignore: 'pid,hostname,service,environment',
				messageFormat: '[{service}] {msg}',
			},
		})
	);
}

export type { Logger };
