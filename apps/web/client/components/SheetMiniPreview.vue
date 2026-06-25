<template>
	<div
		class="sheet-mini-preview"
		:class="{
			'sheet-mini-preview-compact': compact,
			'sheet-mini-preview-has-image': summary.imageUrl,
			'sheet-mini-preview-has-actions': $slots.actions,
		}"
	>
		<div class="sheet-mini-main">
			<img
				v-if="summary.imageUrl"
				class="sheet-mini-image"
				:src="summary.imageUrl"
				:alt="`${name ?? 'Sheet'} portrait`"
				loading="lazy"
			/>
			<div class="sheet-mini-body">
				<strong v-if="name" class="sheet-mini-name">{{ name }}</strong>
				<p class="sheet-mini-identity">{{ levelClassLine }}</p>
				<p v-if="heritageAncestryLine" class="sheet-mini-heritage">
					{{ heritageAncestryLine }}
				</p>
			</div>
			<div v-if="$slots.actions" class="sheet-mini-actions">
				<slot name="actions" />
			</div>
		</div>
		<div v-if="hasStats" class="sheet-mini-stats">
			<div v-if="primaryStatPills.length > 0" class="sheet-mini-stat-row">
				<span v-for="stat in primaryStatPills" :key="stat.label" class="sheet-mini-stat">
					{{ stat.label }} {{ stat.value }}
				</span>
			</div>
			<div v-if="saveStatPills.length > 0" class="sheet-mini-stat-row">
				<span v-for="stat in saveStatPills" :key="stat.label" class="sheet-mini-stat">
					{{ stat.label }} {{ stat.value }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { signed } from '@/components/character-workspace/formatters';
import type { SheetSummary } from '@/components/character-workspace/types';

const props = withDefaults(
	defineProps<{
		name?: string;
		summary: SheetSummary;
		compact?: boolean;
	}>(),
	{
		name: undefined,
		compact: false,
	}
);

const levelClassLine = computed(() => {
	const parts = [`Level ${props.summary.level ?? 'Unknown'}`];
	if (props.summary.class) parts.push(props.summary.class);
	return parts.join(' · ');
});

const heritageAncestryLine = computed(() => {
	const heritage = props.summary.heritage?.trim() ?? '';
	const ancestry = props.summary.ancestry?.trim() ?? '';
	if (!heritage) return ancestry;
	if (!ancestry) return heritage;
	return heritage.toLocaleLowerCase().endsWith(ancestry.toLocaleLowerCase())
		? heritage
		: `${heritage} ${ancestry}`;
});

const primaryStatPills = computed(() => {
	const stats: Array<{ label: string; value: string }> = [];
	if (props.summary.ac !== null) stats.push({ label: 'AC', value: String(props.summary.ac) });
	if (props.summary.perception !== null) {
		stats.push({ label: 'Perception', value: signed(props.summary.perception) });
	}
	if (props.summary.hp) {
		stats.push({
			label: 'HP',
			value:
				props.summary.hp.max === null
					? String(props.summary.hp.current)
					: `${props.summary.hp.current}/${props.summary.hp.max}`,
		});
	}
	return stats;
});

const saveStatPills = computed(() => {
	const stats: Array<{ label: string; value: string }> = [];
	if (props.summary.saves.fortitude !== null) {
		stats.push({ label: 'Fort', value: signed(props.summary.saves.fortitude) });
	}
	if (props.summary.saves.reflex !== null) {
		stats.push({ label: 'Ref', value: signed(props.summary.saves.reflex) });
	}
	if (props.summary.saves.will !== null) {
		stats.push({ label: 'Will', value: signed(props.summary.saves.will) });
	}
	return stats;
});

const hasStats = computed(
	() => primaryStatPills.value.length > 0 || saveStatPills.value.length > 0,
);

</script>

<style scoped>
.sheet-mini-preview {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 0.65rem;
	min-width: 0;
}

.sheet-mini-main {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: 0.85rem;
	align-items: center;
	min-width: 0;
}

.sheet-mini-preview-has-image .sheet-mini-main {
	grid-template-columns: auto minmax(0, 1fr);
}

.sheet-mini-preview-has-actions .sheet-mini-main {
	grid-template-columns: minmax(0, 1fr) auto;
}

.sheet-mini-preview-has-image.sheet-mini-preview-has-actions .sheet-mini-main {
	grid-template-columns: auto minmax(0, 1fr) auto;
}

.sheet-mini-preview-compact {
	gap: 0.7rem;
}

.sheet-mini-image {
	width: 4rem;
	height: 4rem;
	object-fit: cover;
	border-radius: 0.85rem;
	border: 1px solid rgba(82, 82, 91, 0.9);
	background: rgba(9, 9, 11, 0.72);
}

.sheet-mini-preview-compact .sheet-mini-image {
	width: 3.25rem;
	height: 3.25rem;
	border-radius: 0.7rem;
}

.sheet-mini-body {
	min-width: 0;
}

.sheet-mini-actions {
	align-self: start;
}

.sheet-mini-name {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #fafafa;
}

.sheet-mini-identity,
.sheet-mini-heritage {
	margin: 0;
	color: #d4d4d8;
}

.sheet-mini-heritage {
	margin-top: 0.15rem;
	color: #a1a1aa;
}

.sheet-mini-stats {
	display: grid;
	gap: 0.4rem;
}

.sheet-mini-stat-row {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
}

.sheet-mini-stat {
	display: inline-flex;
	align-items: center;
	border-radius: 999px;
	padding: 0.28rem 0.5rem;
	background: rgba(9, 9, 11, 0.58);
	border: 1px solid rgba(63, 63, 70, 0.76);
	color: #e4e4e7;
	font-size: 0.82rem;
	font-weight: 600;
}

@media (max-width: 520px) {
	.sheet-mini-preview-has-image .sheet-mini-main,
	.sheet-mini-preview-has-actions .sheet-mini-main,
	.sheet-mini-preview-has-image.sheet-mini-preview-has-actions .sheet-mini-main {
		grid-template-columns: 1fr;
	}

	.sheet-mini-actions {
		justify-self: start;
	}
}
</style>
