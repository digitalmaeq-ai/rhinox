// Run with:  npx tsx lib/code-studio/charts.test.ts
import assert from "node:assert/strict";

import { cleanCharts, describeChart, formatNumber, niceScale } from "./charts";
import { MAX_CHART_POINTS, MAX_CHARTS } from "./limits";

let passed = 0;
function test(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log("ok  ", name);
}

const good = { kind: "bar", title: "T", xLabel: "x", yLabel: "y", labels: ["a", "b"], values: [1, 2.5] };

test("a good chart is kept", () => {
  assert.deepEqual(cleanCharts([good]), [good]);
});

test("junk is dropped, not drawn", () => {
  const junk: unknown[] = [
    null, 5, "x", [], { kind: "pie", labels: ["a"], values: [1] },
    { ...good, values: [1] }, // length mismatch
    { ...good, values: [1, NaN] }, { ...good, values: [1, Infinity] }, { ...good, values: [1, "2"] },
    { ...good, values: [1, 1e30] }, { ...good, labels: [1, 2] }, { ...good, labels: [], values: [] },
    { ...good, labels: Array(MAX_CHART_POINTS + 1).fill("a"), values: Array(MAX_CHART_POINTS + 1).fill(1) },
  ];
  assert.deepEqual(cleanCharts(junk), []);
  assert.deepEqual(cleanCharts("no"), []);
  assert.deepEqual(cleanCharts(undefined), []);
});

test("text is cut to its limits and is never anything but text", () => {
  const [c] = cleanCharts([{ ...good, title: "t".repeat(500), xLabel: 5, yLabel: null, labels: ["<img src=x onerror=1>".repeat(5), "b"] }]);
  assert.equal(c.title.length, 60);
  assert.equal(c.xLabel, "");
  assert.equal(c.yLabel, "");
  assert.ok(c.labels[0].length <= 24);
});

test("only a few charts are kept", () => {
  assert.equal(cleanCharts(Array(20).fill(good)).length, MAX_CHARTS);
});

test("the axis range is tidy and includes zero", () => {
  assert.deepEqual(niceScale(0, 31), { min: 0, max: 40, ticks: [0, 10, 20, 30, 40] });
  assert.deepEqual(niceScale(19, 24), { min: 0, max: 30, ticks: [0, 10, 20, 30] });
  assert.equal(niceScale(-3, 8).min, -5);
  assert.deepEqual(niceScale(0, 0).ticks.length > 1, true);
  const tiny = niceScale(0, 0.0003);
  assert.ok(tiny.max >= 0.0003 && tiny.ticks.length >= 2);
});

test("numbers and descriptions read well", () => {
  assert.equal(formatNumber(3), "3");
  assert.equal(formatNumber(0.1 + 0.2), "0.3");
  assert.equal(describeChart(cleanCharts([good])[0]), 'Bar chart "T" with 2 points, from 1 to 2.5.');
});

console.log(`\n${passed} tests passed`);
