<template>
	<Fieldset :legend="`/ ${commandName} ${subCommand.name}`">
		<template #legend
			><h3 class="m-0">/{{ commandName }} {{ subCommand.name }}</h3></template
		>
		<p>{{ subCommand.description }}</p>
		<p v-if="subCommandDocumentation.usage">Usage: {{ subCommandDocumentation.usage }}</p>
		<div v-if="optionsAsArray.length" class="bg-emphasis p-2 rounded-lg">
			<h3 v-if="optionsAsArray.length" class="mt-0">Options</h3>
			<table class="m-0">
				<tbody>
					<CommandRendererSubCommandOption
						v-for="option of optionsAsArray"
						:key="`${commandName}.${subCommand.name}.${option.name}`"
						:option="option"
						:extended-option-documentation="
							subCommandDocumentation.extendedOptionDocumentation?.[option.name]
						"
					/>
				</tbody>
			</table>
		</div>
		<h3>Examples</h3>
		<div
			v-for="example of subCommandDocumentation.examples"
			:key="`${commandName}.${subCommand.name}.${example.title}`"
			class="not-prose"
		>
			<h4>{{ example.title }}</h4>
			<ClientOnly>
				<discord-messages class="p-1 rounded-md">
					<bot-interaction
						:options="subCommand.options ?? {}"
						:example="example"
						:command-name="commandName"
						:sub-command-name="subCommand.name"
					/> </discord-messages
			></ClientOnly>
		</div>
	</Fieldset>
</template>
<script setup lang="ts">
import '@skyra/discord-components-core';
import _ from 'lodash';
import type { CommandReference, SubCommandDocumentationExample } from '@kobold/documentation';
import CommandRendererSubCommandOption from './CommandRendererSubCommandOption.vue';
import BotInteraction from '~/components/discord-messages/BotInteraction.vue';

const { command, subCommandName } = defineProps<{
	command: CommandReference;
	subCommandName: string;
}>();
const subCommand = command.definition.subCommands[subCommandName];
const subCommandDocumentation = command.documentation.subCommands[
	subCommandName
] as SubCommandDocumentationExample;
const commandName = command.definition.metadata.name;

const optionsAsArray = _.values(subCommand.options);
</script>
