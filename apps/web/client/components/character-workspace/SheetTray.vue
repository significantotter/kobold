<template>
	<div class="sheet-tray-backdrop" role="presentation" @click.self="$emit('close')">
		<aside
			class="sheet-tray"
			role="dialog"
			aria-modal="true"
			:aria-labelledby="display.titleId"
		>
			<header class="sheet-tray-header">
				<div class="sheet-statblock-title">
					<img
						v-if="display.summary.imageUrl"
						class="sheet-statblock-image"
						:src="display.summary.imageUrl"
						:alt="`${display.name} portrait`"
					/>
					<div>
						<p class="eyebrow">{{ display.eyebrow }}</p>
						<h2 :id="display.titleId">{{ display.name }}</h2>
						<p>{{ display.identityLine }}</p>
					</div>
				</div>
				<button
					class="icon-action-button"
					type="button"
					aria-label="Close sheet"
					@click="$emit('close')"
				>
					<i class="pi pi-times" aria-hidden="true" />
				</button>
			</header>

			<div class="sheet-tray-body">
				<section class="sheet-statblock-hero">
					<div class="sheet-vital-grid">
						<div class="sheet-vital-card sheet-vital-card-hp">
							<span>Hit Points</span>
							<strong>{{ hpLabel }}</strong>
						</div>
						<div class="sheet-vital-card">
							<span>Armor Class</span>
							<strong>{{ display.summary.ac ?? '-' }}</strong>
						</div>
						<div class="sheet-vital-card">
							<span>Perception</span>
							<strong>{{ formatNullableSigned(display.summary.perception) }}</strong>
						</div>
					</div>
					<div class="sheet-save-row">
						<div v-for="save in savePills" :key="save.label" class="sheet-save-pill">
							<span>{{ save.label }}</span>
							<strong>{{ save.value }}</strong>
						</div>
					</div>
				</section>

				<section class="sheet-statblock-section">
					<div v-if="traitTags.length > 0" class="sheet-trait-row">
						<span v-for="trait in traitTags" :key="trait" class="sheet-trait-chip">
							{{ trait }}
						</span>
					</div>
					<p v-if="display.sheet.infoLists.senses.length > 0">
						<strong>Perception</strong>
						{{ formatNullableSigned(display.summary.perception) }};
						{{ display.sheet.infoLists.senses.join(', ') }}
					</p>
					<p v-if="display.sheet.infoLists.languages.length > 0">
						<strong>Languages</strong>
						{{ display.sheet.infoLists.languages.join(', ') }}
					</p>
					<p v-if="skills.length > 0">
						<strong>Skills</strong>
						<span v-for="(skill, index) in skills" :key="skill.label">
							{{ index === 0 ? '' : ', ' }}{{ skill.label }} {{ skill.value }}
						</span>
					</p>
					<div class="sheet-ability-row">
						<span v-for="ability in abilities" :key="ability.label">
							<strong>{{ ability.label }}</strong> {{ ability.value }}
						</span>
					</div>
				</section>

				<section class="sheet-statblock-section">
					<p>
						<strong>AC</strong> {{ display.summary.ac ?? '-' }};
						<strong>Fort</strong>
						{{ formatNullableSigned(display.summary.saves.fortitude) }},
						<strong>Ref</strong>
						{{ formatNullableSigned(display.summary.saves.reflex) }},
						<strong>Will</strong>
						{{ formatNullableSigned(display.summary.saves.will) }}
					</p>
					<p><strong>HP</strong> {{ hpLabel }}</p>
					<div v-if="defenseLists.length > 0" class="sheet-list-blocks">
						<div v-for="list in defenseLists" :key="list.label">
							<span>{{ list.label }}</span>
							<p>{{ list.values.join(', ') }}</p>
						</div>
					</div>
				</section>

				<section class="sheet-statblock-section">
					<p><strong>Speed</strong> {{ speedLine }}</p>
				</section>

				<section v-if="display.sheet.attacks.length > 0" class="sheet-statblock-section">
					<h3>Attacks</h3>
					<div class="sheet-attack-list">
						<article
							v-for="attack in display.sheet.attacks"
							:key="attack.name"
							class="sheet-attack-card"
						>
							<div class="sheet-attack-main">
								<strong>{{ attack.name }}</strong>
								<span v-if="attack.toHit !== null">{{ signed(attack.toHit) }}</span>
								<span v-if="attack.range">{{ attack.range }}</span>
							</div>
							<p v-if="attack.damage.length > 0">
								<strong>Damage</strong>
								{{ formatSheetDamage(attack.damage) }}
							</p>
							<div v-if="attack.traits.length > 0" class="sheet-trait-row">
								<span
									v-for="trait in attack.traits"
									:key="trait"
									class="sheet-trait-chip sheet-trait-chip-muted"
								>
									{{ trait }}
								</span>
							</div>
							<p v-if="attack.notes" class="subtle-copy">
								{{ attack.notes }}
							</p>
						</article>
					</div>
				</section>

				<section v-if="description" class="sheet-statblock-section">
					<h3>Notes</h3>
					<p>{{ description }}</p>
				</section>

				<section class="sheet-statblock-section">
					<h3>Kobold Resources</h3>
					<div class="sheet-resource-strip">
						<div>
							<span>Actions</span>
							<strong>{{ display.resourceCounts.actions }}</strong>
						</div>
						<div>
							<span>Modifiers</span>
							<strong>{{ display.resourceCounts.modifiers }}</strong>
						</div>
						<div>
							<span>Macros</span>
							<strong>{{ display.resourceCounts.macros }}</strong>
						</div>
					</div>
				</section>
			</div>
		</aside>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatNullableSigned, formatSheetDamage, signed, toTitleLabel } from './formatters';
