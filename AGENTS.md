# AGENTS.md: working in the OASA techtree repo

Read by AI coding agents (Claude Code, Codex, Cursor and others) and useful for people too. This repo holds **one issue per tech tree node**, plus the automation that keeps them in step with the tree.

**Start here:** [Building with AI agents](https://joinoasa.org/docs/agents/) holds the rules every OASA repo shares; this file adds to them and never loosens them. Work is split into **task cards**: issues labeled `task` in the code repos, titled `[NODE-ID] …`. Each node issue here links to its open cards.

## What not to do here

- **Don't edit the tree in this repo.** The source of truth is `source/OASA-techtree.md` in [joinoasa/website](https://github.com/joinoasa/website) (see its AGENTS.md). Issues here are created and updated from it.
- **Don't create node issues by hand.** `.github/workflows/sync.yml` does it daily, or run it on demand from the Actions tab.
- **Don't change assignees or move a status back.** Claims are handled by `/claim` and `/unclaim` comments (`.github/workflows/claim.yml`).

## Helping on a node

- Read the node's issue and its requires on [the tree](https://joinoasa.org/techtree/).
- Post plans, progress, links to code, designs and test results as comments on the node's issue.
- Building several nodes together? Use the "Register a project" form and `docs/charter-template.md`.
- A new idea for the tree goes to [joinoasa/ideas](https://github.com/joinoasa/ideas). To shape one with AI first, follow the [brainstorming guide](https://joinoasa.org/docs/brainstorm/).

## Scripts

| Command | What it does |
|---|---|
| `node scripts/sync-issues.mjs --data ../website/src/data/techtree.json --repo joinoasa/techtree --dry-run` | Show what the sync would change |
| same without `--dry-run` | Apply it (maintainers) |

Build the data first in a clone of the website repo: `node scripts/build-techtree.mjs`.

## Pull requests

Open a pull request into `main` for any change to scripts, workflows or docs. Keep it to one topic, and test the scripts with `--dry-run` or mocks. Writing style: short, clear, not wordy.
