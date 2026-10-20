import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { changeSinceLaunch, progressPct, valueAtPct, youtubeUrl } from './progress.js';

const kpis = JSON.parse(readFileSync(new URL('../data/kpis.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(kpis.map((k) => [k.id, k]));

test('dataset has 24 commitments', () => {
  assert.equal(kpis.length, 24);
});

test('increasing metric: cash aid 500 -> 1000 MAD', () => {
  const k = byId['kpi-5'];
  assert.equal(progressPct(k, 500), 0);
  assert.equal(progressPct(k, 750), 50);
  assert.equal(progressPct(k, 1000), 100);
});

test('decreasing metric: public debt 71% -> 62%', () => {
  const k = byId['kpi-24'];
  assert.equal(progressPct(k, 71), 0);
  assert.equal(progressPct(k, 62), 100);
  assert.ok(Math.abs(progressPct(k, 66.5) - 50) < 1e-9);
});

test('decreasing metric: dropouts 300,000 -> 0', () => {
  const k = byId['kpi-9'];
  assert.equal(progressPct(k, 300000), 0);
  assert.equal(progressPct(k, 150000), 50);
  assert.equal(progressPct(k, 0), 100);
});

test('clamped to 0..100 both ways', () => {
  assert.equal(progressPct(byId['kpi-5'], 400), 0);
  assert.equal(progressPct(byId['kpi-5'], 1200), 100);
  assert.equal(progressPct(byId['kpi-24'], 75), 0);
  assert.equal(progressPct(byId['kpi-24'], 55), 100);
});

test('launch = 0% and end of mandate = 100% for every KPI', () => {
  for (const k of kpis) {
    assert.equal(progressPct(k, k.baseline), 0, k.id);
    assert.equal(progressPct(k, k.target), 100, k.id);
  }
});

test('simulator value round-trips to its percentage', () => {
  for (const k of kpis) {
    assert.ok(Math.abs(progressPct(k, valueAtPct(k, 40)) - 40) < 0.5, k.id);
  }
});

test('change since launch starts at zero for every KPI', () => {
  for (const k of kpis) {
    const c = changeSinceLaunch(k, k.baseline);
    assert.equal(c.delivered, 0, k.id);
    assert.equal(c.backwards, false, k.id);
  }
});

test('change since launch: pension and debt', () => {
  assert.deepEqual(changeSinceLaunch(byId['kpi-6'], 2000), { delivered: 500, promised: 1500, backwards: false });
  assert.deepEqual(changeSinceLaunch(byId['kpi-24'], 68), { delivered: -3, promised: -9, backwards: false });
  assert.equal(changeSinceLaunch(byId['kpi-24'], 73).backwards, true);
  assert.equal(changeSinceLaunch(byId['kpi-5'], 450).backwards, true);
  assert.equal(changeSinceLaunch(byId['kpi-17'], 0.9).delivered, 0.6);
});

test('video timestamp link', () => {
  assert.equal(youtubeUrl('iTP6pC-r9_o', 1053), 'https://www.youtube.com/watch?v=iTP6pC-r9_o&t=17m33s');
  assert.equal(youtubeUrl('iTP6pC-r9_o', 2514), 'https://www.youtube.com/watch?v=iTP6pC-r9_o&t=41m54s');
});

test('every timestamp matches its seconds field', () => {
  for (const k of kpis) {
    const [h, m, s] = k.timestamp.split(':').map(Number);
    assert.equal(h * 3600 + m * 60 + s, k.seconds, k.id);
  }
});
