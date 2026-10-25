import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { initialize, validateData, makeReport, comparePng, auditObservation } from './cloner.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'aio-cloner-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await initialize(root);
  const config = JSON.parse(await readFile(path.join(root, 'clone.json'), 'utf8'));
  Object.assign(config, { sourceUrl: 'https://reference.invalid', localUrl: 'http://127.0.0.1:3000', outputDirectory: './app' });
  await writeFile(path.join(root, 'capture.json'), '{}');
  const inventory = { schemaVersion: 1, discoveryComplete: true, discoveryLimits: [], routes: [{ id: 'home', path: '/', sourceUrl: config.sourceUrl, status: 'confirmed', originEvidence: ['capture.json'], checkIds: ['home-mobile', 'home-desktop'] }] };
  const results = { schemaVersion: 1, checks: [...config.requiredChecks, ...inventory.routes[0].checkIds].map(id => ({ id, category: 'fixture', status: 'pass', detail: 'Neutral fixture observation', evidence: ['capture.json'] })) };
  const save = async () => Promise.all([['clone.json', config], ['inventory.json', inventory], ['checks.json', results]].map(([file, value]) => writeFile(path.join(root, file), JSON.stringify(value))));
  await save();
  return { root, config, inventory, results, save };
}

test('complete evidence passes and initialization preserves existing files', async t => {
  const f = await fixture(t);
  assert.equal((await makeReport(f.root)).status, 'pass');
  await assert.rejects(initialize(f.root), /overwrite/);
  assert.equal(JSON.parse(await readFile(path.join(f.root, 'clone.json'))).sourceUrl, f.config.sourceUrl);
});

test('missing required observations remain unknown and cannot be dropped', async t => {
  const f = await fixture(t);
  f.results.checks.pop(); await f.save();
  const report = await makeReport(f.root);
  assert.equal(report.status, 'unknown');
  assert.equal(report.coverage.requiredChecks, f.config.requiredChecks.length + 2);
  f.config.requiredChecks = ['build'];
  assert.throws(() => validateData(f.config, f.inventory, f.results), /cannot be removed/);
});

test('missing, out-of-workspace or absolute evidence never passes', async t => {
  for (const file of ['missing.png', '../outside.json', path.resolve('outside.json')]) {
    const f = await fixture(t);
    f.results.checks[0].evidence = [file]; await f.save();
    assert.equal((await makeReport(f.root)).status, 'unknown');
  }
});

test('incomplete discovery and unavailable routes block completion', async t => {
  const f = await fixture(t);
  f.inventory.discoveryComplete = false; await f.save();
  assert.equal((await makeReport(f.root)).status, 'unknown');
  f.inventory.discoveryComplete = true; f.inventory.routes[0].status = 'unavailable'; await f.save();
  assert.equal((await makeReport(f.root)).status, 'unknown');
});

test('failure outranks missing coverage and excluded routes need reasons', async t => {
  const f = await fixture(t);
  f.results.checks[0].status = 'fail'; f.inventory.discoveryComplete = false; await f.save();
  assert.equal((await makeReport(f.root)).status, 'fail');
  f.inventory.routes[0].status = 'excluded';
  assert.throws(() => validateData(f.config, f.inventory, f.results), /requires a reason/);
});

test('duplicate records, unsafe URLs and invalid modes are rejected', async t => {
  const f = await fixture(t);
  f.results.checks.push(f.results.checks[0]);
  assert.throws(() => validateData(f.config, f.inventory, f.results), /unique/);
  f.results.checks.pop(); f.config.sourceUrl = 'https://user:password@reference.invalid';
  assert.throws(() => validateData(f.config, f.inventory, f.results), /without credentials/);
  f.config.sourceUrl = 'https://reference.invalid'; f.config.backend = 'automatic-real';
  assert.throws(() => validateData(f.config, f.inventory, f.results), /backend/);
});

test('PNG diff detects equality, changed pixels, size mismatch and unsafe output', async t => {
  const { PNG } = await import('pngjs');
  const f = await fixture(t);
  const a = new PNG({ width: 10, height: 10 }); a.data.fill(255);
  const left = path.join(f.root, 'left.png'), right = path.join(f.root, 'right.png'), output = path.join(f.root, 'diff.png');
  await writeFile(left, PNG.sync.write(a)); await writeFile(right, PNG.sync.write(a));
  assert.equal((await comparePng(left, right, output)).status, 'pass');
  for (let i = 0; i < a.data.length; i += 4) { a.data[i] = 0; a.data[i + 1] = 0; a.data[i + 2] = 0; }
  await writeFile(right, PNG.sync.write(a));
  assert.equal((await comparePng(left, right, path.join(f.root, 'changed.png'))).status, 'fail');
  await assert.rejects(comparePng(left, right, output), /EEXIST/);
  const different = new PNG({ width: 11, height: 10 });
  await writeFile(right, PNG.sync.write(different));
  assert.match((await comparePng(left, right, output)).reason, /dimensions/);
  await assert.rejects(comparePng(left, right, left), /overwrite/);
  await assert.rejects(comparePng(left, right, output, 2), /between/);
});

test('probe audit detects source dependencies, metadata terms, images and overflow without claiming completeness', async t => {
  const f = await fixture(t);
  const probe = { schemaVersion: 1, url: f.config.localUrl, title: 'Neutral', links: [], forms: [], images: [], resources: [], metadata: [], overflow: false };
  assert.equal(auditObservation(f.config, probe).status, 'unknown');
  f.config.blockedHosts = ['blocked.invalid']; f.config.removeTerms = ['unwanted-name'];
  probe.links = [{ href: 'https://sub.blocked.invalid/', text: 'Contact' }];
  probe.images = [{ src: 'https://reference.invalid/image.png', loaded: false }];
  probe.metadata = [{ content: 'UNWANTED-NAME' }]; probe.overflow = true;
  const report = auditObservation(f.config, probe);
  assert.equal(report.status, 'fail');
  for (const kind of ['blocked-host', 'remote-dependency', 'image-not-loaded', 'cleanup-term', 'horizontal-overflow']) assert(report.failures.some(failure => failure.kind === kind));
  probe.url = f.config.sourceUrl;
  assert.throws(() => auditObservation(f.config, probe), /local origin/);
});
