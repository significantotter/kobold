<template>
	<Panel
		v-for="command of commandDisplay"
		:id="`${command.name}`"
		ref="commands"
		:key="command.name"
		class="command-toc command-toc-1"
	>
		<template #header>
			<h2 class="m-0">/{{ command.name }}</h2>
		</template>
		<p>{{ command.description }}</p>

		<Fieldset
			v-for="subCommand of command.subCommands"
			:id="`${command.name}_${subCommand.name}`"
			ref="subcommands"
			:key="`subcommand-${command.name}_${subCommand.name}`"
			:legend="`/ ${command.name} ${subCommand.name}`"
			class="command-toc command-toc-2"
		>
			<template #legend
				><h3 :data-command-name="command.name" class="m-0">
					/{{ command.name }} {{ subCommand.name }}
				</h3></template
			>
			<p>{{ subCommand.description }}</p>
			<p v-if="subCommand.usage">Usage: {{ subCommand.usage }}</p>
			<div v-if="subCommand.options.length" class="bg-emphasis p-2 rounded-lg">
				<h3 class="mt-0">Options</h3>
				<table class="m-0">
					<tbody>
						<CommandRendererSubCommandOption
							v-for="option of subCommand.options"
							:key="`${command.name}.${subCommand.name}.${option.name}`"
							:option="option"
							:extended-option-documentation="
								subCommand.extendedOptionDocumentation?.[option.name]
							"
						/>
					</tbody>
				</table>
			</div>
			<template v-if="subCommand.examples.length && subCommand.name">
				<h3>Examples</h3>
				<div
					v-for="example of subCommand.examples"
					:key="`${command.name}.${subCommand.name}.${example.title}`"
					class="not-prose"
				>
					<h4>{{ example.title }}</h4>
					<ClientOnly>
						<discord-messages class="p-1 rounded-md">
							<bot-interaction
								:options="subCommand.options ?? []"
								:example="example"
								:command-name="command.name"
								:sub-command-name="subCommand.name"
							/> </discord-messages
					></ClientOnly></div
			></template>
		</Fieldset>
	</Panel>
</template>
<script setup lang="ts">
import '@skyra/discord-components-core';
import type { CommandReference } from '@kobold/documentation';
import CommandRendererSubCommandOption from './CommandRendererSubCommandOption.vue';
import BotInteraction from '~/components/discord-messages/BotInteraction.vue';
import Fieldset from 'primevue/fieldset';
import Panel from 'primevue/panel';
const { commands } = defineProps<{
	commands: CommandReference[];
}>();

const commandDisplay = commands
	.map(command => {
		return {
			name: command.definition.metadata.name,
			description: command.definition.metadata.description,
			subCommands: Object.keys(command.definition.subCommands)
				.map(subCommand => {
					if (!command.definition.subCommands[subCommand]) {
						throw new Error(
							`Command ${command.definition.metadata.name} has a subcommand ${subCommand} that is not defined.`
						);
					}
					return {
						name: subCommand,
						description: command.definition.subCommands[subCommand].description,
						usage: command.documentation.subCommands[subCommand].usage,
						options: Object.values(
							command.definition.subCommands[subCommand].options ?? {}
						),
						extendedOptionDocumentation:
							command.documentation.subCommands[subCommand]
								.extendedOptionDocumentation,
						examples: command.documentation.subCommands[subCommand].examples,
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name)),
		};
	})
	.sort((a, b) => a.name.localeCompare(b.name));

const commandRefs = useTemplateRef<InstanceType<typeof Fieldset>[]>('commands');
const subCommandRefs = useTemplateRef<InstanceType<typeof Panel>[]>('subcommands');
defineExpose({ commandRefs, subCommandRefs });
</script>
