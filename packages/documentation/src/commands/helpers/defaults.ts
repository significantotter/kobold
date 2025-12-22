import { InteractionContextType } from 'discord-api-types/v10';

export const anyUsageContext = [
	InteractionContextType.Guild,
	InteractionContextType.BotDM,
	InteractionContextType.PrivateChannel,
] as const satisfies InteractionContextType[];
