import { msg } from '../../lib/strings/string-types.js';

export const rollMacroStrings = {
	doesntEvaluateError: 'Yip! That macro causes an error when I try to evaluate it.',
	emptyValueError: "Yip! You can't use an empty value!",
	notFound: "Yip! I couldn't find a roll macro with that name.",
	requiresActiveCharacter: 'Yip! You need to have an active character to use roll macros.',

	create: {
		created: msg<{ macroName: string; characterName: string }>(
			({ macroName, characterName }) =>
				`Yip! I created the roll macro ${macroName} for ${characterName}.`
		),
		createdUserWide: msg<{ macroName: string }>(
			({ macroName }) => `Yip! I created the roll macro ${macroName} for all your characters.`
		),
		alreadyExists: msg<{ macroName: string; characterName: string }>(
			({ macroName, characterName }) =>
				`Yip! A roll macro named ${macroName} already exists for ${characterName}.`
		),
		alreadyExistsUserWide: msg<{ macroName: string }>(
			({ macroName }) => `Yip! A user-wide roll macro named ${macroName} already exists.`
		),
	},

	assign: {
		success: msg<{ macroName: string; targetName: string }>(
			({ macroName, targetName }) =>
				`Yip! I assigned the roll macro ${macroName} to ${targetName}.`
		),
		successUserWide: msg<{ macroName: string }>(
			({ macroName }) =>
				`Yip! I made the roll macro ${macroName} available to all your characters.`
		),
		copied: msg<{ macroName: string; targetName: string }>(
			({ macroName, targetName }) =>
				`Yip! I copied the roll macro ${macroName} to ${targetName}.`
		),
		copiedUserWide: msg<{ macroName: string }>(
			({ macroName }) => `Yip! I copied the roll macro ${macroName} for all your characters.`
		),
		alreadyExists: msg<{ macroName: string; targetName: string }>(
			({ macroName, targetName }) =>
				`Yip! A roll macro named ${macroName} already exists for ${targetName}.`
		),
		alreadyExistsUserWide: msg<{ macroName: string }>(
			({ macroName }) => `Yip! A user-wide roll macro named ${macroName} already exists.`
		),
	},

	set: {
		successEmbedTitle: msg<{
			characterName: string;
			macroName: string;
			newMacroValue: string;
		}>(
			({ characterName, macroName, newMacroValue }) =>
				`Yip! ${characterName} had their roll macro ${macroName} set to '${newMacroValue}'.`
		),
	},

	remove: {
		removeConfirmationText: msg<{ macroName: string }>(
			({ macroName }) => `Are you sure you want to remove the roll macro ${macroName}?`
		),
		removeButton: 'REMOVE',
		cancelButton: 'CANCEL',
		expired: 'Yip! Roll Macro removal request expired.',
		cancel: 'Yip! Canceled the request to remove the roll macro!',
		success: msg<{ macroName: string }>(
			({ macroName }) => `Yip! I removed the roll macro ${macroName}.`
		),
	},
};
