<template>
	<Menubar :pt="{ root: 'justify-center' }" class="app-header" :model="items">
		<template #item="{ item, props, hasSubmenu }">
			<NuxtLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
				<a v-ripple :href="href" v-bind="props.action" @click="navigate">
					<span :class="item.icon" />
					<span class="ml-2">{{ item.label }}</span>
				</a>
			</NuxtLink>
			<a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
				<span :class="item.icon" />
				<span class="ml-2">{{ item.label }}</span>
				<span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
			</a>
		</template>
	</Menubar>
</template>
<script setup lang="ts">
import Menubar from 'primevue/menubar';

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
	// {
	// 	label: 'FAQ',
	// 	icon: 'pi pi-fw pi-question',
	// 	route: '/faq',
	// },
	// {
	// 	label: 'Contact',
	// 	icon: 'pi pi-fw pi-envelope',
	// 	route: '/contact',
	// },
];
</script>
<style lang="scss" scoped>
.app-header {
	// height: 3.5rem;
	width: 100%;
}
</style>
