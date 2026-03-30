export const minionStrings = {
	notFound: `Yip! I couldn't find that minion.`,
	assign: {
		success: (p: { minionName: string; characterName: string }) =>
			`Yip! I assigned the minion ${p.minionName} to ${p.characterName}.`,
		copied: (p: { minionName: string; characterName: string }) =>
			`Yip! I copied the minion ${p.minionName} to ${p.characterName}.`,
		unassignSuccess: (p: { minionName: string }) =>
			`Yip! I unassigned the minion ${p.minionName}. It can now be assigned to any character.`,
		alreadyUnassigned: (p: { minionName: string }) =>
			`Yip! ${p.minionName} is already unassigned.`,
		targetNotFound: `Yip! I couldn't find that character.`,
		alreadyExists: (p: { minionName: string; characterName: string }) =>
			`Yip! ${p.characterName} already has a minion named ${p.minionName}!`,
	},
};
