export function filterNotNullOrUndefined<T>(
	option: T
): option is Exclude<Exclude<T, null>, undefined> {
	return option != null;
}

export function literalKeys<T extends Object>(obj: T) {
	return Object.keys(obj) as Array<keyof T>;
}
