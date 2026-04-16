# KEYRA — Supabase test suite

## RLS isolation tests

```bash
# Option A: apply migrations + run tests locally via plain psql
supabase db reset --local
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" \
     -v ON_ERROR_STOP=1 \
     -f supabase/tests/rls_isolation.test.sql

# Option B: remote (staging only — NEVER in prod)
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.test.sql
```

The test file wraps all assertions in a single transaction that is rolled back
at the end, so it is safe to run repeatedly against an ephemeral DB. It still
touches `auth.users`, so prefer a local/shadow database over production.

### What is verified

| Block | Check | Expected |
|-------|-------|----------|
| A-1..A-3 | user A sees only their org's customers/services/professionals | 1 row each |
| A-4 | user A cannot SELECT org B row by id | 0 rows |
| A-5 | `organizations` list filtered by membership | 1 row |
| A-6 | cross-tenant INSERT blocked by WITH CHECK | exception |
| A-7 | cross-tenant UPDATE affects 0 rows | 0 rows |
| A-8 | cross-tenant DELETE affects 0 rows | 0 rows |
| B-1/B-2 | mirror checks for user B | same |
| C-1/C-2 | user with no `org_id` claim sees nothing | 0 rows |
