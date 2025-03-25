<template>
	<discord-message v-bind="discordComponentConfig.profiles.significantotter"
		>/{{ commandName }} {{ subCommandName ? subCommandName : '' }}
		<template v-for="exampleOption of filteredOptions" :key="exampleOption">
			<span
				style="
					border: 2px solid var(--border-color);
					background: rgb(10, 12, 22);
					padding: 0.25em 0.5em;
					border-radius: 8px 0 0 8px;
					color: var(--text-color);
				"
				>{{ exampleOption.name }}</span
			><span
				style="
					border: 2px solid var(--border-color);
					background: rgb(21, 25, 35);
					padding: 0.25em 0.5em;
					border-radius: 0 8px 8px 0;
					color: var(--text-color);
				"
				>{{ example.options[exampleOption.name] }}
			</span>
			{{ ' ' }}
		</template></discord-message
	><discord-message v-bind="discordComponentConfig.profiles.kobold"
		><TextWithTerms v-if="example.message" :text="example.message" />
		<BotEmbed
			v-for="(embed, embedIndex) of example.embeds ?? []"
			:key="embedIndex"
			:embed="embed"
		/>
	</discord-message>
</template>
<script setup lang="ts">
import type { CommandDocumentationExample } from '@kobold/documentation';
import TextWithTerms from '~/components/text-renderers/TextWithTerms.vue';
import BotEmbed from '~/components/discord-messages/BotEmbed.vue';
import { discordComponentConfig } from '~/utils/discord-component-config';
import type { APIApplicationCommandOption } from 'discord-api-types/v10';

const { options, example } = defineProps<{
	options: APIApplicationCommandOption[];
	example: CommandDocumentationExample;
	commandName: string;
	subCommandName: string;
}>();

const filteredOptions = options.filter(option => !!example.options[option.name]);
</script>
