<template>
	<tr :class="{ 'border-b-0': firstRowHasBottomBorder }">
		<td>
			<h3 class="m-0 font-normal">{{ option.name }}</h3>
		</td>
		<td>
			<Tag :severity="option.required ? 'success' : 'info'">{{
				option.required ? 'required' : 'optional'
			}}</Tag>
		</td>
		<td>
			<Tag v-if="('autocomplete' in option && option?.autocomplete) || hasChoices"
				>Multiple Choice</Tag
			>
			<Tag v-else>{{ ApplicationCommandOptionNameByEnum[option.type] }}</Tag>
		</td>
		<td>{{ option.description }}</td>
	</tr>
	<tr
		v-if="'choices' in option && option?.choices?.length"
		:class="{ 'border-b-0': secondRowHasBottomBorder }"
	>
		<td colspan="4">
			Choices: <i> {{ option.choices.map(choice => `${choice.name}`).join(', ') }}</i>
		</td>
	</tr>
	<tr v-if="extendedOptionDocumentation">
		<td colspan="4">
			<pre class="not-prose whitespace-pre-wrap">{{
				extendedOptionDocumentation.description
			}}</pre>
		</td>
	</tr>
</template>
<script setup lang="ts">
import {
	ApplicationCommandOptionType,
	type ExtendedOptionDocumentation,
} from '@kobold/documentation';
import type {
	APIApplicationCommandOption,
	ApplicationCommandOptionType as ApplicationCommandOptionTypeSource,
} from 'discord.js';
const { option, extendedOptionDocumentation } = defineProps<{
	extendedOptionDocumentation: ExtendedOptionDocumentation | undefined;
	option: APIApplicationCommandOption;
}>();
const hasChoices = 'choices' in option && option?.choices?.length;

// map the discord option type enums to display values
const ApplicationCommandOptionNameByEnum: Record<ApplicationCommandOptionTypeSource, string> = {
	[ApplicationCommandOptionType.Subcommand]: 'Subcommand',
	[ApplicationCommandOptionType.SubcommandGroup]: 'SubcommandGroup',
	[ApplicationCommandOptionType.String]: 'Text',
	[ApplicationCommandOptionType.Integer]: 'Number',
	[ApplicationCommandOptionType.Boolean]: 'True/False',
	[ApplicationCommandOptionType.User]: 'User',
	[ApplicationCommandOptionType.Channel]: 'Channel',
	[ApplicationCommandOptionType.Role]: 'Role',
	[ApplicationCommandOptionType.Mentionable]: 'Mentionable',
	[ApplicationCommandOptionType.Number]: 'Number',
	[ApplicationCommandOptionType.Attachment]: 'Attachment',
};

// determine which rows have borders
const firstRowHasBottomBorder = hasChoices || extendedOptionDocumentation !== undefined;
const secondRowHasBottomBorder = extendedOptionDocumentation !== undefined;
</script>
