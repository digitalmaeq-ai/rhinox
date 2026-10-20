"use client";

import { useRef } from "react";

import { describeChart, formatNumber, niceScale, type ChartSpec } from "@/lib/code-studio/charts";

import styles from "./CodeStudio.module.css";

const W = 640;
const H = 340;
const LEFT = 58;
const RIGHT = 16;
const TOP = 38;
const BOTTOM = 66;

function ChartView({ chart, index }: { chart: ChartSpec; index: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const count = chart.values.length;
  const scale = niceScale(Math.min(...chart.values), Math.max(...chart.values));
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const band = plotW / count;
  const y = (value: number) => TOP + plotH - ((value - scale.min) / (scale.max - scale.min)) * plotH;
  const xCenter = (i: number) => LEFT + band * (i + 0.5);
  const zero = y(0);
  const every = Math.max(1, Math.ceil(count / 12));
  const longest = Math.max(...chart.labels.map((l) => l.length));
  const tilt = longest * Math.min(count, 12) > 60;
  const showValues = count <= 12;

  function download() {
    const svg = svgRef.current;
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${text}`], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chart-${index + 1}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <figure className={styles.chart}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={describeChart(chart)}
        fontFamily="system-ui, sans-serif"
      >
        <rect width={W} height={H} fill="#ffffff" />
        <text x={W / 2} y={22} textAnchor="middle" fontSize="16" fontWeight="700" fill="#123b73">
          {chart.title}
        </text>
        {scale.ticks.map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#6b84ab" : "#dbe6f5"} strokeWidth={tick === 0 ? 1.5 : 1} />
            <text x={LEFT - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#2c4064">
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        {chart.kind === "bar" &&
          chart.values.map((value, i) => {
            const top = Math.min(y(value), zero);
            const height = Math.max(1, Math.abs(y(value) - zero));
            return (
              <g key={i}>
                <rect x={xCenter(i) - band * 0.35} y={top} width={band * 0.7} height={height} rx="3" fill="#0f6fde" />
                {showValues && (
                  <text x={xCenter(i)} y={value >= 0 ? top - 4 : top + height + 12} textAnchor="middle" fontSize="11" fill="#123b73">
                    {formatNumber(value)}
                  </text>
                )}
              </g>
            );
          })}
        {chart.kind === "line" && (
          <>
            <polyline fill="none" stroke="#0f6fde" strokeWidth="2.5" strokeLinejoin="round" points={chart.values.map((v, i) => `${xCenter(i)},${y(v)}`).join(" ")} />
            {chart.values.map((value, i) => (
              <g key={i}>
                <circle cx={xCenter(i)} cy={y(value)} r="4" fill="#0f6fde" stroke="#fff" strokeWidth="1.5" />
                {showValues && (
                  <text x={xCenter(i)} y={y(value) - 9} textAnchor="middle" fontSize="11" fill="#123b73">
                    {formatNumber(value)}
                  </text>
                )}
              </g>
            ))}
          </>
        )}
        {chart.labels.map((label, i) =>
          i % every === 0 ? (
            <text
              key={i}
              x={xCenter(i)}
              y={H - BOTTOM + 16}
              textAnchor={tilt ? "end" : "middle"}
              transform={tilt ? `rotate(-35 ${xCenter(i)} ${H - BOTTOM + 16})` : undefined}
              fontSize="11"
              fill="#2c4064"
            >
              {label}
            </text>
          ) : null,
        )}
        {chart.xLabel && (
          <text x={LEFT + plotW / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="#123b73">
            {chart.xLabel}
          </text>
        )}
        {chart.yLabel && (
          <text transform={`translate(14 ${TOP + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="#123b73">
            {chart.yLabel}
          </text>
        )}
      </svg>
      <figcaption>
        <details>
          <summary>Show the numbers</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">{chart.xLabel || "Label"}</th>
                <th scope="col">{chart.yLabel || "Value"}</th>
              </tr>
            </thead>
            <tbody>
              {chart.labels.map((label, i) => (
                <tr key={i}>
                  <td>{label}</td>
                  <td>{formatNumber(chart.values[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <button type="button" onClick={download}>
          Download as SVG
        </button>
      </figcaption>
    </figure>
  );
}

// The charts a program drew with the charts module. Drawn here from plain
// data: nothing from the program is ever used as markup.
export default function ChartsPanel({ charts }: { charts: ChartSpec[] }) {
  if (charts.length === 0) return null;
  return (
    <section className={styles.charts} aria-label="Charts drawn by your program">
      <h2 className={styles.chartsTitle}>Charts</h2>
      <div className={styles.chartGrid}>
        {charts.map((chart, i) => (
          <ChartView key={i} chart={chart} index={i} />
        ))}
      </div>
    </section>
  );
}
