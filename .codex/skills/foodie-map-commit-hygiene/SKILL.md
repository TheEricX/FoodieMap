---
name: foodie-map-commit-hygiene
description: Pre-commit documentation and changelog workflow for the FoodieMap project. Use before committing or pushing changes in this repo, especially when the user says commit, commit then push, 提交, push, or when changes affect features, UI, API behavior, setup, deployment, README, CHANGELOG, agenda/roadmap docs, or development process.
---

# FoodieMap Commit Hygiene

Use this skill before every FoodieMap commit. Its purpose is to prevent code and documentation from drifting.

## Pre-Commit Workflow

1. Inspect the actual change set before staging:
   - Run `git status --short`.
   - Run `git diff --stat`.
   - Read the relevant diffs for changed source, config, and docs.
2. Classify the change:
   - User-facing feature or UI behavior
   - Bug fix
   - API, database, config, deployment, or setup change
   - Documentation or workflow change
   - Internal refactor or style-only change
3. Decide documentation updates before committing:
   - Update `README.md` when behavior, user flows, setup commands, API list, deployment, data files, or project limitations changed.
   - Update `CHANGELOG.md` for every non-trivial commit. Put normal development entries under `## Unreleased`; only create or move entries into a numbered version section when the user explicitly asks for a release/version.
   - Check existing planning docs such as `AGEND.md`, `AGENDA.md`, `ROADMAP.md`, `PLAN.md`, or files under `docs/` if present. Update them only when the change completes, invalidates, or changes a tracked plan item.
   - Do not create agenda or roadmap files unless the user asks.
4. If no docs need updates, say so explicitly before committing and include the reason.
5. Stage only files that belong to the current task. Do not stage unrelated user changes.
6. Run project checks appropriate to the changed files:
   - Use `node --check app.js` when JavaScript changed.
   - Use `python3 -m py_compile server.py` when Python changed.
   - Add targeted checks when config, Docker, or other runtime files changed.
7. Commit with a concise message that reflects the user-visible or process-visible change.

## Changelog Rules

Keep `CHANGELOG.md` in lightweight Keep a Changelog style with semantic version sections:

- Maintain `## Unreleased` at the top. If there are no pending changes, keep `- No unreleased changes yet.` under it.
- For normal commits, add entries under `## Unreleased` and remove the placeholder line if adding real entries.
- Use version headings as `## [x.y.z] - YYYY-MM-DD` for released milestones, for example `## [0.4.0] - 2026-06-22`.
- Do not invent a new version for ordinary commits. Create a version section only when the user asks to cut a release, tag a version, or archive unreleased changes.
- When cutting a release, move all current `Unreleased` entries into the new version section, then reset `Unreleased` to `- No unreleased changes yet.`.
- Choose version bumps conservatively if the user does not specify one: patch for fixes/docs, minor for user-facing features, major only for breaking changes.
- Use concise entries under categories such as `Added`, `Changed`, `Fixed`, `Documentation`, and `Internal`.
- Prefer user-facing wording over implementation details.
- Combine related bullets instead of listing every touched file.
- Do not duplicate the commit message verbatim if a clearer product-level summary exists.

Skip changelog updates only for truly trivial commits, such as typo-only changes in comments, formatting-only changes with no behavior impact, or mechanical cleanup that users and maintainers do not need to track. If skipping, state that explicitly before committing.

## README Rules

Update `README.md` when a future reader would otherwise use stale instructions:

- Feature list, usage flow, or screenshots implied by behavior changed.
- API endpoints, request behavior, auth, storage, Docker, env vars, or local startup changed.
- The meaning of a UI action changed, especially destructive actions like delete/remove.
- A limitation was removed, introduced, or reframed.

Do not rewrite unrelated README sections just because the file is open.

## Agenda And Roadmap Rules

Look for existing planning docs with:

```bash
find . -maxdepth 3 -type f \( -iname '*agenda*' -o -iname 'AGEND*' -o -iname 'ROADMAP*' -o -iname 'PLAN*' \)
```

If files exist, update only the parts directly affected by the commit. If none exist, record that no agenda/roadmap update was needed.
