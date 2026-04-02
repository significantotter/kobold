<template>
	<div class="user-profile">
		<template v-if="user">
			<img v-if="avatarUrl" :src="avatarUrl" :alt="user.username" class="avatar" />
			<span class="username">{{ user.username }}</span>
			<button class="logout-btn" @click="logout">Logout</button>
		</template>
		<template v-else>
			<button class="login-btn" @click="login" :disabled="isLoading">
				<i class="pi pi-discord" />
				Login with Discord
			</button>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../api/api-client';

interface User {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
}

const user = ref<User | null>(null);
const isLoading = ref(false);

const avatarUrl = computed(() => {
	if (!user.value?.avatar) return null;
	return `https://cdn.discordapp.com/avatars/${user.value.id}/${user.value.avatar}.png?size=32`;
});

async function fetchUser() {
	try {
		user.value = await api.auth.getUser();
	} catch {
		user.value = null;
	}
}

async function login() {
	isLoading.value = true;
	try {
		const { url } = await api.auth.getAuthUrl();
		window.location.href = url;
	} catch {
		isLoading.value = false;
	}
}

async function logout() {
	try {
		await api.auth.logout();
		user.value = null;
	} catch {
		// ignore
	}
}

onMounted(fetchUser);
</script>

<style lang="scss" scoped>
.user-profile {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
}

.avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
}

.username {
	font-size: 0.875rem;
	color: var(--p-text-color);
}

.login-btn,
.logout-btn {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	cursor: pointer;
	border: 1px solid var(--p-surface-border);
	color: var(--p-text-color);
	background: var(--p-surface-ground);
	transition: background 0.15s;

	&:hover {
		background: var(--p-surface-hover);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.login-btn {
	background: #5865f2;
	border-color: #5865f2;
	color: #fff;

	&:hover {
		background: #4752c4;
	}
}
</style>
