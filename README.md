# OASA tech tree: the work

Every node on the [OASA tech tree](https://joinoasa.org/techtree/) has an issue here. Use it to claim the node, ask questions, share progress and link the code, designs and test results.

## Find something to work on

- **[Ready now](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3Astatus%3Aavailable)**: nothing blocks these. Start here.
- **[In progress](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3A%22status%3Ain-progress%22)**: join someone who's already building.
- **By branch:** filter by the `branch:` labels, for example [Air](https://github.com/joinoasa/techtree/issues?q=is%3Aopen+label%3Abranch%3Aair).

## Claim a node

1. Comment `/claim` on the node's issue. You need to be an OASA member ([apply](https://joinoasa.org/join/); it's free). Only nodes labelled `status:available` can be claimed.
   Make your OASA organisation membership public (GitHub profile → the organisation → Public) so `/claim` recognises you as a member.
2. A workflow assigns the issue to you and sets `status:in-progress`, then replies with next steps.
3. Post a short plan, then updates when you hit a milestone or get blocked. A claim with no update for 30 days may be released by a lead.
4. Can't continue? Comment `/unclaim` and the node goes back to available.
5. When the work meets the [release standard](https://joinoasa.org/docs/projects/#release-standard), a lead sets `status:done`, closes the issue, and the nodes it unlocks open up.

Full guide: [How claiming works](https://joinoasa.org/docs/claim-a-node/). Anyone can comment, suggest and help on any issue, member or not.

## Register a project

Building something that uses several nodes? [Register a project](https://github.com/joinoasa/techtree/issues/new?template=register-project.yml). A one-page [charter template](docs/charter-template.md) helps you think it through.

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

## Automation

- `.github/workflows/claim.yml` handles `/claim` and `/unclaim`.
- `.github/workflows/sync.yml` runs daily (or on demand) and keeps the issues in step with the tree. It never changes assignees and never moves a claimed or finished node back.

## License

- Scripts and workflows: [Apache License 2.0](LICENSE).
- Issue text, README and docs (the node descriptions and templates): [CC BY-SA 4.0](LICENSE-content).
- The OASA name and logo are not covered by either licence.
