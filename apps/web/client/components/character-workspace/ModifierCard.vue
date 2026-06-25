<template>
	<article
		class="resource-card modifier-card"
		:class="{
			'resource-card-muted': muted,
			'modifier-card-menu-open': menuOpen,
		}"
	>
		<div class="modifier-card-header">
			<div class="modifier-title-block">
				<strong>{{ title }}</strong>
				<div class="modifier-chip-row">
					<span class="modifier-chip modifier-chip-type">
						{{ modifierTypeLabel(payload.type ?? 'untyped') }}
					</span>
					<RouterLink
						v-if="library"
						class="modifier-chip modifier-chip-library modifier-chip-link"
						to="/library"
					>
						Library
					</RouterLink>
					<span
						v-if="showState"
						class="modifier-chip"
						:class="modifierStateClass"
					>
						{{ modifierStateLabel }}
					</span>
					<span v-if="unassigned" class="modifier-chip modifier-chip-muted">
						Unassigned
					</span>
					<span v-if="modifierSeverityLabel" class="modifier-chip modifier-chip-severity">
						{{ modifierSeverityLabel }}
					</span>
				</div>
			</div>
			<div v-if="showMenu" class="minion-menu-shell">
				<button
					class="icon-action-button"
					type="button"
					:aria-expanded="menuOpen"
					:aria-label="`More actions for ${title}`"
					@click="$emit('toggle-menu')"
				>
					<span aria-hidden="true">&hellip;</span>
				</button>
				<div v-if="menuOpen" class="minion-action-menu">
					<button class="minion-action-menu-item" @click="$emit('toggle')">
						{{ payload.isActive ? 'Deactivate' : 'Activate' }}
					</button>
				</div>
			</div>
		</div>

		<div v-if="hasMechanics" class="modifier-mechanics-grid">
			<section v-if="hasSheetEffects" class="modifier-mechanics-block">
				<h4>Sheet Effects</h4>
				<div class="modifier-adjustment-list">
					<div
						v-for="(adjustment, index) in sheetAdjustments"
						:key="`${title}-adjustment-${index}`"
						class="modifier-adjustment-row"
						:class="modifierAdjustmentClass(adjustment)"
					>
						<span class="modifier-adjustment-kind">
							{{ adjustmentPropertyTypeLabel(adjustment.propertyType) }}
						</span>
						<span class="modifier-adjustment-property">
							{{ adjustmentPropertyLabel(adjustment.property) }}
						</span>
						<span class="modifier-adjustment-expression">
							{{ adjustmentExpression(adjustment) }}
						</span>
						<span
							v-if="adjustment.type !== 'untyped'"
							class="modifier-adjustment-type"
						>
							{{ modifierTypeLabel(adjustment.type) }}
						</span>
					</div>
				</div>
			</section>

			<section v-if="hasRollRule" class="modifier-mechanics-block modifier-roll-block">
				<h4>Roll Rule</h4>
				<div class="modifier-roll-rule">
					<div v-if="payload.rollAdjustment" class="modifier-roll-adjustment">
						<span>Adjustment</span>
						<strong>{{ payload.rollAdjustment }}</strong>
					</div>
					<div v-if="rollTargetTags.length > 0" class="modifier-target-row">
						<span v-for="tag in rollTargetTags" :key="tag" class="sheet-trait-chip">
							{{ tag }}
						</span>
					</div>
				</div>
			</section>
		</div>

		<div v-if="hasProse" class="modifier-prose-line">
			<span v-if="payload.note">Note: {{ payload.note }}</span>
			<span v-if="payload.description" class="modifier-description-chip">
				Description available
			</span>
		</div>
	</article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { toTitleLabel } from './formatters';
import type { ModifierLike, ModifierPayload } from './types';

type SheetAdjustment = ModifierPayload['sheetAdjustments'][number];

const props = withDefaults(
	defineProps<{
		item: ModifierLike;
		muted?: boolean;
		library?: boolean;
		unassigned?: boolean;
		showMenu?: boolean;
		menuOpen?: boolean;
		showState?: boolean;
	}>(),
	{
		muted: false,
		library: false,
		unassigned: false,
		showMenu: false,
		menuOpen: false,
		showState: true,
	}
);

defineEmits<{
	(event: 'toggle-menu'): void;
	(event: 'toggle'): void;
}>();

const payload = computed(() => modifierPayload(props.item));
const title = computed(() => payload.value.name);

const adjustmentPropertyTypeLabels: Record<string, string> = {
	info: 'Info',
	infoList: 'Info List',
	intProperty: 'Number',
	baseCounter: 'Counter',
	weaknessResistance: 'Weakness/Resistance',
	stat: 'Stat',
	attack: 'Attack',
	extraSkill: 'Extra Skill',
	statGroup: 'Stat Group',
	none: 'Other',
};

const adjustmentPropertyLabels: Record<string, string> = {
	ac: 'AC',
	hp: 'HP',
	maxHp: 'Max HP',
	tempHp: 'Temp HP',
	dc: 'DC',
	fortitude: 'Fortitude',
	reflex: 'Reflex',
	will: 'Will',
	perception: 'Perception',
	speed: 'Speed',
};

const modifierStateLabel = computed(() => (payload.value.isActive ? 'Active' : 'Inactive'));
const modifierStateClass = computed(() =>
	payload.value.isActive ? 'modifier-chip-active' : 'modifier-chip-inactive'
);
const modifierSeverityLabel = computed(() => {
	const severity = payload.value.severity;
	return severity === null || severity === undefined ? '' : `Severity ${severity}`;
});
const sheetAdjustments = computed(() =>
	Array.isArray(payload.value.sheetAdjustments) ? payload.value.sheetAdjustments : []
);
const hasSheetEffects = computed(() => sheetAdjustments.value.length > 0);
const rollTargetTags = computed(() =>
	(payload.value.rollTargetTags ?? '')
		.split(/[,\s]+/)
		.map(tag => tag.trim())
		.filter(Boolean)
);
const hasRollRule = computed(
	() => Boolean(payload.value.rollAdjustment) || rollTargetTags.value.length > 0
);
const hasMechanics = computed(() => hasSheetEffects.value || hasRollRule.value);
const hasProse = computed(() => Boolean(payload.value.note || payload.value.description));

function modifierPayload(input: ModifierLike): ModifierPayload {
	return 'payload' in input ? input.payload : input;
}

function modifierTypeLabel(type: string) {
	return toTitleLabel(type || 'untyped');
}

function adjustmentPropertyTypeLabel(propertyType: string) {
	return adjustmentPropertyTypeLabels[propertyType] ?? toTitleLabel(propertyType);
}

function adjustmentPropertyLabel(property: string) {
	return adjustmentPropertyLabels[property] ?? toTitleLabel(property);
}

function modifierAdjustmentClass(adjustment: SheetAdjustment) {
	return adjustment.propertyType === 'attack' || adjustment.value.length > 24
		? 'modifier-adjustment-row-long'
		: '';
}

function adjustmentExpression(adjustment: SheetAdjustment) {
	const value = adjustment.value.trim().replace(/\|/g, ' | ');
	if (adjustment.operation === '=') return value;
	return `${adjustment.operation}${value}`;
}

</script>
