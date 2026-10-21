// Creates and updates one GitHub issue per OASA tech tree node.
//
//   node scripts/sync-issues.mjs --data ../website/src/data/techtree.json --repo joinoasa/techtree --dry-run
//   node scripts/sync-issues.mjs --data ../website/src/data/techtree.json --repo joinoasa/techtree
//   node scripts/sync-issues.mjs --data ... --offline        # print one sample issue, no GitHub calls
//
// Needs the GitHub CLI (`gh`) signed in with access to the repo.
// Safe to re-run: issues are matched by a hidden marker (<!-- oasa-node:ID -->), so nothing is duplicated.
// Status labels come from the tree data, except a node marked in progress or done on GitHub
// is never moved back to available/locked by this script.
// Writes node-issues.json (ID -> issue URL) for the website's techtree-details.json.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.includes(`--${k}`);
const DATA = arg('data');
const REPO = arg('repo', 'joinoasa/techtree');
const DRY = flag('dry-run');
const OFFLINE = flag('offline');
const OUT = arg('out', 'node-issues.json');
const SITE = 'https://joinoasa.org';
if (!DATA) { console.error('Pass --data path/to/src/data/techtree.json'); process.exit(1); }

const tree = JSON.parse(readFileSync(DATA, 'utf8'));
const nodes = tree.nodes;
const byId = new Map(nodes.map((n) => [n.id, n]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- GitHub via the gh CLI (REST only)
function gh(method, path, body) {
  const args = ['api', '-X', method, path, '-H', 'Accept: application/vnd.github+json'];
  if (body) args.push('--input', '-');
  const out = execFileSync('gh', args, { input: body ? JSON.stringify(body) : undefined, encoding: 'utf8', maxBuffer: 64 << 20 });
  return out.trim() ? JSON.parse(out) : null;
}
function ghAll(path) {
  const out = [];
  for (let page = 1; ; page++) {
    const got = gh('GET', `${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    out.push(...got);
    if (got.length < 100) return out;
  }
}

// ---- Labels
const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
const STATUS = {
  available: { name: 'status:available', color: '1f7a4d', description: 'Ready to start: everything it requires is done' },
  locked: { name: 'status:locked', color: '8e9aad', description: 'Waiting on the nodes it requires' },
  'in-progress': { name: 'status:in-progress', color: 'b7791f', description: 'Someone is building it' },
  done: { name: 'status:done', color: '2a5fa8', description: 'Released' },
};
const BRANCH_COLORS = ['13233f', '1d4683', '2a5fa8', '3b6fb6', '4f7fc0', '5d6b82', '2f5d8a', '1f4e79', '35619a', '486fa6', '24426e', '3d5a80', '52648a'];
const branches = [...new Set(nodes.map((n) => n.branch))];
const branchLabel = (b) => `branch:${slug(b)}`;
const LABELS = [
  ...Object.values(STATUS),
  ...branches.map((b, i) => ({ name: branchLabel(b), color: BRANCH_COLORS[i % BRANCH_COLORS.length], description: `Tech tree branch: ${b}` })),
  { name: 'tech-tree-node', color: 'a61e6e', description: 'One issue per tech tree node' },
];

// ---- Issue text
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];
const ref = (id, num) => {
  const n = byId.get(id);
  const name = n ? n.name : (tree.moonshots.find((m) => m.id === id)?.title ?? id);
  if (num) return `#${num} (${id})`;
  return /^MS-|^ST-/.test(id) ? `[${id}](${SITE}/moonshots/#${id}) ${name}` : `[${id}](${SITE}/techtree/#${id}) ${name}`;
};
function requiresText(n, nums) {
  if (!n.requiresGroups.length) return 'Nothing. Ready to start.';
  return n.requiresGroups.map((g) => {
    const items = [...g.ids.map((id) => ref(id, nums.get(id))), ...(g.text ?? [])];
    let s = items.join(g.kind === 'any' ? ' **or** ' : ', ');
    if (g.kind === 'atLeast') s = `any ${WORDS[g.n] ?? g.n} of ${s}`;
    if (g.note) s += ` (${g.note})`;
    return s;
  }).join('; ');
}
const title = (n) => `[${n.id}] ${n.name}`;
const marker = (id) => `<!-- oasa-node:${id} -->`;
function body(n, nums) {
  const unlocks = n.unlocks.map((id) => ref(id, nums.get(id)));
  if (n.enables) unlocks.push(n.enables);
  const direct = n.moonshots ?? [], all = n.neededBy?.moonshots ?? [];
  const msLinks = direct.map((m) => `[${m}](${SITE}/moonshots/#${m})`).join(', ');
  const ms = all.length
    ? [direct.length ? `${msLinks}${all.length > direct.length ? `, and ${all.length - direct.length} more further up the tree` : ''}` : `${all.length} further up the tree`]
    : [];
  const how = n.status === 'locked'
    ? 'This node is **locked** until what it requires is done. You can still research it, discuss approaches or help with what it requires.'
    : n.status === 'available'
      ? '**Members:** comment with a line on your plan, and a lead will assign it to you. Not a member? [Apply](' + SITE + '/join/). It\'s free. Anyone can comment and help.'
      : 'Comment to join the people already working on it.';
  return [
    `**${STATUS[n.status] ? n.status.replace('-', ' ').replace(/^./, (c) => c.toUpperCase()) : n.status}** · ${n.branch} · [See it on the tech tree](${SITE}/techtree/#${n.id})`,
    '',
    n.brief || '',
    '',
    `**Requires:** ${requiresText(n, nums)}`,
    '',
    `**Unlocks:** ${unlocks.length ? unlocks.join(', ') : 'Nothing yet'}`,
    ...(ms.length ? ['', `**Moonshots that depend on it:** ${ms[0]}`] : []),
    '',
    `**You'll learn:** ${n.sciences}`,
    '',
    '### Pick this up',
    how,
    '',
    marker(n.id),
  ].join('\n');
}

// ---- Main
async function main() {
  if (OFFLINE) {
    const n = byId.get('R-COM2');
    console.log(title(n), '\n', body(n, new Map()));
    console.log(`\n${nodes.length} nodes, ${LABELS.length} labels.`);
    return;
  }

  // Labels
  const have = new Map(ghAll(`repos/${REPO}/labels`).map((l) => [l.name, l]));
  for (const l of LABELS) {
    const cur = have.get(l.name);
    if (!cur) { console.log(`+ label ${l.name}`); if (!DRY) gh('POST', `repos/${REPO}/labels`, l); }
    else if (cur.color !== l.color || cur.description !== l.description) {
      console.log(`~ label ${l.name}`);
      if (!DRY) gh('PATCH', `repos/${REPO}/labels/${encodeURIComponent(l.name)}`, { color: l.color, description: l.description });
    }
  }

  // Existing node issues, by marker
  const issues = ghAll(`repos/${REPO}/issues?state=all`).filter((i) => !i.pull_request);
  const found = new Map();
  for (const i of issues) {
    const m = (i.body ?? '').match(/<!-- oasa-node:([A-Z0-9-]+) -->/);
    if (m) found.set(m[1], i);
  }
  const nums = new Map([...found].map(([id, i]) => [id, i.number]));

  // Pass 1: create missing issues (cross-links filled in on pass 2)
  let created = 0;
  for (const n of nodes) {
    if (found.has(n.id)) continue;
    console.log(`+ issue ${title(n)}`);
    created++;
    if (DRY) continue;
    const i = gh('POST', `repos/${REPO}/issues`, { title: title(n), body: body(n, nums), labels: [STATUS[n.status].name, branchLabel(n.branch), 'tech-tree-node'] });
    found.set(n.id, i); nums.set(n.id, i.number);
    await sleep(1500); // stay under GitHub's content-creation limits
  }

  // Pass 2: bring titles, bodies and labels up to date
  let updated = 0;
  for (const n of nodes) {
    const i = found.get(n.id);
    if (!i) continue;
    const cur = i.labels?.map((l) => (typeof l === 'string' ? l : l.name)) ?? [];
    const curStatus = cur.find((l) => l.startsWith('status:'));
    const keepGithubStatus = ['status:in-progress', 'status:done'].includes(curStatus) && ['available', 'locked'].includes(n.status);
    const status = keepGithubStatus ? curStatus : STATUS[n.status].name;
    const labels = [...cur.filter((l) => !l.startsWith('status:') && !l.startsWith('branch:')), status, branchLabel(n.branch)];
    if (!labels.includes('tech-tree-node')) labels.push('tech-tree-node');
    const want = { title: title(n), body: body(n, nums), labels };
    const same = i.title === want.title && (i.body ?? '') === want.body && [...labels].sort().join() === [...cur].sort().join();
    if (same) continue;
    updated++;
    console.log(`~ issue #${i.number ?? '?'} ${n.id}`);
    if (!DRY) { gh('PATCH', `repos/${REPO}/issues/${i.number}`, { ...want, ...(n.status === 'done' ? { state: 'closed', state_reason: 'completed' } : {}) }); await sleep(800); }
  }

  const map = Object.fromEntries([...found].map(([id, i]) => [id, i.html_url]).sort());
  if (!DRY) writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n');
  console.log(`\n${DRY ? 'Dry run: would create' : 'Created'} ${created}, ${DRY ? 'would update' : 'updated'} ${updated}. ${DRY ? '' : `Wrote ${OUT}.`}`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
