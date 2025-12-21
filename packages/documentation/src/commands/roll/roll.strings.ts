import { msg } from '../../lib/strings/string-types.js';

// Roll secret choices - reused across multiple commands
export const RollSecretChoices = {
	public: 'public',
	secret: 'secret',
	secretAndNotify: 'secret-and-notify',
	sendToGm: 'send-to-gm',
} as const;

export const rollStrings = {
	noActiveCharacter: "Yip! You don't have any active characters!",
	secretRollNotification: "Yip! I'm rolling in secret!",
	rolledDice: msg<{ diceType: string }>(({ diceType }) => `rolled ${diceType}`),
	damageTaken: msg<{ creatureName: string; damage: string }>(
		({ creatureName, damage }) => `${creatureName} took ${damage} damage!`
	),
	targetNotFound: msg<{ targetName: string }>(
		({ targetName }) => `Yip! I couldn't find a target named "${targetName}"`
	),

	dice: {
		rolledDice: 'rolled some dice!',
	},

	perception: {
		rolledPerception: 'rolled Perception!',
	},

	attack: {
		rollDescription: msg<{ attackName: string }>(
			({ attackName }) => `attacked with their ${attackName}!`
		),
		toHit: 'To Hit',
		damage: 'Damage',
	},

	action: {
		rollDescription: msg<{ actionName: string }>(({ actionName }) => `used ${actionName}!`),
	},
};

export const rollOptionChoices = {
	rollSecret: RollSecretChoices,
};
