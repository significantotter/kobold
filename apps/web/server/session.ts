import crypto from 'node:crypto';
import { Config } from '@kobold/config';

interface SessionUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

interface SessionPayload {
	userId: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	exp: number;
}

function getSecret(): string {
	const secret = Config.api.secret;
	if (!secret) {
		throw new Error('API_SECRET is not configured. Session signing requires a secret.');
	}
	return secret;
}

function sign(payload: string): string {
	return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

/**
 * Creates an HMAC-signed session token.
 * Format: base64url(payload).signature
 */
export function createSessionToken(user: SessionUser): string {
	const payload: SessionPayload = {
		userId: user.id,
		username: user.username,
		discriminator: user.discriminator,
		avatar: user.avatar,
		exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
	};
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	const signature = sign(encoded);
	return `${encoded}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-signed session token.
 * Returns null if the token is invalid, expired, or tampered with.
 */
export function verifySessionToken(token: string): SessionPayload | null {
	const dotIndex = token.indexOf('.');
	if (dotIndex === -1) return null;

	const encoded = token.slice(0, dotIndex);
	const signature = token.slice(dotIndex + 1);

	const expected = sign(encoded);
	if (!crypto.timingSafeCompare(Buffer.from(signature), Buffer.from(expected))) {
		return null;
	}

	try {
		const payload: SessionPayload = JSON.parse(
			Buffer.from(encoded, 'base64url').toString('utf-8')
		);
		if (!payload.exp || payload.exp <= Date.now() || !payload.userId) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}
