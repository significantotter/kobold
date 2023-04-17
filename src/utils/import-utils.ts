import _ from 'lodash';

export interface NamedThing {
	name?: string;
	[key: string]: any;
}

export function replaceAll<T extends NamedThing>(
	currentList: Array<T>,
	importedList: Array<T>
): Array<T> {
	return importedList;
}

export function ignoreOnConflict<T extends NamedThing>(
	currentList: Array<T>,
	importedList: Array<T>
): Array<T> {
	const finalList = _.clone(currentList);
	for (const item of importedList) {
		let finalItem = item;
		let sameItemIndex = _.findIndex(
			finalList,
			targetCurrentItem =>
				targetCurrentItem.name.trim().toLocaleLowerCase() ===
				finalItem.name.trim().toLocaleLowerCase()
		);
		if (sameItemIndex === -1) {
			finalList.push(item);
		}
	}
	return finalList;
}

export function renameOnConflict<T extends NamedThing>(
	currentList: Array<T>,
	importedList: Array<T>
): Array<T> {
	const finalList = _.clone(currentList);
	for (const item of importedList) {
		let finalItem = item;
		let sameItemIndex = _.findIndex(
			finalList,
			targetCurrentItem =>
				targetCurrentItem.name.trim().toLocaleLowerCase() ===
				finalItem.name.trim().toLocaleLowerCase()
		);
		//increment the counter on the name each time we try and fail to insert it
		let i = 1;
		while (sameItemIndex !== -1) {
			finalItem = {
				...finalItem,
				name: item.name + `-${i++}`,
			};
			sameItemIndex = _.findIndex(
				finalList,
				targetCurrentItem =>
					targetCurrentItem.name.trim().toLocaleLowerCase() ===
					finalItem.name.trim().toLocaleLowerCase()
			);
		}
		finalList.push(finalItem);
	}
	return finalList;
}

export function overwriteOnConflict<T extends NamedThing>(
	currentList: Array<T>,
	importedList: Array<T>
): Array<T> {
	const finalList = _.clone(currentList);
	for (const modifier of importedList) {
		let sameItemIndex = _.findIndex(
			finalList,
			targetCurrentItem =>
				targetCurrentItem.name.trim().toLocaleLowerCase() ===
				modifier.name.trim().toLocaleLowerCase()
		);
		if (sameItemIndex === -1) {
			finalList.push(modifier);
		} else {
			finalList[sameItemIndex] = modifier;
		}
	}
	return finalList;
}
