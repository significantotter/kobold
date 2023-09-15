const links = {
	thumbnail: 'https://i.imgur.com/cVOfw8P.png',
	docs: 'https://top.gg/bot/909138081163137094',
	donate: 'https://ko-fi.com/significantotter',
	invite: 'https://discord.com/oauth2/authorize?client_id=909138081163137094&scope=bot&permissions=532643576896',
	source: 'https://github.com/significantotter/kobold',
	support: 'https://discord.gg/6bS2GM59uj',
	template: 'https://github.com/KevinNovak/Discord-Bot-TypeScript-Template',
	vote: 'https://top.gg/bot/909138081163137094',
};
const bot = {
	name: 'Kobold',
	author: 'SignificantOtter#3403',
};

export let refs = {
	bot: { ...bot },
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		...links,
		embed: {
			donate: `[Support Kobold's development through ko-fi](${links.donate})`,
			invite: `[Invite Kobold to a Discord Server](${links.invite})`,
			source: `[Follow Kobold's development on Github](${links.source})`,
			support: `[Join Kobold's Support Server on Discord](${links.support})`,
			template: `[Built with Kevin Novak's Discord Bot TypeScript Template](${links.template})`,
			vote: `[Vote for Kobold!](${links.vote})`,
			pathbuilder: `[Pathbuilder 2E](https://pathbuilder2e.com)`,
			wanderersGuide: `[Wanderer's Guide](https://wanderersguide.app)`,
		},
	},
};
export const embedLinks = {
	authorEmbed: `[${refs.bot.author}]${refs.links.source})`,
	docsEmbed: `[View Documentation]${refs.links.docs})`,
	donateEmbed: `[Help support ${refs.bot.name}'s development!]${refs.links.donate})`,
	inviteEmbed: `[Invite ${refs.bot.name} to a Server!]${refs.links.invite})`,
	sourceEmbed: `[View Source Code]${refs.links.source})`,
	supportEmbed: `[Join Support Server]${refs.links.support})`,
	templateEmbed: `[Discord Bot TypeScript Template]${refs.links.template})`,
	voteEmbed: `[Vote for ${refs.bot.name}!]${refs.links.vote})`,
	pathbuilderEmbed: `[Pathbuilder 2E](https://pathbuilder2e.com)`,
	wgEmbed: `[Wanderer's Guide](https://wanderersguide.app)`,
};
