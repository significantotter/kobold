import { ChatInputCommandInteraction } from 'discord.js';

type EmojiOptions =
	| 'oneAction'
	| 'twoActions'
	| 'threeActions'
	| 'variableActions'
	| 'reaction'
	| 'freeAction';

const emojiMap: { [k: string]: string } = {
	oneAction: '1095183665404837989',
	twoActions: '1095183667854315583',
	threeActions: '1095183667409735770',
	reaction: '1095183666751221760',
	freeAction: '1095183664721178745',
};

export function getEmoji(intr?: ChatInputCommandInteraction, emoji?: EmojiOptions | string | null) {
	if (!intr) return emoji ?? '';
	if (!emoji) return ''; //if we don't have an emoji, return nothing
	const emojiCache = intr?.client?.guilds?.cache?.get?.('1095180951522377808')?.emojis?.cache;
	if (!emojiCache) return '';
	if (emoji === 'variableActions') {
		return (
			(emojiCache.get(emojiMap['oneAction']) ?? '').toString() +
			' to ' +
			(emojiCache.get(emojiMap['threeActions']) ?? '').toString()
		);
	} else if (emojiMap[emoji]) return (emojiCache.get(emojiMap[emoji]) ?? '').toString();
	else {
		return '';
	}
}
