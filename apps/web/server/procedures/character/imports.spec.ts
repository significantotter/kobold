import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { convertWgV4ExportToSheet, type WgV4Export } from '@kobold/sheet';
import { upsertTwoHandRollMacros } from './imports.js';

const skitterFixtureUrl = new URL(
	'../../../../end-to-end-tests/tests/fixtures/data/skitter.wg.sheet.json',
	import.meta.url
);

function loadSkitterSheet() {
	const skitterFixture = JSON.parse(readFileSync(skitterFixtureUrl, 'utf8')) as WgV4Export;
	return convertWgV4ExportToSheet(skitterFixture);
}

describe('WG character imports', () => {
	it('creates two-hand roll macros from the imported Skitter sheet', async () => {
		const sheet = loadSkitterSheet();
		const fangwire = sheet.attacks.find(attack => attack.name === 'Fangwire');
		const rangedRapierPistol = sheet.attacks.find(
			attack => attack.name === 'Rapier Pistol (Ranged)'
		);
		const reinforcedStock = sheet.attacks.find(
			attack => attack.name === 'Reinforced Stock'
		);
		const create = vi.fn().mockResolvedValue(undefined);
		const kobold = {
			rollMacro: {
				readMany: vi.fn().mockResolvedValue([]),
				create,
				update: vi.fn().mockResolvedValue(undefined),
			},
		};

		expect(fangwire?.traits).toEqual(expect.arrayContaining(['Deadly d8']));
		expect(rangedRapierPistol?.traits).toEqual(expect.arrayContaining(['Fatal d8']));
		expect(reinforcedStock?.traits).toEqual(expect.arrayContaining(['Two-Hand d8']));

		await upsertTwoHandRollMacros({
			kobold: kobold as never,
			userId: 'user-1',
			sheetRecordId: 123,
			sheet,
		});

		expect(kobold.rollMacro.readMany).toHaveBeenCalledWith({ sheetRecordId: 123 });
		expect(create).toHaveBeenCalledWith({
			userId: 'user-1',
			sheetRecordId: 123,
			name: 'reinforced-stock-two-hand',
			macro: '1d8+6',
		});
		expect(kobold.rollMacro.update).not.toHaveBeenCalled();
	});

	it('updates matching imported two-hand macros without touching custom macros', async () => {
		const sheet = loadSkitterSheet();
		const create = vi.fn().mockResolvedValue(undefined);
		const update = vi.fn().mockResolvedValue(undefined);
		const kobold = {
			rollMacro: {
				readMany: vi.fn().mockResolvedValue([
					{ id: 10, name: 'reinforced-stock-two-hand', macro: '1d6+6' },
					{ id: 11, name: 'custom-stance', macro: '2d6+3' },
				]),
				create,
				update,
			},
		};

		await upsertTwoHandRollMacros({
			kobold: kobold as never,
			userId: 'user-1',
			sheetRecordId: 123,
			sheet,
		});

		expect(update).toHaveBeenCalledWith({ id: 10 }, { macro: '1d8+6' });
		expect(create).not.toHaveBeenCalled();
	});
});
