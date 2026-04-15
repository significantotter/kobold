# @kobold/end-to-end-tests

Playwright end-to-end tests for the Kobold Discord bot. These tests automate the Discord web client to send slash commands against a live dev bot and validate the response messages.

## Prerequisites

- Node.js >= 24.12.0
- A **dedicated Discord test account** (do NOT use your main account — automated login may trigger security prompts)
- A test Discord guild (server) with the dev bot invited
- A text channel in that guild designated for test commands

## Setup

1. **Install workspace dependencies** (from monorepo root):

    ```sh
    pnpm install
    ```

2. **Install Playwright browsers**:

    ```sh
    pnpm --filter @kobold/end-to-end-tests install-browsers
    ```

3. **Configure environment**: Copy `.env.example` to `.env` and fill in the values:

    ```sh
    cp apps/end-to-end-tests/.env.example apps/end-to-end-tests/.env
    ```

    | Variable                  | Description                                             |
    | ------------------------- | ------------------------------------------------------- |
    | `DISCORD_EMAIL`           | Email for the dedicated test Discord account            |
    | `DISCORD_PASSWORD`        | Password for the test account                           |
    | `DISCORD_TEST_GUILD_ID`   | Snowflake ID of the test guild                          |
    | `DISCORD_TEST_CHANNEL_ID` | Snowflake ID of the text channel to run commands in     |
    | `BOT_DISPLAY_NAME`        | The bot's display name in the guild (default: `Kobold`) |

4. **Ensure the dev bot is running** (from monorepo root):

    ```sh
    pnpm --filter @kobold/client dev
    ```

## Running Tests

### First run (use headed mode)

On first run, use headed mode so you can handle any captcha or 2FA prompt that Discord shows during login:

```sh
pnpm --filter @kobold/end-to-end-tests test:headed
```

After a successful login, auth state is saved to `auth/discord-auth.json` and reused on subsequent runs.

### Normal run (headless)

```sh
pnpm --filter @kobold/end-to-end-tests test
```

### Debug mode

```sh
pnpm --filter @kobold/end-to-end-tests test:debug
```

### Record new interactions

```sh
pnpm --filter @kobold/end-to-end-tests codegen
```

## How It Works

1. **Auth setup** (`tests/auth.setup.ts`): Logs into Discord via the web client and saves browser `storageState` to `auth/discord-auth.json`. On subsequent runs, the saved state is reused if still valid.

2. **Discord fixture** (`tests/fixtures/discord.fixture.ts`): Provides a `discordChannel` page pre-navigated to the test channel, plus helpers for sending slash commands and asserting on bot embeds.

3. **Tests** (`tests/**/*.spec.ts`): Use the fixture to send commands and validate responses.

## Notes

- **Auth state caching**: The `auth/` directory is gitignored. Each developer (and CI runner) needs to authenticate once. If the auth state expires, delete `auth/discord-auth.json` and re-run in headed mode.
- **Discord selectors**: Discord uses obfuscated class names that may change between deployments. If tests break after a Discord update, the selectors in `discord.fixture.ts` may need updating.
- **Not in `turbo test`**: These tests require a running bot and Discord access. They're intentionally excluded from the default `turbo run test` pipeline and must be run explicitly.
