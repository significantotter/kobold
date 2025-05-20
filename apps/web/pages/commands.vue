<template>
	<ClientOnly>
		<div id="commands-grid" class="grid command-grid h-full overflow-hidden">
			<Button
				class="sidebar-toggle"
				:icon="isSidebarVisible ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"
				@click="isSidebarVisible = !isSidebarVisible"
			/>
			<div
				id="commands-toc"
				class="container col-start-1 col-end-3 overflow-y-auto"
				:class="{ ['small-screen-hidden']: !isSidebarVisible }"
			>
				<Menu :model="menuItems">
					<template #start
						><h2 class="text-xl font-bold text-center mt-4">
							Table of Contents
						</h2></template
					>
					<template #item="{ item, props }">
						<a
							:id="`toc-item_${item.id}`"
							:key="`toc-item_${item.id}`"
							v-bind="props.action"
							:class="{
								'ml-4': item.id.split('_').length > 1,
								prose: true,
								'dark:prose-invert': true,
								selected:
									item.id === commandActiveId ||
									item.id === commandActiveId.split('_')[0],
							}"
							@click="
								setTocValueActive({
									commandName: item.commandName,
									subCommandName: item.subCommandName,
								})
							"
						>
							{{ item.label }}
						</a>
					</template>
				</Menu>
			</div>
			<!-- start this with a grid column worth of buffer space -->
			<div
				id="commands-content"
				ref="commandRenderer"
				class="container prose dark:prose-invert overflow-y-auto"
			>
				<NuxtImg
					class="m-auto mt-2 mb-2"
					src="peridot.png"
					alt="kobold portrait"
					width="200"
					height="200"
				/>
				<CommandRenderer :commands="commands" />
			</div>
		</div>
	</ClientOnly>
</template>
<script setup lang="ts">
import { commands } from '@kobold/documentation';
import CommandRenderer from '~/components/command-renderer/CommandRenderer.vue';
import { useActiveScroll } from 'vue-use-active-scroll';

const isSidebarVisible = ref(false);

const subCommandsToc = commands
	.flatMap(command =>
		Object.values(command.definition.subCommands).map(subCommand => ({
			commandName: command.definition.metadata.name,
			subCommandName: subCommand.name,
			id: `${command.definition.metadata.name}_${subCommand.name}`,
			label: subCommand.name,
		}))
	)
	.flat();
const tableOfContents = commands
	.map(command => ({
		commandName: command.definition.metadata.name,
		subCommandName: '',
		id: command.definition.metadata.name,
		label: command.definition.metadata.name,
	}))
	.concat(subCommandsToc)
	.sort(
		(a, b) =>
			a.commandName.localeCompare(b.commandName) ||
			a.subCommandName.localeCompare(b.subCommandName)
	);

const menuItems = computed(() => {
	return tableOfContents.map(item => ({
		label: item.label,
		url: `#${item.id}`,
		commandName: item.commandName,
		subCommandName: item.subCommandName,
		id: item.id,
		key: `toc-item_${item.id}`,
		class: {
			'ml-4': item.id!.includes(' '),
			selected: item.id === commandActiveId.value,
			'toc-link': true,
			[`toc-item_${item.id}`]: true,
		},
	}));
});
const setTocValueActive = (item: { commandName: string; subCommandName: string }) => {
	const targetId = item.subCommandName
		? `${item.commandName}_${item.subCommandName}`
		: item.commandName;
	document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
	isSidebarVisible.value = false;
};

const commandRenderer: Ref<HTMLElement | null> = ref(null);

const commandTargets = ref<HTMLElement[]>([]);

watch(
	commandRenderer,
	(container: HTMLElement | null) => {
		if (container) setTargets(container);
		else resetTargets();
	},
	{
		immediate: true,
		flush: 'post',
	}
);

commandTargets.value = [];

function resetTargets() {
	commandTargets.value = [];
}

// const commandRenderer = useTemplateRef('commandRenderer');
function setTargets(container: HTMLElement) {
	const _commandTargets: HTMLElement[] = [];
	container.querySelectorAll('.command-toc.command-toc-2').forEach(element => {
		_commandTargets.push(element as HTMLElement);
	});
	commandTargets.value = _commandTargets;
}

const { activeId: commandActiveId } = useActiveScroll(commandTargets, {
	overlayHeight: 200,
	root: commandRenderer,
});
watch(commandActiveId, () => {
	// When naturally navigating the content, we want to scroll to the table of contents element as well
	// the items are given the values 'toc-item_<id>' so we can scroll to them easily
	const container = document.getElementById('commands-toc');
	const tocItem = document.getElementsByClassName(`toc-item_${commandActiveId.value}`)[0];
	// first check if the element is already in view
	if (tocItem && container) {
		const rect = tocItem.getBoundingClientRect();
		if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
			return;
		}
		tocItem.scrollIntoView({ behavior: 'smooth' });
	}
});
</script>
<style lang="scss">
#commands-grid {
	grid-template-columns: [l-sidebar] 200px 1fr [content] auto 1fr 1fr;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		grid-template-rows: auto auto;
	}
}
// set up the table of contents as a separate column
#commands-toc {
	overflow-y: auto;
	grid-column: l-sidebar;

	@media (max-width: 768px) {
		position: absolute;
		z-index: 999;
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		max-height: 100%;
		overflow: scroll;
	}

	.p-menu-item.p-focus .p-menu-item-content:has(:not(.selected)) {
		background: inherit;
		color: inherit;
	}
	.selected .p-menu-item.p-focus .p-menu-item-content,
	.p-menu-item-content:has(.selected) {
		background: var(--p-tag-success-background);
		color: var(--p-tag-success-color);
	}
}
#commands-toc.small-screen-hidden {
	@media (max-width: 768px) {
		display: none;
	}
}
// The toggle for the sidebar only displays on small screens
.sidebar-toggle.p-button {
	display: none;
	position: absolute !important;
	top: 0px;
	left: 0px;
	z-index: 1000;
	height: 2.5rem;

	@media (max-width: 768px) {
		display: block;
	}
}

#commands-content {
	grid-column: content;
}
</style>
