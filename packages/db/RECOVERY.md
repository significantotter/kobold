# PostgreSQL disconnect recovery

Use `getDialect` or `getDialectWithPool` for application connections. Both install
idle-pool and checked-out-client error handlers. Queries still reject on failure;
operations are never replayed. Kysely releases failed connections normally, with
fatal PostgreSQL errors forcing disposal before the socket-close event arrives.
Ordinary SQL errors do not cause a healthy connection to be discarded.

The optional `onConnectionEvent` callback receives connection state, sanitized
error fields, pool counts, and acquisition duration. It must not release clients.
Callback throws/rejections are contained and fall back to console reporting.
The bot and web server log acquisition failures and acquisitions taking at least
one second. Query execution timing excludes acquisition time. Autocomplete
failure logs identify processing versus response failures; the separate Nethys
Postgres.js driver is not instrumented by these factories.

Run deterministic pool and child-process regression tests:

```sh
pnpm --filter @kobold/db exec vitest run src/db.dialect.spec.ts
```

Run real disconnect tests with an explicitly supplied **disposable** PostgreSQL
database. The test terminates only its own connections, creates a uniquely named
table, verifies transaction rollback, and drops the table afterward. The test is
skipped when the variable is absent; it does not load an application database URL.

```sh
KOBOLD_RECOVERY_TEST_URL=postgres://localhost/disposable_test \
  pnpm --filter @kobold/db exec vitest run src/db.dialect.integration.spec.ts
```

Before production rollout, repeat disconnect testing in staging and record the
deployed commit. The October 1 log's later failure burst is not established to
share the original disconnect's cause; use the additional diagnostics to assess
future incidents independently.
