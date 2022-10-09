export const refs = {
	bot: {
		name: 'Kobold',
		author: 'Significantotter',
	},
	emojis: {
		yes: '✅',
		no: '❌',
	},
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		author: 'https://github.com/significantotter',
		docs: 'https://top.gg/',
		donate: 'https://ko-fi.com/significantotter',
		invite: 'https://discord.com/',
		source: 'https://github.com/significantotter/kobold',
		support: 'https://discord.gg/6bS2GM59uj',
		template: '',
		vote: 'https://top.gg/',
	},
};
export const embedLinks = {
	authorEmbed: `[${refs.bot.author}]${refs.links.author})`,
	docsEmbed: `[View Documentation]${refs.links.docs})`,
	donateEmbed: `[Help support ${refs.bot.name}'s development!]${refs.links.donate})`,
	inviteEmbed: `[Invite ${refs.bot.name} to a Server!]${refs.links.invite})`,
	sourceEmbed: `[View Source Code]${refs.links.source})`,
	supportEmbed: `[Join Support Server]${refs.links.support})`,
	templateEmbed: `[Discord Bot TypeScript Template]${refs.links.template})`,
	voteEmbed: `[Vote for ${refs.bot.name}!]${refs.links.vote})`,
	wgEmbed: `[Wanderer's Guide](https://wanderersguide.app)`,
};
