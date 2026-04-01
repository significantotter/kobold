<template>
	<div v-show="isMounted" id="app-grid">
		<div id="app-header">
			<AppHeader />
		</div>
		<div id="app-body">
			<RouterView />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';

const isMounted = ref(false);

onMounted(() => {
	isMounted.value = true;
});
</script>

<style>
.child-margin-auto > * {
	text-align: center;
}

#app-grid {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		'header'
		'main'
		'footer';
	height: 100vh;
}

#app-header {
	grid-area: header;
}

#app-body {
	grid-area: main;
	overflow: auto;
	min-height: 0;
}
</style>
