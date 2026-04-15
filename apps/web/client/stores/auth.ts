import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/api/api-client';

export interface AuthUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

export const useAuthStore = defineStore('auth', () => {
	const user = ref<AuthUser | null>(null);
	const loaded = ref(false);

	const isLoggedIn = computed(() => !!user.value);

	async function fetchUser() {
		try {
			user.value = await api.auth.getUser();
		} catch {
			user.value = null;
		} finally {
			loaded.value = true;
		}
	}

	async function logout() {
		await api.auth.logout();
		user.value = null;
	}

	return { user, loaded, isLoggedIn, fetchUser, logout };
});
