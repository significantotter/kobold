import { BaseInteraction, CacheType, ChatInputCommandInteraction } from 'discord.js';
import { ActionCostEnum, isActionCostEnum } from '@kobold/db';

type EmojiOptions = Exclude<ActionCostEnum, ActionCostEnum.variableActions | ActionCostEnum.none>;

const emojiMap: Record<EmojiOptions, string> = {
	oneAction: '1095183665404837989',
	twoActions: '1095183667854315583',
	threeActions: '1095183667409735770',
	reaction: '1095183666751221760',
	freeAction: '1095183664721178745',
};

export function getEmoji(intr?: BaseInteraction<CacheType>, emoji?: EmojiOptions | string | null) {
	if (!intr) return emoji ?? '';
	if (!emoji) return ''; //if we don't have an emoji, return nothing
	const emojiCache = intr?.client?.guilds?.cache?.get?.('1095180951522377808')?.emojis?.cache;
	if (!emojiCache) return '';

	if (isActionCostEnum(emoji) && emoji !== ActionCostEnum.none) {
		if (emoji === ActionCostEnum.variableActions) {
			return (
				(emojiCache.get(emojiMap[ActionCostEnum.oneAction]) ?? '').toString() +
				' to ' +
				(emojiCache.get(emojiMap[ActionCostEnum.threeActions]) ?? '').toString()
			);
		} else {
			return (emojiCache.get(emojiMap[emoji]) ?? '').toString();
		}
	} else {
		return '';
	}
}
