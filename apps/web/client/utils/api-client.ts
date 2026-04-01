import type { AppRouter } from '../../server/router';

const API_BASE = import.meta.env.DEV ? '' : '';

interface RPCResponse<T> {
	result?: T;
	error?: string;
}

/**
 * Type-safe oRPC client
 * Provides typed access to all backend procedures
 */
class ApiClient {
	private async call<T>(path: string, input?: unknown): Promise<T> {
		const response = await fetch(`${API_BASE}/api/${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: input ? JSON.stringify(input) : '{}',
		});

		const data: RPCResponse<T> = await response.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data.result as T;
	}

	/**
	 * Auth procedures
	 */
	auth = {
		/**
		 * Get the Discord OAuth authorization URL
		 */
		getAuthUrl: () => this.call<{ url: string; state: string }>('auth/getAuthUrl'),

		/**
		 * Get the current authenticated user
		 */
		getUser: () =>
			this.call<{
				id: string;
				username: string;
				discriminator: string;
				avatar: string | null;
			} | null>('auth/getUser'),

		/**
		 * Log out the current user
		 */
		logout: () => this.call<{ success: boolean }>('auth/logout'),
	};
}

export const api = new ApiClient();
