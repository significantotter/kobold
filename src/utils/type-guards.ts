export function filterNotNullOrUndefined<T>(
	option: T
): option is Exclude<Exclude<T, null>, undefined> {
	return option != null;
}
