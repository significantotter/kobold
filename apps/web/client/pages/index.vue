<template>
	<div class="home-page overflow-auto px-4 py-8">
		<main class="mx-auto max-w-6xl">
			<PeridotImage class="page-portrait" />
			<section class="hero-panel">
				<div>
					<p class="eyebrow">Pathfinder 2E Play by Post</p>
					<h1>Yip!</h1>
					<p class="lede">
						Kobold brings Pathfinder character management, rolling, initiative, and
						reference tools into Discord.
					</p>
				</div>
			</section>

			<section class="panel section-panel">
				<h2>Add Kobold to your Discord server</h2>
				<p class="section-copy">
					Start with the bot invite, then import characters and manage play-by-post
					resources from the web tools.
				</p>
				<div class="hero-actions">
					<a
						class="primary-link"
						href="https://discord.com/oauth2/authorize?client_id=909138081163137094&scope=bot&permissions=532643576896"
					>
						Invite Kobold
					</a>
					<RouterLink class="secondary-link" to="/import">Import Character</RouterLink>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import PeridotImage from '@/components/PeridotImage.vue';
</script>

<style scoped>
.home-page {
	background:
		radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%),
		radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
		linear-gradient(180deg, rgba(24, 24, 27, 0.98), rgba(9, 9, 11, 1));
	min-height: 100%;
}

.panel,
.hero-panel {
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

.lede {
	max-width: 42rem;
	font-size: 1.08rem;
	line-height: 1.65;
}

.hero-actions {
	display: flex;
	gap: 0.65rem;
	flex-wrap: wrap;
	align-items: center;
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
