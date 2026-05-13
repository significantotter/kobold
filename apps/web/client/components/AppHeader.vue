<template>
	<div class="app-header-wrapper">
		<Menubar
			:pt="{ root: 'justify-center flex-1' }"
			breakpoint="1100px"
			class="app-header"
			:model="items"
		>
			<template #item="{ item, props, hasSubmenu }">
				<div v-if="item.auth" class="mobile-auth-action">
					<UserProfile class="menu-user-profile" />
				</div>
				<RouterLink
					v-else-if="item.route"
					:to="item.route"
					custom
					v-slot="{ href, navigate, isExactActive }"
				>
					<a
						v-ripple
						:aria-current="
							isExactActive || isRouteSectionActive(item) ? 'page' : undefined
						"
						:class="{
							'header-nav-link-active': isExactActive || isRouteSectionActive(item),
						}"
						:href="href"
						v-bind="props.action"
						@click="navigate"
					>
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
	</div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';
import { useRoute } from 'vue-router';
import UserProfile from './UserProfile.vue';
import { MenuItem } from 'primevue/menuitem';

type HeaderMenuItem = {
	label?: string;
	icon?: string;
	route?: string;
	url?: string;
	target?: string;
	auth?: boolean;
	class?: string;
};

const route = useRoute();

const items: HeaderMenuItem[] = [
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
	// {
	// 	label: 'My Characters',
	// 	icon: 'pi pi-fw pi-users',
	// 	route: '/characters',
	// },
	// {
	// 	label: 'Library',
	// 	icon: 'pi pi-fw pi-warehouse',
	// 	route: '/library',
	// },
	{
		label: 'Import',
		icon: 'pi pi-fw pi-upload',
		route: '/import',
	},
	{
		auth: true,
		class: 'auth-menu-item',
	},
];

function isRouteSectionActive(item: MenuItem) {
	if (!item.route) return false;
	if (item.route === '/') return false;
	return route.path === item.route || route.path.startsWith(`${item.route}/`);
}
</script>

<style lang="scss" scoped>
.app-header-wrapper {
	width: 100%;
}

.app-header {
	flex: 1;

	:deep(.p-menubar-root-list) {
		justify-content: center;
		width: 100%;
	}
}

.mobile-auth-action {
	display: flex;
}

.menu-user-profile {
	display: flex;
	padding: 0;
}

:deep(.auth-menu-item) {
	margin-left: auto;
}

:deep(.auth-menu-item > .p-menubar-item-content) {
	padding: 0;
	background: transparent;
}

:deep(.auth-menu-item > .p-menubar-item-content:hover) {
	background: transparent;
}

:deep(.header-nav-link-active) {
	background: rgba(88, 101, 242, 0.16);
	color: #fff;
	box-shadow:
		inset 0 0 0 1px rgba(88, 101, 242, 0.58),
		0 8px 20px rgba(88, 101, 242, 0.12);
}

:deep(.header-nav-link-active .pi) {
	color: #a5b4fc;
}

@media (max-width: 1100px) {
	:deep(.auth-menu-item) {
		margin-left: 0;
	}
}
</style>