import type { ActiveSheetDisplay, Sheet } from './types';

const props = defineProps<{
	display: ActiveSheetDisplay;
}>();

defineEmits<{
	(event: 'close'): void;
}>();

const abilityDisplay = [
	{ key: 'strength', label: 'Str' },
	{ key: 'dexterity', label: 'Dex' },
	{ key: 'constitution', label: 'Con' },
	{ key: 'intelligence', label: 'Int' },
	{ key: 'wisdom', label: 'Wis' },
	{ key: 'charisma', label: 'Cha' },
] as const;

const speedDisplay = [
	{ key: 'walkSpeed', label: 'Speed' },
	{ key: 'flySpeed', label: 'Fly' },
	{ key: 'swimSpeed', label: 'Swim' },
	{ key: 'climbSpeed', label: 'Climb' },
	{ key: 'burrowSpeed', label: 'Burrow' },
	{ key: 'dimensionalSpeed', label: 'Dimensional' },
] as const;

const skillDisplay = [
	'acrobatics',
	'arcana',
	'athletics',
	'crafting',
	'deception',
	'diplomacy',
	'intimidation',
	'medicine',
	'nature',
	'occultism',
	'performance',
	'religion',
	'society',
	'stealth',
	'survival',
	'thievery',
] as const;

const hpLabel = computed(() => {
	const hp = props.display.summary.hp;
	if (!hp) return '-';
	return hp.max === null ? String(hp.current) : `${hp.current}/${hp.max}`;
});

const savePills = computed(() => [
	{
		label: 'Fort',
		value: formatNullableSigned(props.display.summary.saves.fortitude),
	},
	{
		label: 'Ref',
		value: formatNullableSigned(props.display.summary.saves.reflex),
	},
	{
		label: 'Will',
		value: formatNullableSigned(props.display.summary.saves.will),
	},
]);

const abilities = computed(() =>
	abilityDisplay.map(ability => ({
		label: ability.label,
		value: formatNullableSigned(props.display.sheet.intProperties[ability.key]),
	}))
);

const traitTags = computed(() =>
	[props.display.sheet.info.size, ...props.display.sheet.infoLists.traits].filter(
		(value): value is string => value !== null && value !== ''
	)
);

const speedLine = computed(() => {
	const speeds = speedDisplay
		.map(speed => {
			const value = props.display.sheet.intProperties[speed.key];
			return value === null ? null : `${speed.label} ${value} ft.`;
		})
		.filter(Boolean);
	return speeds.length > 0 ? speeds.join(', ') : '-';
});

const skills = computed(() => {
	const sheet = props.display.sheet;
	const standardSkills = skillDisplay
		.map(skill => {
			const stat = sheet.stats[skill];
			return stat.bonus === null
				? null
				: { label: toTitleLabel(stat.name || skill), value: signed(stat.bonus) };
		})
		.filter((skill): skill is { label: string; value: string } => skill !== null);
	const additionalSkills = sheet.additionalSkills
		.filter(skill => skill.bonus !== null)
		.map(skill => ({
			label: skill.name,
			value: signed(skill.bonus ?? 0),
		}));
	return [...standardSkills, ...additionalSkills];
});

const defenseLists = computed(() => {
	const { defenses } = props.display.sheet;
	return [
		{ label: 'Immunities', values: defenses.immunities.map(defense => defense.raw) },
		{ label: 'Resistances', values: defenses.resistances.map(defense => defense.raw) },
		{ label: 'Weaknesses', values: defenses.weaknesses.map(defense => defense.raw) },
	].filter(list => list.values.length > 0);
});

const description = computed(() => sheetDescription(props.display.sheet));

function sheetDescription(sheet: Sheet) {
	return sheet.info.description?.trim() ?? '';
}
</script>

<style scoped>
.sheet-tray-backdrop {
	position: fixed;
	z-index: 100;
	inset: 0;
	display: flex;
	justify-content: flex-end;
	background: rgba(9, 9, 11, 0.58);
	backdrop-filter: blur(4px);
}

.sheet-tray {
	width: min(48rem, 100%);
	height: 100%;
	overflow-y: auto;
	border-left: 1px solid rgba(63, 63, 70, 0.95);
	background:
		radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 30%),
		radial-gradient(circle at 10% 0%, rgba(34, 197, 94, 0.08), transparent 24%),
		rgba(18, 18, 21, 0.98);
	box-shadow: -24px 0 55px rgba(0, 0, 0, 0.42);
}

