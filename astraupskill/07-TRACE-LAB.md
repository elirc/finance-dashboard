# Trace lab: one submit, six boundaries

[Course index](README.md)

The dashboard is one page, but `handleEntrySubmit` crosses the same boundaries an API request does. Trace one edit and one failed create with [app.js](../app.js) open. Fill in the "what is true now" column yourself before reading the notes.

## Scenario

The fixture holds `e7` (Food, $20, 2026-07-05) and `e8` (Food, $30, 2026-07-06), viewed with the month set to `2026-07`. Edit `e7` to $12.50.

**Expected:**
- the ids remain `e7` and `e8`
- the stored array still has two rows
- `#expenseKpi` goes from `$50` to `$42.50`

The format changes because `money()` shows decimals only for non-whole values (`app.js:737`).

## The boundaries

**1. Input surface: `editExpense`, `app.js:799-815`, opened from the row button at `app.js:570`.**
- Sets `editingExpenseId = "e7"` (line 802).
- Disables the type select (line 804).
- Rebuilds the category options, *then* selects `Food` (lines 805, 809).
- Pre-fills the other fields.

*What is true now:* nothing has been written; the mode flag is set.

**2. Normalization: `app.js:192-199`.**
- `Number(els.entryAmount.value)` is the only type conversion.
- `.trim()` on the description is the only normalization.
- A *new* id is minted for both modes (line 194).
- The date stays a string.

*What is true now:* `entry.id` is `expense-<uuid>`, not `e7`.

**3. Validation: `validateEntry`, called at line 201, defined at 786-797.** Checks run in a fixed order:

1. finite and in range
2. at most two decimals
3. non-blank description
4. date-shaped
5. a real calendar date (the `toISOString()` round trip rejects `2026-02-30`)

On failure, the message goes into `#entryError` inside the still-open dialog, and the function returns.

*What is true now:* still nothing written.

**4. Existence and identity: `app.js:205-209`.** Edit mode only.
- `state.expenses.find` re-reads `e7` *now*, not when the dialog opened.
- `{ ...existing, ...entry, id: existing.id, category }` forces the old id back.
- `map` builds a new array with the replacement in `e7`'s slot.

*What is true now:* `next` exists, and `state` is untouched.

**5. Persistence: `app.js:210-211`.** `localStorage.setItem` inside `try`. On failure: "Could not save. The original expense is unchanged.", then return before the dialog closes.

*What is true now:* storage has the new document, or nothing changed at all.

**6. Publication and render: `app.js:212-217`, then `render` (286) -> `getViewData` (300).**
- `state = next` is the publication.
- Then the flag is cleared, the type select re-enabled, the form reset and the dialog closed.
- `render()` recomputes every total from `state`.

*What is true now:* memory, storage and screen agree.

## Trace a failure backwards

Patch `Storage.prototype.setItem` to throw and create a new $5.25 expense (test 3).

- **Which boundary observed the failure?** 5 (line 258).
- **Which had already run?** 1 through 3, plus the create-mode equivalent of 4: `structuredClone(state)` and the push at line 227.
- **What is discarded?** `next`, and with it the id minted at line 194. A retry mints a *different* id. For a local dashboard that is fine. For a POST to a server, it is exactly why idempotency keys exist: the client must reuse one key across retries.

Now do the same for Delete with a throwing `setItem` (05 Exercise 4). There is no boundary 5 to stop at, because the mutation (line 584) *is* the publication. The exception at line 585 escapes before line 586's `render()`. Memory says deleted, storage says present, and the screen still shows the row.

## Questions to answer from the code

1. After a successful edit, the dialog closes and `editingExpenseId` is `null`. If you click Close instead of Save, what is `editingExpenseId`, and which line makes that harmless? (Lines 164-165 versus 157.)
2. Change `e7`'s date to `2026-08-05` and save. Which month's total changes, and why does the row disappear without being deleted? (Line 304.)
3. Mark a bill paid while viewing July, then switch to August. Did August's spending change? (Lines 308, 312, 315.)
4. Which of the six boundaries would move to a server if this became an API? Which would have to exist on *both* sides? Validation does; the client copy is only for fast feedback.
