// Charts a learner's program draws with the `charts` module. The Python worker
// only collects plain data (a kind, some labels and numbers). The page checks
// that data again here and draws the picture itself as SVG, so nothing from the
// program is ever treated as markup.
import { MAX_CHARTS, MAX_CHART_POINTS, MAX_CHART_TEXT, MAX_LABEL_CHARS } from "./limits";

export type ChartKind = "bar" | "line";

export interface ChartSpec {
  kind: ChartKind;
  title: string;
  xLabel: string;
  yLabel: string;
  labels: string[];
  values: number[];
}

const MAX_NUMBER = 1e15;

/** Turns whatever came from the worker into charts that are safe to draw. Anything wrong is left out. */
export function cleanCharts(input: unknown): ChartSpec[] {
  if (!Array.isArray(input)) return [];
  const charts: ChartSpec[] = [];
  for (const item of input) {
    if (charts.length >= MAX_CHARTS) break;
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    if (c.kind !== "bar" && c.kind !== "line") continue;
    if (!Array.isArray(c.labels) || !Array.isArray(c.values)) continue;
    const count = c.values.length;
    if (count < 1 || count > MAX_CHART_POINTS || c.labels.length !== count) continue;
    if (!c.values.every((v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= MAX_NUMBER)) continue;
    if (!c.labels.every((l) => typeof l === "string")) continue;
    const text = (value: unknown, limit: number) => (typeof value === "string" ? value.slice(0, limit) : "");
    charts.push({
      kind: c.kind,
      title: text(c.title, MAX_CHART_TEXT),
      xLabel: text(c.xLabel, MAX_CHART_TEXT),
      yLabel: text(c.yLabel, MAX_CHART_TEXT),
      labels: (c.labels as string[]).map((l) => l.slice(0, MAX_LABEL_CHARS)),
      values: c.values as number[],
    });
  }
  return charts;
}

/** A tidy range and tick marks for the up-and-down axis. The range always includes 0. */
export function niceScale(low: number, high: number, wanted = 5): { min: number; max: number; ticks: number[] } {
  let min = Math.min(0, low);
  let max = Math.max(0, high);
  if (min === max) max = min + 1;
  const rough = (max - min) / Math.max(1, wanted - 1);
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const fraction = rough / power;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i <= Math.round((max - min) / step); i += 1) ticks.push(Number((min + i * step).toPrecision(12)));
  return { min, max, ticks };
}

/** A number as short text for the axis and the data table. */
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toPrecision(6)));
}

/** The chart as a one-sentence description, for people who cannot see it. */
export function describeChart(chart: ChartSpec): string {
  const kind = chart.kind === "bar" ? "Bar chart" : "Line chart";
  const name = chart.title ? ` "${chart.title}"` : "";
  return `${kind}${name} with ${chart.values.length} ${chart.values.length === 1 ? "point" : "points"}, from ${formatNumber(Math.min(...chart.values))} to ${formatNumber(Math.max(...chart.values))}.`;
}
