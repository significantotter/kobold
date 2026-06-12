import { AsyncLocalStorage } from 'node:async_hooks';
import { createLogger } from '@kobold/logger';

const STATIC_ASSET_EXTENSION =
	/\.(?:avif|css|eot|gif|ico|jpe?g|js|map|mjs|png|svg|ttf|webmanifest|webp|woff2?)$/i;

const environment = process.env.NODE_ENV ?? 'development';
const isProduction = environment === 'production';
const pinoLogger = createLogger({
	service: 'web',
	environment,
	pretty: !isProduction,
});

export type LogData = Record<string, unknown>;
const logContext = new AsyncLocalStorage<LogData>();

export function runWithLogContext<T>(
	data: LogData,
	callback: () => T
): T {
	return logContext.run(data, callback);
}

function getLogData(data?: LogData): LogData {
	return {
		...logContext.getStore(),
		...data,
	};
}

function getLogMessage(message: string): string {
	const actor = logContext.getStore()?.actor;
	return typeof actor === 'string' ? `[${actor}] ${message}` : message;
}

export function shouldSkipRequestIdentity(pathname: string): boolean {
	return (
		pathname === '/health' ||
		pathname === '/assets' ||
		pathname.startsWith('/assets/') ||
		STATIC_ASSET_EXTENSION.test(pathname)
	);
}

export function shouldSkipRequestLog(pathname: string): boolean {
	return (
		pathname === '/telemetry/page-view' ||
		shouldSkipRequestIdentity(pathname)
	);
}

export const logger = {
	info(message: string, data?: LogData): void {
		if (isProduction) {
			pinoLogger.info(getLogData(data), message);
			return;
		}
		pinoLogger.info(getLogMessage(message));
	},

	warn(message: string, data?: LogData): void {
		if (isProduction) {
			pinoLogger.warn(getLogData(data), message);
			return;
		}
		pinoLogger.warn(getLogMessage(message));
	},

	error(message: string, error?: unknown, data?: LogData): void {
		const errorData = error === undefined ? {} : { err: error };
		if (isProduction) {
			pinoLogger.error(getLogData({ ...data, ...errorData }), message);
			return;
		}
		pinoLogger.error(errorData, getLogMessage(message));
	},
};

export function createRequestLogMetadata({
	request,
	status,
	durationMs,
}: {
	request: Request;
	status: number | null;
	durationMs: number;
}): LogData {
	const rawContentLength = request.headers.get('content-length');
	const parsedContentLength =
		rawContentLength === null ? null : Number(rawContentLength);
	const contentLength =
		parsedContentLength !== null && Number.isFinite(parsedContentLength)
			? parsedContentLength
			: null;

	return {
		requestId:
			request.headers.get('x-request-id') ??
			request.headers.get('cf-ray') ??
			request.headers.get('x-amzn-trace-id'),
		method: request.method,
		path: new URL(request.url).pathname,
		status,
		durationMs,
		contentType: request.headers.get('content-type'),
		contentLength,
		userAgent: request.headers.get('user-agent'),
	};
}

export function formatRequestLogMessage(metadata: LogData): string {
	return `${metadata.method} ${metadata.path} ${metadata.status ?? '-'} ${metadata.durationMs}ms`;
}

export function formatPageViewLogMessage(metadata: LogData): string {
	if (metadata.navigationType === 'navigation') {
		return `SPA navigation ${metadata.fromPath ?? '-'} -> ${metadata.path}`;
	}
	return `page landing ${metadata.path}`;
}
