import { msg } from '../../lib/strings/string-types.js';

export const rollMacroStrings = {
	doesntEvaluateError: 'Yip! That macro causes an error when I try to evaluate it.',
	emptyValueError: "Yip! You can't use an empty value!",
	notFound: "Yip! I couldn't find a modifier with that name.",
	requiresActiveCharacter: 'Yip! You need to have an active character to use roll macros.',

	create: {
		created: msg<{ macroName: string; characterName: string }>(
			({ macroName, characterName }) =>
				`Yip! I created the roll macro ${macroName} for ${characterName}.`
		),
		alreadyExists: msg<{ macroName: string; characterName: string }>(
			({ macroName, characterName }) =>
				`Yip! A roll macro named ${macroName} already exists for ${characterName}.`
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
