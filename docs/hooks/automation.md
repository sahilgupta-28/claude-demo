# Automated Testing Workflow & Hooks

## Core Rule

**No code is considered complete unless all tests pass.**

After every code change — feature, bug fix, or refactor — the full test suite must run and be green before the task is marked done.

---

## Automated Test Cycle

Every time Claude writes or modifies code, this loop runs without being prompted:

```
Write / modify code
       ↓
Run: npm test
       ↓
  All pass? ──YES──→ Done ✓
       │
      NO
       ↓
Read the failure output carefully
       ↓
Identify root cause (logic bug, wrong mock, missing case, wrong assertion)
       ↓
Fix the code (or the test if it was genuinely wrong)
       ↓
Run: npm test  ← repeat until green
```

---

## Rules

- Never stop at a failing test — always complete the fix cycle.
- Fix the **root cause**. Never delete or comment out a failing test to make the suite pass.
- If a test assertion is genuinely wrong (e.g. the expected value changed intentionally), fix the test **and explain why** it changed.
- Do not mark a task complete or start a new task while any test is red.

---

## Hook Trigger Table

| Event | Action |
|-------|--------|
| New file created in `src/modules/` | Run `npm test` |
| Any `.service.js` file modified | Run `npm test` |
| Any `.controller.js` file modified | Run `npm test` |
| Any `.repository.js` file modified | Run `npm test` |
| Any `.middleware.js` file modified | Run `npm test` |
| Any file in `src/shared/` modified | Run `npm test` |
| Bug fix applied | Run `npm test` |
| Refactor completed | Run `npm test` |

---

## Hook Configuration

Add to `.claude/settings.json` to make Claude Code automatically run the test suite after every write or edit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cd '/home/user/Mern/Demo 07-04-2026/two' && npm test --silent 2>&1 | tail -20"
          }
        ]
      }
    ]
  }
}
```

This surfaces test failures inline immediately after each file change.

---

## Failure Analysis Protocol

When a test fails, diagnose in this order before making any change:

1. **Read the full error** — note the test name, file path, line number, and error message.
2. **Identify the layer** — service logic? controller wiring? mock setup? wrong assertion?
3. **Blame the most recent change** — the failure is almost always caused by the last edit.
4. **Make a targeted fix** — change only what is needed; do not refactor surrounding code during a fix.
5. **Re-run immediately** — confirm the specific failure is resolved, then check for regressions.

### Example Diagnosis

```
FAIL src/modules/auth/__tests__/auth.service.test.js
● login › throws UnauthorizedError when account is disabled

  Expected: UnauthorizedError
  Received: no error thrown

Diagnosis: The isActive guard was removed from login() during a refactor.
Fix:       Restore: if (!user.isActive) throw new UnauthorizedError('Account is disabled')
Re-run:    npm test → confirm green.
```

---

## Swagger Sync Hook

When a route or validator is changed, the `@swagger` annotation on that route **must be updated in the same edit**. This is a co-located hook, not a separate step.

| Trigger | Required annotation update |
|---------|---------------------------|
| New route added | Add `@swagger` block above the route |
| Request field added/removed | Update `requestBody` schema |
| Response shape changed | Update the matching `responses` entry |
| New status code possible | Add it to `responses` |
| Auth requirement changed | Add or remove `security` block |
| Joi validator schema changed | Mirror the change in the annotation |

See [Swagger Documentation](../documentation/swagger.md) for annotation format.

---

## Related Docs

- [Testing Strategy](../testing/strategy.md)
- [Swagger Documentation](../documentation/swagger.md)
