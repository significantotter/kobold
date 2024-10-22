<template>
	<Panel v-for="command of commands" :key="command.definition.metadata.name">
		<template #header>
			<h2 class="m-0">/{{ command.definition.metadata.name }}</h2>
		</template>
		<p>{{ command.definition.metadata.description }}</p>
		<CommandRendererSubCommand
			v-for="subCommand of Object.keys(command.definition.subCommands)"
			:key="`${command.definition.metadata.name}.${subCommand}`"
			:command-name="command.definition.metadata.name"
			:command="command"
			:sub-command-name="subCommand"
		/>
	</Panel>
</template>
<script setup lang="ts">
import type { CommandReference } from '@kobold/documentation';
import CommandRendererSubCommand from './CommandRendererSubCommand.vue';
const { commands } = defineProps<{
	commands: CommandReference[];
}>();
</script>
