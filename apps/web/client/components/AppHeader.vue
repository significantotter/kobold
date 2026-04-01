<template>
	<div class="app-header-wrapper">
		<Menubar :pt="{ root: 'justify-center flex-1' }" class="app-header" :model="items">
			<template #item="{ item, props, hasSubmenu }">
				<RouterLink v-if="item.route" :to="item.route" custom v-slot="{ href, navigate }">
					<a v-ripple :href="href" v-bind="props.action" @click="navigate">
						<span :class="item.icon" />
						<span class="ml-2">{{ item.label }}</span>
					</a>
				</RouterLink>
				<a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
					<span :class="item.icon" />
					<span class="ml-2">{{ item.label }}</span>
					<span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
				</a>
			</template>
		</Menubar>
		<UserProfile class="user-profile" />
	</div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';
import UserProfile from './UserProfile.vue';

const items = [
	{
		label: 'Home',
		icon: 'pi pi-fw pi-home',
		route: '/',
	},
	{
		label: 'About',
		icon: 'pi pi-fw pi-info',
		route: '/about',
	},
	{
		label: 'Commands',
		icon: 'pi pi-fw pi-book',
		route: '/commands',
	},
];
</script>

<style lang="scss" scoped>
.app-header-wrapper {
	display: flex;
	align-items: center;
	position: relative;
	width: 100%;
}

.app-header {
	flex: 1;

	:deep(.p-menubar-root-list) {
		justify-content: center;
		width: 100%;
	}
}

.user-profile {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
}
</style>