.sheet-tray-header {
	position: sticky;
	z-index: 1;
	top: 0;
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 1rem;
	align-items: start;
	padding: 1.25rem;
	border-bottom: 1px solid rgba(63, 63, 70, 0.78);
	background: rgba(18, 18, 21, 0.96);
	backdrop-filter: blur(12px);
}

.sheet-statblock-title {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	gap: 0.9rem;
	align-items: center;
	min-width: 0;
}

.sheet-statblock-image {
	width: 4.5rem;
	height: 4.5rem;
	object-fit: cover;
	border: 1px solid rgba(82, 82, 91, 0.9);
	border-radius: 0.95rem;
	background: rgba(9, 9, 11, 0.72);
}

.sheet-statblock-title h2 {
	margin: 0;
	color: #fafafa;
	font-size: 1.45rem;
}

.sheet-statblock-title p:not(.eyebrow) {
	margin: 0.2rem 0 0;
	color: #d4d4d8;
}

.sheet-tray-body {
	display: grid;
	gap: 0.85rem;
	padding: 1.25rem;
}

.sheet-statblock-hero,
.sheet-statblock-section {
	display: grid;
	gap: 0.65rem;
	padding: 0.85rem;
	border: 1px solid rgba(63, 63, 70, 0.62);
	border-radius: 0.9rem;
	background: rgba(24, 24, 27, 0.54);
}

.sheet-statblock-section {
	position: relative;
}

.sheet-statblock-section::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0.85rem;
	right: 0.85rem;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.35), transparent);
}

.sheet-statblock-section h3 {
	margin: 0;
	color: #93c5fd;
	font-size: 0.82rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.sheet-statblock-section p {
	margin: 0;
	color: #d4d4d8;
	line-height: 1.45;
}

.sheet-vital-grid,
.sheet-save-row,
.sheet-resource-strip {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.5rem;
}

.sheet-vital-card {
	display: grid;
	justify-items: center;
	gap: 0.25rem;
	padding: 0.75rem;
	border: 1px solid rgba(63, 63, 70, 0.62);
	border-radius: 0.8rem;
	background: rgba(9, 9, 11, 0.45);
	text-align: center;
}

.sheet-vital-card span,
.sheet-save-pill span,
.sheet-list-blocks span,
.sheet-resource-strip span {
	color: #a1a1aa;
	font-size: 0.72rem;
}

.sheet-vital-card strong {
	color: #fafafa;
	font-size: 1.35rem;
}

.sheet-vital-card-hp strong {
	color: #86efac;
}

.sheet-save-pill {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	padding: 0.45rem 0.65rem;
	border: 1px solid rgba(63, 63, 70, 0.7);
	border-radius: 999px;
	background: rgba(9, 9, 11, 0.5);
}

.sheet-save-pill strong,
.sheet-ability-row strong,
.sheet-attack-main strong,
.sheet-resource-strip strong,
.sheet-statblock-section strong {
	color: #fafafa;
}

.sheet-trait-row,
.sheet-ability-row {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
}

.sheet-trait-chip {
	display: inline-flex;
	align-items: center;
	padding: 0.22rem 0.45rem;
	border-radius: 0.35rem;
	background: rgba(22, 163, 74, 0.22);
	color: #bbf7d0;
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.sheet-trait-chip-muted {
	background: rgba(82, 82, 91, 0.4);
	color: #d4d4d8;
	text-transform: none;
}

.sheet-ability-row span {
	padding: 0.28rem 0.5rem;
	border: 1px solid rgba(63, 63, 70, 0.62);
	border-radius: 999px;
	background: rgba(9, 9, 11, 0.42);
	color: #d4d4d8;
}

.sheet-list-blocks,
.sheet-attack-list {
	display: grid;
	gap: 0.5rem;
}

.sheet-list-blocks > div,
.sheet-attack-card {
	padding: 0.65rem 0.75rem;
	border: 1px solid rgba(63, 63, 70, 0.58);
	border-radius: 0.75rem;
	background: rgba(39, 39, 42, 0.38);
}

.sheet-list-blocks p,
.sheet-attack-card p {
	margin: 0.25rem 0 0;
}

.sheet-attack-card {
	display: grid;
	gap: 0.45rem;
}

.sheet-attack-main {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	align-items: baseline;
}

.sheet-attack-main span {
	color: #d4d4d8;
}

.sheet-resource-strip {
	gap: 0;
	padding: 0.45rem 0.25rem;
	border: 1px solid rgba(63, 63, 70, 0.46);
	border-radius: 0.75rem;
	background: rgba(24, 24, 27, 0.38);
}

.sheet-resource-strip div {
	display: grid;
	gap: 0.1rem;
	justify-items: center;
	padding: 0.05rem 0.45rem;
	text-align: center;
}

.sheet-resource-strip div + div {
	border-left: 1px solid rgba(63, 63, 70, 0.45);
}
</style>
