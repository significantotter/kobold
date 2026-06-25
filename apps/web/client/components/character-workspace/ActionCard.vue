<template>
	<article class="resource-card action-card" :class="{ 'resource-card-muted': inherited }">
		<div class="action-card-header">
			<span v-if="actionCostLabel" class="action-cost-chip">
				{{ actionCostLabel }}
			</span>
			<div class="action-title-block">
				<strong>{{ action.payload.name }}</strong>
				<div class="action-meta-row">
					<span class="modifier-chip modifier-chip-type">
						{{ actionTypeLabel }}
					</span>
					<span class="modifier-chip modifier-chip-muted">
						{{ actionStageCountLabel }}
					</span>
					<RouterLink
						v-if="inherited || library"
						class="modifier-chip modifier-chip-library modifier-chip-link"
						to="/library"
					>
						{{ library ? 'Library' : 'Inherited' }}
					</RouterLink>
					<span v-if="action.payload.autoHeighten" class="modifier-chip modifier-chip-severity">
						Auto-heighten
					</span>
					<span v-if="actionBaseLevelLabel" class="modifier-chip modifier-chip-muted">
						{{ actionBaseLevelLabel }}
					</span>
				</div>
			</div>
		</div>

		<p v-if="actionDescription" class="action-description">
			{{ actionDescription }}
		</p>

		<div class="action-stage-block">
			<h4>Workflow</h4>
			<div v-if="actionStageRows.length > 0" class="action-stage-list">
				<div
					v-for="stage in actionStageRows"
					:key="stage.key"
					class="action-stage-row"
					:class="{ 'action-stage-row-muted': stage.muted }"
				>
					<span class="action-stage-kind">{{ stage.kind }}</span>
					<span class="action-stage-name">{{ stage.name }}</span>
					<span class="action-stage-detail">{{ stage.detail }}</span>
					<span v-if="stage.allowRollModifiers" class="action-stage-modifier-chip">
						Mods
					</span>
				</div>
			</div>
			<p v-else class="modifier-empty-line">No roll stages.</p>
		</div>

		<div v-if="actionTags.length > 0" class="action-card-footer">
			<div class="sheet-trait-row">
				<span
					v-for="tag in actionTags"
					:key="tag"
					class="sheet-trait-chip sheet-trait-chip-muted"
				>
					{{ tag }}
				</span>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { toTitleLabel } from './formatters';
import type { ActionDisplayItem, ActionRoll, SheetDamageTerm } from './types';

type ActionStageSummary = {
	key: string;
	kind: string;
	name: string;
	detail: string;
	allowRollModifiers: boolean;
	muted: boolean;
};

const props = withDefaults(
	defineProps<{
		action: ActionDisplayItem;
		inherited?: boolean;
		library?: boolean;
	}>(),
	{
		inherited: false,
		library: false,
	}
);

const actionCostLabels: Record<string, string> = {
	oneAction: '1A',
	twoActions: '2A',
	threeActions: '3A',
	freeAction: 'Free',
	variableActions: 'Var',
	reaction: 'React',
};

const actionCostLabel = computed(() => {
	const actionCost = props.action.payload.actionCost ?? 'none';
	return actionCostLabels[actionCost];
});

const actionTypeLabel = computed(() => toTitleLabel(props.action.payload.type ?? 'other'));

const actionRolls = computed(() => {
	const rolls = props.action.payload.rolls;
	return Array.isArray(rolls) ? rolls : [];
});

const actionStageCountLabel = computed(() => {
	const count = actionRolls.value.length;
	return `${count} stage${count === 1 ? '' : 's'}`;
});

const actionBaseLevelLabel = computed(() => {
	const baseLevel = props.action.payload.baseLevel;
	return baseLevel === null ? '' : `Rank ${baseLevel}`;
});

const actionTags = computed(() => {
	const tags = props.action.payload.tags;
	return Array.isArray(tags) ? tags.filter(Boolean) : [];
});

const actionDescription = computed(() => props.action.payload.description.trim());

const actionStageRows = computed<ActionStageSummary[]>(() =>
	actionRolls.value.map((roll, index) => ({
		key: `${index}-${roll.type}-${roll.name}`,
		kind: actionRollKindLabel(roll),
		name: roll.name,
		detail: actionRollDetail(roll),
		allowRollModifiers: roll.allowRollModifiers === true,
		muted: roll.type === 'text' || roll.type === 'effect',
	}))
);

function actionRollKindLabel(roll: ActionRoll) {
	const labels: Record<string, string> = {
		attack: 'Attack',
		'skill-challenge': 'Skill',
		damage: 'Damage',
		'advanced-damage': 'Damage',
		save: 'Save',
		text: 'Text',
		effect: 'Effect',
	};
	return labels[roll.type] ?? toTitleLabel(roll.type);
}

function actionRollDetail(roll: ActionRoll) {
	if (roll.type === 'attack' || roll.type === 'skill-challenge') {
		const rollText = roll.roll?.trim() || 'No roll';
		return roll.targetDC ? `${rollText} vs ${roll.targetDC}` : rollText;
	}
	if (roll.type === 'damage') {
		return actionDamageTermsLabel(roll.terms ?? []);
	}
	if (roll.type === 'advanced-damage') {
		return actionAdvancedDamageLabel(roll);
	}
	if (roll.type === 'save') {
		const save = roll.saveRollType?.trim() || 'Save';
		return roll.saveTargetDC ? `${save} vs ${roll.saveTargetDC}` : save;
	}
	if (roll.type === 'text') {
		return actionTextRollLabel(roll);
	}
	if (roll.type === 'effect') {
		const condition = roll.condition;
		if (!condition) return `Applies effect on ${roll.trigger ?? 'any outcome'}`;
		const severity =
			condition.severity === null || condition.severity === undefined
				? ''
				: ` ${condition.severity}`;
		return `${condition.name}${severity} on ${roll.trigger ?? 'any outcome'}`;
	}
	return 'Configured stage';
}

function actionDamageTermsLabel(terms: SheetDamageTerm[]) {
	if (terms.length === 0) return 'No damage';
	return terms
		.map(term => {
			const mode = term.mode === 'healing' ? 'healing' : term.type;
			return [term.dice ?? 'none', mode].filter(Boolean).join(' ');
		})
		.join(', ');
}

function actionAdvancedDamageLabel(roll: ActionRoll) {
	const outcomes = [
		{ label: 'Crit', terms: roll.criticalSuccessTerms ?? [] },
		{ label: 'Success', terms: roll.successTerms ?? [] },
		{ label: 'Failure', terms: roll.failureTerms ?? [] },
		{ label: 'Crit Fail', terms: roll.criticalFailureTerms ?? [] },
	].filter(outcome => outcome.terms.length > 0);
	if (outcomes.length === 0) return 'No damage';
	return outcomes
		.map(outcome => `${outcome.label}: ${actionDamageTermsLabel(outcome.terms)}`)
		.join(' / ');
}

function actionTextRollLabel(roll: ActionRoll) {
	const populated = [
		roll.defaultText,
		roll.criticalSuccessText,
		roll.successText,
		roll.failureText,
		roll.criticalFailureText,
	].filter(text => text && text.trim().length > 0);
	return populated.length > 0
		? `${populated.length} text outcome${populated.length === 1 ? '' : 's'}`
		: 'Text outcome';
}

</script>
