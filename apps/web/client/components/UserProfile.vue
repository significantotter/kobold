<template>
	<div class="user-profile">
		<template v-if="user">
			<img v-if="avatarUrl" :src="avatarUrl" :alt="user.username" class="avatar" />
			<span class="username">{{ user.username }}</span>
			<button class="logout-btn" @click="logout">Logout</button>
		</template>
		<template v-else>
			<DiscordSignInButton size="header" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import DiscordSignInButton from '@/components/DiscordSignInButton.vue';

const auth = useAuthStore();

const user = computed(() => auth.user);

const avatarUrl = computed(() => {
	if (!user.value?.avatar) return null;
	return `https://cdn.discordapp.com/avatars/${user.value.id}/${user.value.avatar}.png?size=32`;
});

async function logout() {
	await auth.logout();
}

onMounted(() => {
	if (!auth.loaded) auth.fetchUser();
});
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
</style>
