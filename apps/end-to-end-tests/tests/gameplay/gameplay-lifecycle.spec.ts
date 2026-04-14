import {
	test,
	expect,
	sendSlashCommandWithArgs,
	waitForBotMessage,
} from '../fixtures/discord.fixture.js';

const TARGET = 'E2E Test Character';

test.describe('gameplay lifecycle', () => {
	test('set HP → damage → recover', async ({ discordChannel }) => {
		// --- Set HP to a known value ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay set', [
			{ name: 'set-option', value: 'hp', autocomplete: true },
			{ name: 'set-value', value: '30' },
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		const setMsg = await waitForBotMessage(discordChannel);
		const setText = await setMsg.textContent();
		// Response: "Yip! I updated {name}'s hp from {old} to 30."
		expect(setText?.toLowerCase()).toContain('updated');
		expect(setText).toContain('30');

		// --- Apply damage ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay damage', [
			{ name: 'damage-amount', value: '10' },
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		const damageMsg = await waitForBotMessage(discordChannel);
		const damageText = await damageMsg.textContent();
		// Damage response includes the amount and the resulting HP
		expect(damageText).toContain('10');

		// --- Recover ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay recover', [
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		const recoverMsg = await waitForBotMessage(discordChannel);
		const recoverText = await recoverMsg.textContent();
		// Recovery response mentions recovery
		expect(recoverText?.toLowerCase()).toMatch(/recover/);

		// --- Restore HP to max so we don't pollute other tests ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay set', [
			{ name: 'set-option', value: 'hp', autocomplete: true },
			{ name: 'set-value', value: '999' },
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		await waitForBotMessage(discordChannel);
	});

	test('setting HP to 0 shows down message', async ({ discordChannel }) => {
		// --- Set HP to 0 ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay set', [
			{ name: 'set-option', value: 'hp', autocomplete: true },
			{ name: 'set-value', value: '0' },
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		const msg = await waitForBotMessage(discordChannel);
		const text = await msg.textContent();
		expect(text?.toLowerCase()).toContain('down');

		// --- Restore HP ---
		await sendSlashCommandWithArgs(discordChannel, '/gameplay set', [
			{ name: 'set-option', value: 'hp', autocomplete: true },
			{ name: 'set-value', value: '999' },
			{ name: 'target-character', value: TARGET, autocomplete: true },
		]);

		await waitForBotMessage(discordChannel);
	});
});
