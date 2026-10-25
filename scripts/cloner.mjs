import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const coreChecks = ['build', 'render', 'assets', 'visual', 'interaction', 'motion', 'responsive', 'runtime', 'offline', 'links', 'cleanup', 'review'];
const statuses = new Set(['pass', 'fail', 'unknown']);
const routeStatuses = new Set(['confirmed', 'candidate', 'excluded', 'unavailable']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const uniqueStrings = value => Array.isArray(value) && value.every(nonempty) && new Set(value).size === value.length;
const load = async file => JSON.parse(await readFile(file, 'utf8'));
const json = value => JSON.stringify(value, null, 2) + '\n';

export async function initialize(directory) {
  const root = path.resolve(directory);
  await mkdir(root, { recursive: true });
  // Exclusive creation preserves an existing run, including an interrupted one.
  for (const name of ['clone.json', 'inventory.json', 'checks.json']) {
    try { await access(path.join(root, name)); throw new Error(`Refusing to overwrite ${name}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await writeFile(path.join(root, 'clone.json'), json({
    schemaVersion: 1, sourceUrl: '', localUrl: '', outputDirectory: '', strategy: 'auto', backend: 'demo',
    viewports: [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 1000 }],
    requiredChecks: coreChecks, blockedHosts: [], removeTerms: [], intentionalChanges: [],
  }), { flag: 'wx' });
  await writeFile(path.join(root, 'inventory.json'), json({ schemaVersion: 1, discoveryComplete: false, discoveryLimits: [], routes: [] }), { flag: 'wx' });
  await writeFile(path.join(root, 'checks.json'), json({ schemaVersion: 1, checks: [] }), { flag: 'wx' });
  return { workspace: root, initialized: true, next: 'Set URLs/output location and record discovery before checking.' };
}

function httpUrl(value, field) {
  assert(nonempty(value), `${field} must be set`);
  const url = new URL(value);
  assert(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password, `${field} must be an HTTP(S) URL without credentials`);
}

export function validateData(config, inventory, results) {
  for (const [name, value] of Object.entries({ config, inventory, results })) assert(isObject(value) && value.schemaVersion === 1, `${name}: expected schemaVersion 1 object`);
  httpUrl(config.sourceUrl, 'sourceUrl'); httpUrl(config.localUrl, 'localUrl');
  assert(new URL(config.sourceUrl).origin !== new URL(config.localUrl).origin, 'Reference and local origins must differ');
  assert(nonempty(config.outputDirectory), 'outputDirectory must be set');
  assert(['auto', 'reuse', 'rebuild', 'hybrid'].includes(config.strategy), 'Invalid strategy');
  assert(['demo', 'real', 'none'].includes(config.backend), 'Invalid backend mode');
  assert(Array.isArray(config.viewports) && config.viewports.length > 0, 'At least one viewport is required');
  const names = new Set();
  for (const viewport of config.viewports) {
    assert(isObject(viewport) && nonempty(viewport.name) && !names.has(viewport.name), 'Viewport names must be unique');
    assert(Number.isInteger(viewport.width) && viewport.width > 0 && Number.isInteger(viewport.height) && viewport.height > 0, 'Viewport sizes must be positive integers');
    names.add(viewport.name);
  }
  assert(uniqueStrings(config.requiredChecks) && coreChecks.every(id => config.requiredChecks.includes(id)), 'Required core checks cannot be removed');
  for (const field of ['removeTerms', 'blockedHosts']) assert(uniqueStrings(config[field]), `${field} must contain unique nonempty strings`);
  for (const host of config.blockedHosts) assert(!host.includes('/') && !host.includes(':') && !/\s/.test(host), 'blockedHosts must contain hostnames, not URLs or ports');
  assert(Array.isArray(config.intentionalChanges) && config.intentionalChanges.every(nonempty), 'intentionalChanges must be an array of descriptions');
  assert(typeof inventory.discoveryComplete === 'boolean' && Array.isArray(inventory.discoveryLimits) && inventory.discoveryLimits.every(nonempty), 'Invalid discovery metadata');
  assert(Array.isArray(inventory.routes) && Array.isArray(results.checks), 'routes and checks must be arrays');
  const routeIds = new Set(), routePaths = new Set(), checkIds = new Set();
  for (const route of inventory.routes) {
    assert(isObject(route) && nonempty(route.id) && !routeIds.has(route.id), 'Route IDs must be unique');
    assert(nonempty(route.path) && route.path.startsWith('/') && !route.path.startsWith('//') && !routePaths.has(route.path), 'Route paths must be unique site-relative paths');
    httpUrl(route.sourceUrl, 'route.sourceUrl');
    assert(routeStatuses.has(route.status) && uniqueStrings(route.originEvidence) && route.originEvidence.length > 0, 'Route requires status and discovery evidence');
    assert(uniqueStrings(route.checkIds), 'Route checkIds must be unique strings');
    if (route.status === 'excluded') assert(nonempty(route.reason), 'Excluded route requires a reason');
    else assert(route.checkIds.length > 0, 'In-scope route requires checkIds');
    routeIds.add(route.id); routePaths.add(route.path);
  }
  for (const check of results.checks) {
    assert(isObject(check) && nonempty(check.id) && !checkIds.has(check.id), 'Check IDs must be unique');
    assert(nonempty(check.category) && statuses.has(check.status) && nonempty(check.detail), 'Check requires category, status and detail');
    assert(uniqueStrings(check.evidence), 'Check evidence must contain unique paths');
    checkIds.add(check.id);
  }
  return true;
}

async function evidenceExists(root, file) {
  if (!nonempty(file) || path.isAbsolute(file)) return false;
  const resolved = path.resolve(root, file), relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return false;
  try {
    // Canonical containment also excludes a symlink to evidence outside the workspace.
    const { realpath, stat } = await import('node:fs/promises');
    const realRoot = await realpath(root), realFile = await realpath(resolved);
    const canonical = path.relative(realRoot, realFile);
    return canonical !== '..' && !canonical.startsWith(`..${path.sep}`) && !path.isAbsolute(canonical) && (await stat(realFile)).isFile();
  } catch { return false; }
}

export async function makeReport(directory) {
  const root = path.resolve(directory);
  const [config, inventory, results] = await Promise.all(['clone.json', 'inventory.json', 'checks.json'].map(name => load(path.join(root, name))));
  validateData(config, inventory, results);
  const findings = [], observed = new Map();
  for (const check of results.checks) {
    const available = await Promise.all(check.evidence.map(file => evidenceExists(root, file)));
    let status = check.status;
    if (status === 'pass' && (available.length === 0 || !available.every(Boolean))) {
      status = 'unknown'; findings.push(`Check ${check.id}: missing or invalid evidence`);
    }
    observed.set(check.id, { ...check, status });
  }
  const required = new Set([...config.requiredChecks, ...inventory.routes.filter(route => route.status !== 'excluded').flatMap(route => route.checkIds)]);
  for (const id of required) if (!observed.has(id)) {
    observed.set(id, { id, category: 'coverage', status: 'unknown', detail: 'Required check has not been recorded', evidence: [] });
  }
  if (!inventory.discoveryComplete) findings.push('Discovery is incomplete');
  if (inventory.discoveryLimits.length > 0) findings.push(...inventory.discoveryLimits.map(limit => `Discovery limitation: ${limit}`));
  const active = inventory.routes.filter(route => route.status !== 'excluded');
  if (active.length === 0) findings.push('No in-scope routes were confirmed');
  for (const route of active) {
    if (route.status !== 'confirmed') findings.push(`Route ${route.path}: ${route.status}`);
    if (!(await Promise.all(route.originEvidence.map(file => evidenceExists(root, file)))).every(Boolean)) findings.push(`Route ${route.path}: missing discovery evidence`);
  }
  const checks = [...observed.values()];
  const fail = checks.some(check => check.status === 'fail');
  const unknown = findings.length > 0 || checks.some(check => check.status === 'unknown');
  return {
    schemaVersion: 1, status: fail ? 'fail' : unknown ? 'unknown' : 'pass',
    sourceUrl: config.sourceUrl, localUrl: config.localUrl, strategy: config.strategy, backend: config.backend,
    coverage: { routes: inventory.routes.length, inScope: active.length, confirmed: active.filter(route => route.status === 'confirmed').length, excluded: inventory.routes.length - active.length, requiredChecks: required.size },
    summary: { pass: checks.filter(check => check.status === 'pass').length, fail: checks.filter(check => check.status === 'fail').length, unknown: checks.filter(check => check.status === 'unknown').length },
    intentionalChanges: config.intentionalChanges, findings, checks,
  };
}

export async function comparePng(reference, candidate, output, maxRatio = 0.01, threshold = 0.1) {
  assert(Number.isFinite(maxRatio) && maxRatio >= 0 && maxRatio <= 1, 'maxRatio must be between 0 and 1');
  assert(Number.isFinite(threshold) && threshold >= 0 && threshold <= 1, 'threshold must be between 0 and 1');
  assert(path.resolve(reference) !== path.resolve(output) && path.resolve(candidate) !== path.resolve(output), 'Diff output must not overwrite an input');
  let PNG, pixelmatch;
  try { ({ PNG } = await import('pngjs')); ({ default: pixelmatch } = await import('pixelmatch')); }
  catch { throw new Error('PNG diff requires the pinned dependencies. Run npm ci --ignore-scripts in the skill directory.'); }
  const [left, right] = await Promise.all([reference, candidate].map(async file => PNG.sync.read(await readFile(file))));
  if (left.width !== right.width || left.height !== right.height) return { status: 'fail', reason: 'Image dimensions differ', reference: [left.width, left.height], candidate: [right.width, right.height] };
  const diff = new PNG({ width: left.width, height: left.height });
  const differentPixels = pixelmatch(left.data, right.data, diff.data, left.width, left.height, { threshold });
  const ratio = differentPixels / (left.width * left.height);
  await mkdir(path.dirname(path.resolve(output)), { recursive: true });
  await writeFile(output, PNG.sync.write(diff), { flag: 'wx' });
  return { status: ratio <= maxRatio ? 'pass' : 'fail', differentPixels, totalPixels: left.width * left.height, ratio, maxRatio, threshold, output: path.resolve(output) };
}

export function auditObservation(config, probe) {
  assert(isObject(probe) && probe.schemaVersion === 1 && nonempty(probe.url), 'Expected browser-probe schemaVersion 1 observation');
  httpUrl(config.localUrl, 'localUrl');
  assert(new URL(probe.url).origin === new URL(config.localUrl).origin, 'Audit must target the configured local origin');
  assert(uniqueStrings(config.blockedHosts) && uniqueStrings(config.removeTerms), 'Invalid cleanup rules');
  assert(Array.isArray(probe.links) && Array.isArray(probe.images) && Array.isArray(probe.forms), 'Probe arrays are missing');
  const failures = [], localOrigin = new URL(config.localUrl).origin;
  const blocked = new Set([new URL(config.sourceUrl).hostname.toLowerCase(), ...config.blockedHosts.map(host => host.toLowerCase())]);
  const references = [
    ...probe.links.map(link => ({ kind: 'link', url: link.href })),
    ...probe.images.map(image => ({ kind: 'image', url: image.src })),
    ...probe.forms.map(form => ({ kind: 'form', url: form.action })),
    ...(probe.resources ?? []).map(url => ({ kind: 'resource', url })),
  ];
  for (const reference of references) {
    if (!nonempty(reference.url)) continue;
    let url;
    try { url = new URL(reference.url, probe.url); } catch { failures.push({ ...reference, referenceKind: reference.kind, kind: 'invalid-url' }); continue; }
    if (['http:', 'https:'].includes(url.protocol)) {
      if ([...blocked].some(host => url.hostname.toLowerCase() === host || url.hostname.toLowerCase().endsWith(`.${host}`))) failures.push({ ...reference, referenceKind: reference.kind, kind: 'blocked-host' });
      if (reference.kind !== 'link' && url.origin !== localOrigin) failures.push({ ...reference, referenceKind: reference.kind, kind: 'remote-dependency' });
    }
  }
  for (const image of probe.images) if (!image.loaded) failures.push({ kind: 'image-not-loaded', url: image.src });
  if (probe.overflow) failures.push({ kind: 'horizontal-overflow' });
  const text = [probe.text ?? '', probe.title ?? '', ...probe.links.map(link => link.text ?? ''), ...(probe.metadata ?? []).map(item => item.content ?? '')].join('\n').toLowerCase();
  for (const term of config.removeTerms) if (text.includes(term.toLowerCase())) failures.push({ kind: 'cleanup-term', term });
  return { schemaVersion: 1, status: failures.length ? 'fail' : 'unknown', url: probe.url, failures, scope: 'Current-state screen only; a clean probe is not complete-site verification.', unknowns: ['Network/console history, functional behavior, all routes/states, file-level references and visual parity require separate checks.'] };
}

function markdown(report) {
  const safe = text => String(text).replace(/[\r\n|]/g, ' ');
  return `# Clone comparison\n\nStatus: **${report.status.toUpperCase()}**\n\nReference: ${safe(report.sourceUrl)}\n\nLocal: ${safe(report.localUrl)}\n\n${report.coverage.confirmed}/${report.coverage.inScope} in-scope routes confirmed. Checks: ${report.summary.pass} pass, ${report.summary.fail} fail, ${report.summary.unknown} unknown.\n\n## Findings\n\n${report.findings.map(item => `- ${safe(item)}`).join('\n') || 'No coverage findings.'}\n\n## Checks\n\n| ID | Status | Detail |\n| --- | --- | --- |\n${report.checks.map(item => `| ${safe(item.id)} | ${item.status} | ${safe(item.detail)} |`).join('\n')}\n\n## Intentional changes\n\n${report.intentionalChanges.map(item => `- ${safe(item)}`).join('\n') || 'None declared.'}\n`;
}

export async function main(args) {
  const [command, ...values] = args;
  if (command === 'init' && values.length === 1) return initialize(values[0]);
  if (command === 'diff' && values.length >= 3 && values.length <= 5) return comparePng(values[0], values[1], values[2], values[3] === undefined ? 0.01 : Number(values[3]), values[4] === undefined ? 0.1 : Number(values[4]));
  if (command === 'audit' && values.length === 2) return auditObservation(await load(path.join(values[0], 'clone.json')), await load(values[1]));
  if (['validate', 'report'].includes(command) && values.length === 1) {
    const root = path.resolve(values[0]);
    if (command === 'validate') {
      const data = await Promise.all(['clone.json', 'inventory.json', 'checks.json'].map(name => load(path.join(root, name))));
      validateData(...data); return { valid: true, note: 'Structure validated; this is not a fidelity result.' };
    }
    const report = await makeReport(root);
    await writeFile(path.join(root, 'report.json'), json(report));
    await writeFile(path.join(root, 'report.md'), markdown(report));
    return report;
  }
  throw new Error('Usage: cloner.mjs init|validate|report <workspace> OR audit <workspace> <probe.json> OR diff <reference.png> <local.png> <diff.png> [maxRatio] [threshold]');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(result => {
    console.log(json(result));
    if (result.status === 'fail') process.exitCode = 1;
    if (result.status === 'unknown') process.exitCode = 2;
  }).catch(error => { console.error(json({ error: error.message })); process.exitCode = 1; });
}
