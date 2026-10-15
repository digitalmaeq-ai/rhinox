import CircuitApparatus from "../dashboards/CircuitApparatus";
import CircuitDashboard from "../dashboards/CircuitDashboard";
import { defineSim } from "../types";
import { MAX_RHEO, brightnessWord, meters, solveCircuit, type CircuitState } from "./circuit-model";

// Shared with the 3D scene.
export { solveCircuit };

type SimCircuit = Required<CircuitState> & { recs: number; curved: boolean };

function Scene({ state }: { state: SimCircuit }) {
  return <CircuitApparatus state={state} />;
}

export const electricCircuit = defineSim<SimCircuit>({
  init: { closed: false, cells: 1, bulbs: 1, layout: "series", rheo: 0, recs: 0, curved: false },
  controls: [
    { type: "toggle", key: "closed", label: "Switch", onLabel: "Closed (on)", offLabel: "Open (off)" },
    { type: "slider", key: "cells", label: "Cells in the battery", min: 1, max: 4, step: 1 },
    { type: "slider", key: "bulbs", label: "Bulbs", min: 1, max: 3, step: 1 },
    {
      type: "choice",
      key: "layout",
      label: "How the bulbs are connected",
      options: [
        { value: "series", label: "In series" },
        { value: "parallel", label: "In parallel" },
      ],
    },
    { type: "slider", key: "rheo", label: "Rheostat", min: 0, max: MAX_RHEO, step: 0.5, unit: "Ω" },
  ],
  Scene,
  Dashboard: CircuitDashboard,
  sceneLabel: "A circuit with a battery, a switch, a rheostat, light bulbs, an ammeter and a voltmeter. The bulbs glow brighter as more current flows.",
  readings: (s) => {
    const r = solveCircuit(s);
    const m = meters(s);
    return [
      { label: "Battery e.m.f.", value: `${r.volts.toFixed(1)} V` },
      { label: "Ammeter", value: `${m.amps.toFixed(2)} A` },
      { label: "Voltmeter (across the bulbs)", value: `${m.volts.toFixed(2)} V` },
      { label: "Bulb brightness", value: brightnessWord(r.brightness, r.blown, s.closed), tone: r.blown ? "warn" : r.brightness > 0.85 ? "good" : "info" },
    ];
  },
  hint: (s) => {
    const r = solveCircuit(s);
    if (r.blown) return "Too much voltage: the bulbs have blown. Remove a cell, add resistance with the rheostat, or add bulbs in series to share the voltage.";
    if (!s.closed) return "The circuit is open, so no current can flow. Close the switch to complete the circuit.";
    if (s.bulbs === 1) return "One bulb. Change the rheostat to see the current and voltage change, and watch how R = V ÷ I changes as the bulb heats up.";
    return r.series
      ? "In series the bulbs share the battery's voltage, so each one is dimmer. The same current flows through all of them."
      : "In parallel every bulb gets the full voltage, so each stays bright, but the battery supplies more current.";
  },
  checks: {
    "close-the-switch": (s) => s.closed,
    "series-dimmer": (s) => s.closed && s.layout === "series" && s.bulbs >= 2 && !solveCircuit(s).blown,
    "parallel-bright": (s) => s.closed && s.layout === "parallel" && s.bulbs >= 2 && !solveCircuit(s).blown,
    "more-cells": (s) => s.closed && s.cells >= 3 && s.bulbs === 1 && s.layout === "series" && !solveCircuit(s).blown,
    "blow-a-bulb": (s) => s.closed && solveCircuit(s).blown,
    "record-six": (s) => s.recs >= 6,
    "bulb-curve": (s) => s.curved,
  },
});
