# Verification: Finance Dashboard: validated expense editing

[Course index](README.md)

**Implementation date:** 2026-09-08. Checks below ran on isolated working copies before the reviewed files were applied to this project.

| Check | Result |
|---|---|
| tests | Passed (exit code 0) |
| Real Chromium browser interaction | Passed |

**Automated test cases:** 4 (`test/expense-edit.test.cjs`). Two were delivered with the original change; cases 3 and 4 were added in the 2026-09-17 follow-up that routed the create branch through the same persist-then-publish shape as the edit branch.

## What was exercised

The fixture contains one $10.00 expense and no paid bills. Edit it to $12.50. There must still be exactly one expense with the same id, monthly spending must be $12.50, and reload must retain $12.50. Trying -1 or 1.001 must leave $10.00 unchanged in a fresh fixture.

Case 3: with `Storage.prototype.setItem` throwing, creating a $5.25 expense leaves one expense in `state` and one in storage, keeps the modal open and reports "Could not save". Case 4: if the edited expense disappears before submit, `#entryError` reads "This expense no longer exists." and nothing is written.

**Follow-up run, 2026-09-17:** `node --test test/expense-edit.test.cjs` on Node 22.16.0 with jsdom 25 installed -> `# tests 4 / # pass 4 / # fail 0`. Note that `node --test test/` (directory form) fails with MODULE_NOT_FOUND on this Node build; name the file, or use `npm test`.

**Remaining gap, stated rather than hidden:** three `saveState()` call sites outside the entry handler (`app.js:151`, `:585`, `:635` - bill paid/autopay toggles and the settings form) still write unguarded. Exercise 3 closes them.

## Environment and scope

The verification environment used Node 22.16.0. Browser checks used the installed Chromium build.

Tests and builds ran in working copies with an isolated shared dependency harness. Source files were checked against the original content before application. Install this project’s declared dependencies locally to run its scripts; no running service or installed dependency tree is assumed merely because the source changes are present.

The tests target the implemented change and relevant existing behavior. They do not establish production readiness, every browser/version, multi-tab safety or every unrelated workflow. Practice extensions in chapter 5 are not completed features.

## Reproduce the checks

From this project folder: `npm install`, then `npm test`.

The central implementation report in AstraOrganized2/astrafinalplan/TEN_PROJECTS_IMPLEMENTED.md links all ten courses. Machine-readable check results and logs are retained with the implementation tooling in that repository.

Reading the diff: the files Astra touched were re-saved with CRLF line endings and Prettier formatting, so a plain `diff` shows whole files as changed. Compare with `git diff -w`, or `diff -r --strip-trailing-cr -w <backup> <project>` against the pre-change backup, to see only the real edits.
