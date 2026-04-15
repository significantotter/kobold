import type { RouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { AppRouter } from '../../server/router.js';

const link = new RPCLink({
	url: () => new URL('/api', window.location.origin).href,
	fetch: (input, init) => globalThis.fetch(input, { ...init, credentials: 'include' }),
});

export const api: RouterClient<AppRouter> = createORPCClient(link);
