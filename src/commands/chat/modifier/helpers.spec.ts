import {
	replaceAll,
	NamedThing,
	ignoreOnConflict,
	renameOnConflict,
	overwriteOnConflict,
} from './../../../utils/import-utils.js';

describe('Modifier Helpers', () => {
	describe('replaceAll', () => {
		test('an empty array is replaced with values', () => {
			const existing: NamedThing[] = [];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			expect(replaceAll(existing, imported)).toStrictEqual(imported);
		});
		test('values are replaced with an empty array', () => {
			const existing: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const imported: NamedThing[] = [];
			expect(replaceAll(existing, imported)).toStrictEqual(imported);
		});
		test('values are replaced with values', () => {
			const existing: NamedThing[] = [{ name: 'c' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			expect(replaceAll(existing, imported)).toStrictEqual(imported);
		});
	});
	describe('ignoreOnConflict', () => {
		test('Without conflict, appends new values', () => {
			const existing: NamedThing[] = [{ name: 'c' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
			expect(ignoreOnConflict(existing, imported)).toStrictEqual(result);
		});
		test('on a conflicting value, keeps the current named item', () => {
			const existing: NamedThing[] = [{ name: 'c' }, { name: 'a', foo: 'bar' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [{ name: 'c' }, { name: 'a', foo: 'bar' }, { name: 'b' }];
			expect(ignoreOnConflict(existing, imported)).toStrictEqual(result);
		});
	});
	describe('renameOnConflict', () => {
		test('Without conflict, appends new values', () => {
			const existing: NamedThing[] = [{ name: 'c' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
			expect(renameOnConflict(existing, imported)).toStrictEqual(result);
		});
		test('on a conflicting value, renames the imported named item', () => {
			const existing: NamedThing[] = [{ name: 'c' }, { name: 'a', foo: 'bar' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [
				{ name: 'c' },
				{ name: 'a', foo: 'bar' },
				{ name: 'a-1' },
				{ name: 'b' },
			];
			expect(renameOnConflict(existing, imported)).toStrictEqual(result);
		});
		test('on an already named conflict, increments the name', () => {
			const existing: NamedThing[] = [{ name: 'c' }, { name: 'a', foo: 'bar' }];
			const imported: NamedThing[] = [
				{ name: 'a', val: 1 },
				{ name: 'a', val: 3 },
				{ name: 'b' },
			];
			const result: NamedThing[] = [
				{ name: 'c' },
				{ name: 'a', foo: 'bar' },
				{ name: 'a-1', val: 1 },
				{ name: 'a-2', val: 3 },
				{ name: 'b' },
			];
			expect(renameOnConflict(existing, imported)).toStrictEqual(result);
		});
	});
	describe('overwriteOnConflict', () => {
		test('Without conflict, appends new values', () => {
			const existing: NamedThing[] = [{ name: 'c' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
			expect(overwriteOnConflict(existing, imported)).toStrictEqual(result);
		});
		test('on a conflicting value, keeps the imported named item', () => {
			const existing: NamedThing[] = [{ name: 'c' }, { name: 'a', foo: 'bar' }];
			const imported: NamedThing[] = [{ name: 'a' }, { name: 'b' }];
			const result: NamedThing[] = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
			expect(overwriteOnConflict(existing, imported)).toStrictEqual(result);
		});
	});
});
