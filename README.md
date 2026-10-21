# OASA tech tree: the work

Every node on the [OASA tech tree](https://joinoasa.org/techtree/) has an issue here. Use it to claim the node, ask questions, share progress and link the code, designs and test results.

## Find something to work on

- **[Ready now](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3Astatus%3Aavailable)**: nothing blocks these. Start here.
- **[In progress](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3A%22status%3Ain-progress%22)**: join someone who's already building.
- **By branch:** filter by the `branch:` labels, for example [Air](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3Abranch%3Aair).

## Claim a node

1. Comment on the issue that you'd like to take it, with a line on your plan.
2. A lead assigns it to you and sets `status:in-progress`.
3. Post when you hit a milestone or get blocked.
4. When it meets the [release standard](https://joinoasa.org/docs/projects/#release-standard), it's marked `status:done` and the nodes it unlocks open up.

Only members claim nodes ([apply](https://joinoasa.org/join/); it's free). Anyone can comment, suggest and help.

## Labels

| Label | Meaning |
|---|---|
| `status:available` | Ready to start: everything it requires is done |
| `status:locked` | Waiting on the nodes it requires |
| `status:in-progress` | Someone is building it |
| `status:done` | Released |
| `branch:…` | Where it sits on the tree (roots, trunk, air, ground…) |

## Where the tree comes from

The tree's source of truth is `source/OASA-techtree.md` in the [website repo](https://github.com/joinoasa/website). To propose a new node or change one, open a [new node proposal](https://github.com/joinoasa/techtree/issues/new?template=new-node.yml) or post in [Discussions](https://github.com/orgs/joinoasa/discussions).

`scripts/sync-issues.mjs` creates and updates these issues from the website's tech tree data.
