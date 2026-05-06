import { useRoute } from 'vue-router';
import { api } from '@/api/api-client';

export function useAuthReturn() {
	const route = useRoute();

	async function loginAndReturn() {
		const { url } = await api.auth.getAuthUrl({ returnTo: route.fullPath });
		window.location.href = url;
	}

	return { loginAndReturn };
}
