const tagsInputRegex = /[\w\d]+(, ?([\w\d]+))*,? */;
const replaceTargetTagsRegex = /["'`]/g;

export function tagsInputValid(tagsInput: string) {
	// validate the target tags
	const filteredInput = tagsInput.replaceAll(replaceTargetTagsRegex, '');
	return filteredInput && tagsInputRegex.test(filteredInput);
}
export function parseTagsFromInput(tagsInput: string) {
	// parse the target tags
	const filteredInput = tagsInput.replaceAll(replaceTargetTagsRegex, '');
	return filteredInput.split(/, */).filter(tag => tag !== '');
}
