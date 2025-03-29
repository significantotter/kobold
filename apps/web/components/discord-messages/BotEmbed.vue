<!-- eslint-disable vue/no-v-html -->
<template>
	<discord-embed
		slot="embeds"
		color="limegreen"
		v-bind="{ embedEmojisMap: discordComponentConfig.emojis }"
		:thumbnail="embed.thumbnail"
		:url="embed.url"
		:embed-title="applyTerms(embed.title)"
	>
		<discord-embed-description v-if="embed.description" slot="description">
			<div v-html="useMarkdown(embed.description)" />
		</discord-embed-description>
		<discord-embed-fields v-if="embed.fields?.length" slot="fields"
			><discord-embed-field
				v-for="(field, fieldIndex) of embed.fields"
				:key="fieldIndex"
				:field-title="field.name"
				:inline="field.inline"
				:inline-index="field.inlineIndex"
				>{{ field.value }}</discord-embed-field
			></discord-embed-fields
		><discord-embed-footer v-if="embed.footer" slot="footer"
			><span>{{ embed.footer }}</span></discord-embed-footer
		>
	</discord-embed>
</template>

<script setup lang="ts">
import { discordComponentConfig } from '~/utils/discord-component-config.js';
import type { CommandDocumentationEmbed } from '@kobold/documentation';
import { applyTerms } from '~/utils/text.helpers';
import { useMarkdown } from '../text-renderers/useMarkdown';

const { embed } = defineProps<{
	embed: CommandDocumentationEmbed;
}>();
</script>
