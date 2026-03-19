export const minionStrings = {
	notFound: `Yip! I couldn't find that minion.`,
	assign: {
		success: (p: { minionName: string; characterName: string }) =>
			`Yip! I assigned the minion ${p.minionName} to ${p.characterName}.`,
		targetNotFound: `Yip! I couldn't find that character.`,
	},
};
