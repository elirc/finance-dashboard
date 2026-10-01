# Concepts explained from first principles

[Course index](README.md)

## The central idea: form modes, stable identities and derived totals

Create and edit look similar in the UI but have different identity semantics. Reusing a form is reasonable only when its mode is explicit. A new id on edit would turn an update into an accidental duplicate; replacing the entire expense array with a one-record array would erase unrelated data. The map operation expresses a precise replacement. Deriving totals avoids a second state variable that can become stale after editing. Persistence-before-publish is used on the new edit path so storage failure does not pretend success. Existing add and other dashboard workflows have their own behavior and are not a general transactional storage engine. Amounts remain JavaScript numbers in this educational app; validation limits decimal places, but robust financial systems commonly use integer minor units or decimal arithmetic. This exercise is about software state and validation, not financial advice.

## Invariants: a precise way to describe correctness

An invariant is a rule that must remain true before and after an operation. “The app works” is too broad to test. “A failed import writes no records” or “editing preserves the record id” gives you something observable. For this project, derive your invariants from this behavior:

> The existing modal supports an expense-edit mode with prefilled values, positive finite two-decimal amounts, real calendar dates and nonblank descriptions. Failed validation or storage keeps the original expense and the editor open. Totals continue to be derived from state.

Turn each sentence into a small state table. The columns are initial state, input, expected final state and expected feedback. Include one rejected input and one retry/repeated action where relevant. A useful invariant should be meaningful even if the implementation changes from an array to a database or from one UI component to another.

## Validation versus normalization

Validation rejects values the operation cannot accept. Normalization converts acceptable values to the representation the rest of the program expects. Trimming a comparison string is normalization; rejecting an empty required field is validation. Neither operation should silently invent facts. If a quantity is free-form text, do not guess a numerical interpretation. If an imported record is malformed, do not quietly save only the convenient subset unless that is the explicit product policy.

Apply this distinction to the data model:

The saved document contains expenses, incomes, budgets, bills, goals and investments. An expense has id, owner, date, category, description and amount. Editing changes its fields, not its id or the number of expenses.

Which fields can be omitted? Which can be empty? Which have a bounded vocabulary? Which have stable identity? Write those answers down before adding another conditional. A schema is simply an explicit description of that expected shape and meaning.

## State transitions and failure boundaries

Every change has an ordering. If memory changes first and persistence fails, the UI can show data that will disappear after reload. If persistence succeeds first and rendering fails, the stored data may be correct while the screen is stale. There is no universal answer for every feature, but the choice must be deliberate and observable. The worked change makes one specific promise; the tests check that promise.

A promise represents an operation that completes later. `await` does not make it infallible or atomic; it gives the caller a place to handle success and rejection. Similarly, calling several functions inside one `try` block does not create a database transaction. Atomicity must come from a storage operation or transaction boundary that actually provides it.

## Identity, representation and derived values

Keep a stable id when updating an existing record. Compute display-only values from authoritative data when feasible, so there are fewer independently mutable facts to keep synchronized. Be careful when converting between strings and numbers: `Number('')` is zero, JSON cannot faithfully represent Infinity, and a date string can have different semantics from a timestamp. The specific conversions in this lesson are visible in the worked source, so step through them with a concrete value.

## Small design decisions deserve explanations

Before extracting a new abstraction, explain what repeated responsibility it would own. A helper that merely renames one expression may add little. A pure validator or one transaction boundary can make an important guarantee easier to test. Prefer an explanation tied to this project’s behavior over a rule such as “all code must use a particular pattern.”

Write a short decision note: “We chose X because it preserves Y under Z. It does not yet solve W.” Use the limitations in the worked example to fill in those letters. This is the beginning of engineering judgment: choosing a bounded solution and accurately describing its limits.
