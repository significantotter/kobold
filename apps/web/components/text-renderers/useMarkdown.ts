import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

const markdownItDiscordPlugin = (md: MarkdownIt) => {
	// transform <a> tags to be <discord-link> tags
	md.renderer.rules.link_open = (tokens: Token[], idx: number) => {
		const token = tokens[idx];
		const href = token.attrGet('href');
		if (href) {
			token.tag = 'discord-link';
			token.attrSet('href', href);
		}
		return '<discord-link href="' + href + '" target="_blank">';
	};
	md.renderer.rules.link_close = () => {
		return '</discord-link>';
	};
};

const markdownRaw = new MarkdownIt().use(markdownItDiscordPlugin);

export const useMarkdown = (text: string) => {
	return markdownRaw.render(text);
};
