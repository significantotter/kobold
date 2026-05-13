import {
	test,
	expect,
	sendSlashCommand,
	sendSlashCommandWithArgs,
	waitForBotEmbed,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';
import {
	E2E_CHARACTER_NAME,
	characterCreateForValue,
	cleanupConditionsByName,
	cleanupE2EInitiatives,
	cleanupModifiersByName,
	cleanupRollMacrosByName,
	getE2ECharacter,
	getFullSheetRecord,
	signed,
} from '../helpers/adjusted-sheet.js';

function compact(text: string | null | undefined) {
	return (text ?? '').replace(/\s+/g, ' ').trim();
}

function renderedNumber(value: number | null | undefined) {
	const normalized = value ?? 0;
	return normalized < 0 ? `(${normalized})` : String(normalized);
}

async function expectNextEmbedText(page: Parameters<typeof waitForBotEmbed>[0]) {
	const embed = await waitForBotEmbed(page);
	const text = compact(await embed.textContent());
	expect(text.length).toBeGreaterThan(0);
	return text;
}

async function expectNextMessageText(page: Parameters<typeof waitForBotMessage>[0]) {
	const message = await waitForBotMessage(page);
	const text = compact(await message.textContent());
	expect(text.length).toBeGreaterThan(0);
	return text;
}

async function expectCommandMessageCreated(page: Parameters<typeof waitForBotMessage>[0]) {
	const text = (await expectNextMessageText(page)).toLowerCase();
	expect(text).toMatch(/created|applied/);
}

async function runInitiativeJoinSmoke(
	discordChannel: Parameters<typeof sendSlashCommand>[0],
	args: { name: string; value: string; autocomplete?: boolean }[],
	assertShow?: (text: string) => void
) {
	await cleanupE2EInitiatives();
	await sendSlashCommand(discordChannel, '/init start');
	await expectNextEmbedText(discordChannel);

	if (args.length > 0) {
		await sendSlashCommandWithArgs(discordChannel, '/init join', args);
	} else {
		await sendSlashCommand(discordChannel, '/init join');
	}
	await expectNextMessageText(discordChannel);

	await sendSlashCommand(discordChannel, '/init show');
	const showText = await expectNextEmbedText(discordChannel);
	expect(showText).toContain(E2E_CHARACTER_NAME);
	assertShow?.(showText);
	await cleanupE2EInitiatives();
}

test.describe('roll engine smoke pack', () => {
	test('manual smoke commands resolve attributes, macros, modifiers, conditions, and initiative', async ({
		discordChannel,
	}) => {
		test.setTimeout(180_000);

		const suffix = String(Date.now()).slice(-8);
		const macroNames = {
			flat: `e2esmokeflat${suffix}`,
			toHit: `e2esmoketohit${suffix}`,
			nested: `e2esmokenest${suffix}`,
			damage: `e2esmokedmg${suffix}`,
		};
		const modifierNames = {
			skill: `e2e smoke skill ${suffix}`.toLowerCase(),
			strength: `e2e smoke str ${suffix}`.toLowerCase(),
			severity: `e2e smoke sev ${suffix}`.toLowerCase(),
			sheetOnly: `e2e smoke sheet ${suffix}`.toLowerCase(),
		};
		const conditionName = `e2econd${suffix}`.toLowerCase();
		const character = await getE2ECharacter();
		const initial = await getFullSheetRecord(character.sheetRecordId);
		const sheet = initial.adjustedSheet;
		const {
			strength,
			dexterity,
			constitution,
			intelligence,
			wisdom,
			charisma,
		} = sheet.intProperties;
		const perceptionBonus = sheet.stats.perception.bonus ?? 0;
		const stealthBonus = sheet.stats.stealth.bonus ?? 0;
		const fortitudeBonus = sheet.stats.fortitude.bonus ?? 0;
		const willBonus = sheet.stats.will.bonus ?? 0;
		const diplomacyBonus = sheet.stats.diplomacy.bonus ?? 0;
		const level = sheet.staticInfo.level ?? 0;
		const trained = level + 2;

		await cleanupE2EInitiatives();
		await cleanupRollMacrosByName(...Object.values(macroNames));
		await cleanupModifiersByName(...Object.values(modifierNames));
		await cleanupConditionsByName(conditionName);

		try {
			// Baseline pure dice paths, including hidden routing modes.
			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20' },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain('1d20');

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '2d6+5' },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain('2d6+5');

				await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
					{ name: 'dice', value: '1d20' },
					{ name: 'note', value: 'pure-dice-smoke' },
				]);
				const notedDiceText = await expectNextEmbedText(discordChannel);
				expect(notedDiceText).toContain('pure-dice-smoke');
				expect(notedDiceText.toLowerCase()).not.toContain('note:');

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20' },
				{ name: 'secret', value: 'secret' },
			]);
			await expectNextMessageText(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20' },
				{ name: 'secret', value: 'send-to-gm' },
			]);
			await expectNextMessageText(discordChannel);

			// Direct adjusted-sheet attribute selectors.
			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{
					name: 'dice',
					value: '[str] + [dex] + [con] + [int] + [wis] + [cha]',
				},
			]);
			const abilityText = await expectNextEmbedText(discordChannel);
			expect(abilityText).toContain(
				[
					renderedNumber(strength),
					renderedNumber(dexterity),
					renderedNumber(constitution),
					renderedNumber(intelligence),
					renderedNumber(wisdom),
					renderedNumber(charisma),
				].join(' + ')
			);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[perceptionBonus]' },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain(signed(perceptionBonus));

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[dex]+[trained]' },
			]);
			const dexTrainedText = await expectNextEmbedText(discordChannel);
			expect(dexTrainedText).toContain(signed(dexterity));
			expect(dexTrainedText).toContain(signed(trained));

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[level]+[expert]' },
			]);
			const levelExpertText = await expectNextEmbedText(discordChannel);
			expect(levelExpertText).toContain(signed(level));
			expect(levelExpertText).toContain(signed(level + 4));

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '2d6+[str]' },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain(signed(strength));

			// Structured rolls and freeform modifiers on structured commands.
			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			const stealthText = await expectNextEmbedText(discordChannel);
			expect(stealthText.toLowerCase()).toContain('stealth');
			expect(stealthText).toContain(signed(stealthBonus));

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'athletics', autocomplete: true },
				{ name: 'modifier', value: '+2' },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain('(+2)');

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'diplomacy', autocomplete: true },
				{ name: 'modifier', value: '+[str]-[cha]' },
			]);
			const diplomacyText = await expectNextEmbedText(discordChannel);
			expect(diplomacyText).toContain(signed(diplomacyBonus));
			expect(diplomacyText).toContain(`+${strength}-${renderedNumber(charisma)}`);

			await sendSlashCommandWithArgs(discordChannel, '/roll save', [
				{ name: 'save', value: 'Fortitude', autocomplete: true },
			]);
			const fortitudeText = await expectNextEmbedText(discordChannel);
			expect(fortitudeText.toLowerCase()).toContain('fortitude');
			expect(fortitudeText).toContain(signed(fortitudeBonus));

			await sendSlashCommandWithArgs(discordChannel, '/roll save', [
				{ name: 'save', value: 'Reflex', autocomplete: true },
				{ name: 'modifier', value: '+[dex]-[con]' },
			]);
			const reflexText = await expectNextEmbedText(discordChannel);
			expect(reflexText).toContain(`+${dexterity}-${renderedNumber(constitution)}`);

			await sendSlashCommand(discordChannel, '/roll perception');
			expect(await expectNextEmbedText(discordChannel)).toContain(signed(perceptionBonus));

			await sendSlashCommandWithArgs(discordChannel, '/roll perception', [
				{ name: 'modifier', value: '+[wis]-[int]' },
			]);
			const perceptionText = await expectNextEmbedText(discordChannel);
			expect(perceptionText).toContain(signed(perceptionBonus));
			expect(perceptionText).toContain(`+${wisdom}-${renderedNumber(intelligence)}`);

			// Roll macro setup and usage.
			await sendSlashCommandWithArgs(discordChannel, '/roll-macro create', [
				{ name: 'name', value: macroNames.flat },
				{ name: 'value', value: '2' },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll-macro create', [
				{ name: 'name', value: macroNames.toHit },
				{ name: 'value', value: '[trained]+[str]' },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll-macro create', [
				{ name: 'name', value: macroNames.nested },
				{ name: 'value', value: `[${macroNames.toHit}]+1` },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll-macro create', [
				{ name: 'name', value: macroNames.damage },
				{ name: 'value', value: '2d6+[str]' },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: `1d20+[${macroNames.flat}]` },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain('+2');

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: `1d20+[${macroNames.toHit}]` },
			]);
			const toHitText = await expectNextEmbedText(discordChannel);
			expect(toHitText).toContain(signed(trained));
			expect(toHitText).toContain(signed(strength));

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: `1d20+[${macroNames.nested}]` },
			]);
			const nestedText = await expectNextEmbedText(discordChannel);
			expect(nestedText).toContain(signed(trained));
			expect(nestedText).toContain(signed(strength));
			expect(nestedText).toContain('+1');

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: `[${macroNames.damage}]` },
			]);
			const damageText = await expectNextEmbedText(discordChannel);
			expect(damageText).toContain('2d6');
			expect(damageText).toContain(signed(strength));

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
				{ name: 'modifier', value: `+[${macroNames.flat}]` },
			]);
			expect(await expectNextEmbedText(discordChannel)).toContain('(+2)');

			await sendSlashCommandWithArgs(discordChannel, '/roll save', [
				{ name: 'save', value: 'Will', autocomplete: true },
				{ name: 'modifier', value: `+[${macroNames.toHit}]-[str]` },
			]);
			const willMacroText = await expectNextEmbedText(discordChannel);
			expect(willMacroText).toContain(signed(willBonus));
			expect(willMacroText).toContain(signed(trained));
			expect(willMacroText).toContain(`-${renderedNumber(strength)}`);

			// Roll modifier setup and applicability.
			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierNames.skill },
				{ name: 'roll-adjustment', value: '+1' },
				{ name: 'roll-target-tags', value: 'skill' },
				{ name: 'create-for', value: characterCreateForValue(character), autocomplete: true },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierNames.strength },
				{ name: 'roll-adjustment', value: '+3' },
				{ name: 'roll-target-tags', value: 'strength' },
				{ name: 'create-for', value: characterCreateForValue(character), autocomplete: true },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierNames.severity },
				{ name: 'roll-adjustment', value: '-[severity]' },
				{ name: 'roll-target-tags', value: 'skill' },
				{ name: 'severity', value: '2' },
				{ name: 'create-for', value: characterCreateForValue(character), autocomplete: true },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/modifier create', [
				{ name: 'name', value: modifierNames.sheetOnly },
				{ name: 'sheet-values', value: 'ac +1' },
				{ name: 'create-for', value: characterCreateForValue(character), autocomplete: true },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			const modifiedSkillText = (await expectNextEmbedText(discordChannel)).toLowerCase();
			expect(modifiedSkillText).toContain(modifierNames.skill);
			expect(modifiedSkillText).toContain(modifierNames.severity);
			expect(modifiedSkillText).not.toContain(modifierNames.sheetOnly);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[str]' },
			]);
			const strengthModifiedText = (await expectNextEmbedText(discordChannel)).toLowerCase();
			expect(strengthModifiedText).toContain(modifierNames.strength);
			expect(strengthModifiedText).not.toContain(modifierNames.skill);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[dex]' },
			]);
			const dexModifiedText = (await expectNextEmbedText(discordChannel)).toLowerCase();
			expect(dexModifiedText).not.toContain(modifierNames.strength);
			expect(dexModifiedText).not.toContain(modifierNames.sheetOnly);

			// Condition roll adjustment setup and applicability.
			await sendSlashCommandWithArgs(discordChannel, '/condition apply-custom', [
				{ name: 'target-character', value: E2E_CHARACTER_NAME, autocomplete: true },
				{ name: 'name', value: conditionName },
				{ name: 'severity', value: '2' },
				{ name: 'roll-adjustment', value: '-[severity]' },
				{ name: 'roll-target-tags', value: 'skill or save' },
			]);
			await expectCommandMessageCreated(discordChannel);

			await sendSlashCommandWithArgs(discordChannel, '/roll skill', [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			expect((await expectNextEmbedText(discordChannel)).toLowerCase()).toContain(
				conditionName
			);

			await sendSlashCommandWithArgs(discordChannel, '/roll save', [
				{ name: 'save', value: 'Will', autocomplete: true },
			]);
			expect((await expectNextEmbedText(discordChannel)).toLowerCase()).toContain(
				conditionName
			);

			await sendSlashCommandWithArgs(discordChannel, '/roll dice', [
				{ name: 'dice', value: '1d20+[str]' },
			]);
			expect((await expectNextEmbedText(discordChannel)).toLowerCase()).not.toContain(
				conditionName
			);

			// Initiative join variants that use the refactored roll path.
			await runInitiativeJoinSmoke(discordChannel, []);
			await runInitiativeJoinSmoke(discordChannel, [
				{ name: 'skill', value: 'stealth', autocomplete: true },
			]);
			await runInitiativeJoinSmoke(discordChannel, [
				{ name: 'skill', value: 'stealth', autocomplete: true },
				{ name: 'dice', value: '+[str]-[cha]' },
			]);
			await runInitiativeJoinSmoke(discordChannel, [
				{ name: 'dice', value: '1d20+[dex]+1' },
			]);
			await runInitiativeJoinSmoke(
				discordChannel,
				[{ name: 'value', value: '0' }],
				showText => expect(showText).toMatch(/\b0\b/)
			);
		} finally {
			await cleanupConditionsByName(conditionName);
			await cleanupModifiersByName(...Object.values(modifierNames));
			await cleanupRollMacrosByName(...Object.values(macroNames));
			await cleanupE2EInitiatives();
		}
	});
});
