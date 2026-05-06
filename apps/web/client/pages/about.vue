<template>
	<div class="about-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PeridotImage class="page-portrait" />
			<section class="hero-panel">
				<div>
					<p class="eyebrow">About Kobold</p>
					<h1>Yip!</h1>
					<p class="lede">
						Kobold was developed by @SignificantOtter to make Pathfinder 2E play by
						post smoother in Discord.
					</p>
				</div>
			</section>

			<section class="panel section-panel">
				<h2>What Kobold Does</h2>
				<p class="section-copy">
					Kobold integrates the excellent character management website Pathbuilder 2E
					with Discord for play by post Pathfinder 2E games.
				</p>
			</section>

			<section class="panel section-panel">
				<h2>Features</h2>
				<div class="feature-grid">
					<div v-for="feature in features" :key="feature" class="feature-card">
						{{ feature }}
					</div>
				</div>
			</section>

			<section class="panel section-panel">
				<h2>Links</h2>
				<div class="link-grid">
					<a
						class="primary-link"
						href="https://discord.com/oauth2/authorize?client_id=909138081163137094&scope=bot&permissions=532643576896"
					>
						Invite Kobold
					</a>
					<a class="secondary-link" href="https://ko-fi.com/significantotter">
						Support Development
					</a>
					<a class="secondary-link" href="https://discord.gg/6bS2GM59uj">
						Support Server
					</a>
					<a class="secondary-link" href="https://github.com/significantotter/kobold">
						GitHub
					</a>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import PeridotImage from '@/components/PeridotImage.vue';

const features = [
	'Import characters from Pathbuilder 2E',
	"Import characters from Wanderer's Guide",
	"Roll dice for your character's stats",
	'Track characters and NPCs through rounds of initiative',
	'Create custom, configurable, rollable actions',
	'Use flexible modifiers to track bonuses and penalties to dice rolls',
	'Reference most Pathfinder 2E content with the compendium command',
];
</script>

<style scoped>
.about-page {
	background:
		radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%),
		radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.panel,
.hero-panel,
.feature-card {
	border: 1px solid rgba(63, 63, 70, 0.9);
	background: rgba(24, 24, 27, 0.82);
	backdrop-filter: blur(10px);
	border-radius: 1rem;
	box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
}

.page-portrait {
	margin-bottom: 1rem;
}

.page-portrait :deep(img) {
	width: 200px;
	height: 200px;
	object-fit: contain;
}

.hero-panel {
	display: flex;
	justify-content: space-between;
	gap: 1.5rem;
	padding: 1.5rem;
	margin-bottom: 1rem;
	align-items: center;
	flex-wrap: wrap;
}

.section-panel {
	padding: 1.4rem;
	margin-bottom: 1rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.72rem;
	color: #93c5fd;
	margin: 0 0 0.5rem;
}

h1,
h2 {
	margin: 0;
	color: #fafafa;
}

.lede,
.section-copy {
	color: #d4d4d8;
}

.lede,
.section-copy {
	max-width: 48rem;
	line-height: 1.65;
}

.feature-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 0.85rem;
	margin-top: 1rem;
}

.feature-card {
	padding: 1rem;
	color: #e4e4e7;
	box-shadow: none;
}

.link-grid {
	display: flex;
	gap: 0.65rem;
	flex-wrap: wrap;
	align-items: center;
	margin-top: 1rem;
}

.primary-link,
.secondary-link {
	border-radius: 999px;
	padding: 0.7rem 1rem;
	border: 1px solid transparent;
	font-weight: 600;
	cursor: pointer;
	text-decoration: none;
	transition:
		background 0.16s ease,
		border-color 0.16s ease,
		color 0.16s ease;
}

.primary-link {
	background: #2563eb;
	color: white;
	border-color: #2563eb;
}

.secondary-link {
	background: rgba(39, 39, 42, 0.85);
	color: #e4e4e7;
	border-color: rgba(82, 82, 91, 1);
}

.primary-link:hover,
.secondary-link:hover {
	text-decoration: none;
	filter: brightness(1.08);
}
</style>
