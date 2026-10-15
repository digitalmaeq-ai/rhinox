"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line, RoundedBox } from "@react-three/drei";

import { liquidColour, SAMPLES, universalColour } from "../specs/acids-bases";
import { effectivePh, observe as observeAcid, type AcidState } from "../specs/ab-model";
import { flaskColour, titrationPh } from "../specs/titration";
import { ACIDS, BASES, BURETTE_ML, equivalenceVolume, paramsOf } from "../specs/titration-chem";
import { LIQUIDS } from "../specs/electrolysis";
import { outcome, type CellState } from "../specs/electrolysis-chem";
import {
  Beaker,
  Brass,
  Burette,
  Clamp,
  ConicalFlask,
  Floor,
  GlassMat,
  Lathe,
  LiquidMat,
  RetortStand,
  Steel,
  Tag,
  Wire,
  type V3,
} from "./kit";

import type { SimState } from "../types";

type P = { state: SimState };

function Drop({ x, z = 0, from, to, colour = "#60a5fa", active }: { x: number; z?: number; from: number; to: number; colour?: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const u = (clock.elapsedTime * 0.9) % 1;
    ref.current.position.set(x, from + (to - from) * u * u, z);
    ref.current.scale.set(1 - u * 0.15, 1 + u * 0.5, 1 - u * 0.15);
    ref.current.visible = active;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 14, 14]} />
      <LiquidMat colour={colour} opacity={0.95} />
    </mesh>
  );
}

// A glass dropper: tapered tube and a rubber teat.
function Dropper({ position, colour }: { position: V3; colour: string }) {
  const tube: [number, number][] = [
    [0.025, 0],
    [0.05, 0.4],
    [0.13, 1.2],
    [0.15, 1.9],
    [0.19, 2.0],
    [0.19, 2.1],
    [0.12, 2.1],
    [0.11, 1.95],
    [0.1, 1.2],
    [0.04, 0.4],
    [0.015, 0],
  ];
  return (
    <group position={position}>
      <Lathe profile={tube} castShadow>
        <GlassMat opacity={0.3} />
      </Lathe>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.6, 12]} />
        <LiquidMat colour={colour} opacity={0.9} />
      </mesh>
      <mesh position={[0, 2.55, 0]} scale={[1, 1.35, 1]} castShadow>
        <sphereGeometry args={[0.3, 28, 22]} />
        <meshPhysicalMaterial color="#9f1d2e" roughness={0.55} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

// ---------- Acids and bases ----------
export function AcidsBases3D({ state }: P) {
  const s = state as unknown as AcidState;
  const o = observeAcid(s);
  const colour = liquidColour(s);
  const ph = effectivePh(s.sample, Number(s.dilution) || 0);
  const withIndicator = s.indicator !== "none" && s.indicator !== "meter";
  const showDrop = withIndicator && s.added;
  return (
    <group>
      <Floor size={[22, 12]} />
      <Beaker position={[0, 0, -0.4]} radius={1.6} height={3.2} liquid={0.7} colour={colour} opacity={0.93} />
      <Tag position={[0, 4.3, -0.4]}>{s.label || SAMPLES[s.sample].name}</Tag>
      {withIndicator && <Dropper position={[0, 4.4, -0.4]} colour="#a78bfa" />}
      <Drop x={0} z={-0.4} from={4.25} to={2.4} colour={showDrop ? "#a78bfa" : "#94a3b8"} active={showDrop} />
      {/* pH colour chart on a white acrylic card */}
      <mesh position={[0, 0.07, 3.6]} receiveShadow castShadow>
        <boxGeometry args={[13, 0.14, 1.5]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.25} clearcoat={1} />
      </mesh>
      {Array.from({ length: 15 }, (_, p) => (
        <RoundedBox key={p} args={[0.72, 0.14, 0.9]} radius={0.05} smoothness={3} position={[-5.6 + p * 0.8, 0.2, 3.6]} castShadow>
          <meshPhysicalMaterial color={universalColour(p)} roughness={0.25} clearcoat={0.9} />
        </RoundedBox>
      ))}
      <Tag position={[-5.6, 0.85, 3.6]}>0</Tag>
      <Tag position={[0, 0.85, 3.6]}>7</Tag>
      <Tag position={[5.6, 0.85, 3.6]}>14</Tag>
      {o.tested && (s.indicator === "universal" || s.indicator === "meter") && (
        <mesh position={[-5.6 + ph * 0.8, 0.95, 3.6]} rotation-x={Math.PI} castShadow>
          <coneGeometry args={[0.26, 0.6, 24]} />
          <Steel colour="#e2e8f0" rough={0.15} />
        </mesh>
      )}
    </group>
  );
}

// ---------- Titration ----------
export function Titration3D({ state }: P) {
  const s = state as unknown as { added: number; start?: number; indicator: string; compact?: boolean };
  const params = paramsOf(state as Record<string, number | string | boolean>);
  const ve = equivalenceVolume(params);
  const colour = flaskColour(s);
  const ph = titrationPh(s.added, params);
  const level = (BURETTE_ML - (s.start ?? 0) - s.added) / BURETTE_ML;
  const gx = (v: number) => (v / BURETTE_ML) * 4.4 - 2.2;
  const gy = (p: number) => (p / 14) * 3.2 - 1.6;
  const curve: V3[] = Array.from({ length: 101 }, (_, i) => [gx(i * 0.5), gy(titrationPh(i * 0.5, params)), 0.13]);
  const shift = s.compact ? 3.2 : 0; // centre the apparatus when the graph board is hidden
  return (
    <group>
      <Floor size={[24, 12]} />
      <group position={[shift, 0, 0]}>
        {/* retort stand, clamp and burette */}
        <RetortStand position={[-1.5, 0, -0.9]} height={8.2} />
        <Clamp position={[-2.2, 5.6, -0.9]} reach={0.9} arm={0.3} />
        <group position={[-2.2, 0, 0]}>
          <Burette position={[0, 2.55, 0]} height={4.6} level={Math.max(0.02, level)} colour="#f6b0b0" />
        </group>
        <Drop x={-2.2} from={2.5} to={0.95} colour="#fca5a5" active={s.added > 0 && s.added < BURETTE_ML} />
        <Tag position={[-3.5, 6.3, 0]}>{ACIDS[params.acid].formula} burette</Tag>
        {/* white tile and flask */}
        <mesh position={[-2.2, 0.06, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.12, 3.4]} />
          <meshPhysicalMaterial color="#f8fafc" roughness={0.2} clearcoat={1} />
        </mesh>
        <ConicalFlask position={[-2.2, 0.12, 0]} radius={1.25} height={1.95} liquid={0.42 + (s.added / BURETTE_ML) * 0.12} colour={colour} opacity={0.95} />
        <Tag position={[-2.2, -0.2, 2]}>{BASES[params.base].formula} + indicator</Tag>
      </group>
      {/* live pH graph board */}
      {!s.compact && (
        <group position={[4.6, 2.4, -0.6]} rotation-y={-0.22}>
          <RoundedBox args={[5.4, 4.2, 0.18]} radius={0.12} smoothness={4} castShadow>
            <meshPhysicalMaterial color="#0f1b33" roughness={0.3} clearcoat={0.8} metalness={0.2} />
          </RoundedBox>
          {[0, 7, 14].map((p) => (
            <Line key={p} points={[[-2.2, gy(p), 0.13], [2.2, gy(p), 0.13]]} color="#334a73" lineWidth={1} />
          ))}
          <Line points={[[-2.2, -1.6, 0.13], [-2.2, 1.7, 0.13]]} color="#93a8c9" lineWidth={2} />
          <Line points={[[-2.2, -1.6, 0.13], [2.3, -1.6, 0.13]]} color="#93a8c9" lineWidth={2} />
          <Line points={[[gx(ve), -1.6, 0.13], [gx(ve), 1.7, 0.13]]} color="#a78bfa" lineWidth={1.5} dashed dashSize={0.12} gapSize={0.1} />
          <Line points={curve} color="#38bdf8" lineWidth={3.5} />
          <mesh position={[gx(s.added), gy(ph), 0.12]}>
            <sphereGeometry args={[0.15, 20, 20]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
          <Html position={[0, 1.85, 0.12]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
            <div style={{ font: "600 13px ui-monospace, monospace", color: "#7dd3fc", whiteSpace: "nowrap" }}>
              pH {ph.toFixed(1)} · {s.added.toFixed(1)} mL
            </div>
          </Html>
          <Html position={[0, -1.95, 0.12]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
            <div style={{ font: "600 11px Inter, system-ui, sans-serif", color: "#93a8c9", whiteSpace: "nowrap" }}>Volume of {ACIDS[params.acid].formula} added (cm³)</div>
          </Html>
        </group>
      )}
    </group>
  );
}

// ---------- Electrolysis ----------
function Bubbles({ x, count, colour = "#ffffff" }: { x: number; count: number; colour?: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const u = (clock.elapsedTime * 0.5 + i / Math.max(count, 1)) % 1;
      m.position.set(x + Math.sin(i * 2.3 + u * 6) * 0.2, 0.5 + u * 2.3, Math.cos(i * 1.7) * 0.25);
    });
  });
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshPhysicalMaterial color={colour} transparent opacity={0.7} roughness={0.05} clearcoat={1} envMapIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}

// A bench power supply with a glowing voltage display and two terminals.
function PowerSupply({ position, volts }: { position: V3; volts: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[3.2, 1.5, 2]} radius={0.1} smoothness={4} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#1f2937" roughness={0.4} metalness={0.5} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.2, 1.005]}>
        <planeGeometry args={[1.6, 0.6]} />
        <meshBasicMaterial color="#04140c" />
      </mesh>
      <Html position={[0, 1.2, 1.03]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ font: "700 20px ui-monospace, monospace", color: "#4ade80", textShadow: "0 0 8px #22c55e", whiteSpace: "nowrap" }}>
          {volts.toFixed(1)} V
        </div>
      </Html>
      <mesh position={[-1.0, 0.45, 1.02]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.26, 0.2, 28]} />
        <Steel colour="#cbd5e1" rough={0.25} />
      </mesh>
      {[-0.2, 0.55].map((x, i) => (
        <group key={x} position={[x + 0.35, 0.45, 1.0]} rotation-x={Math.PI / 2}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.22, 0.22, 20]} />
            <meshStandardMaterial color={i === 0 ? "#b91c1c" : "#1d4ed8"} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.12, 14]} />
            <Brass />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Electrolysis3D({ state }: P) {
  const s = state as unknown as CellState;
  const o = outcome(s);
  const copperElectrodes = o.copperElectrodes;
  const metalCell = o.cathode.kind === "metal";
  const bubbles = o.on ? Math.round(s.current * 3.5) : 0;
  // A coating that thickens with the amount of metal deposited.
  const coat = metalCell ? 0.05 + Math.min(0.32, o.cathodeAmount * 0.6) : 0;
  const cathodeMetal = o.cathode.name === "Silver" ? "#cbd5e1" : "#d97706";
  const anodeGas = o.anode.kind === "gas";
  const anodeColour = o.anode.formula === "Cl₂" ? "#d9f99d" : "#ffffff";
  const electrode = (
    <>
      {copperElectrodes ? (
        <meshStandardMaterial color="#c2763a" metalness={1} roughness={0.28} envMapIntensity={1.5} />
      ) : (
        <meshStandardMaterial color="#2a2f38" metalness={0.3} roughness={0.7} />
      )}
    </>
  );
  return (
    <group>
      <Floor size={[24, 12]} />
      <Beaker position={[0, 0, 0]} radius={2.6} height={3.5} liquid={0.78} colour={LIQUIDS[s.electrolyte].colour} opacity={0.82} />
      {/* insulating bar resting on the rim, electrodes hanging from it */}
      <RoundedBox args={[6.6, 0.22, 0.8]} radius={0.06} position={[0, 3.62, 0]} castShadow>
        <meshPhysicalMaterial color="#374151" roughness={0.45} clearcoat={0.5} />
      </RoundedBox>
      {[-1.3, 1.3].map((x) => (
        <group key={x}>
          <mesh position={[x, 2.2, 0]} castShadow>
            <boxGeometry args={[0.2, 2.9, 1.1]} />
            {electrode}
          </mesh>
          <mesh position={[x, 3.85, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.22, 18]} />
            <Brass />
          </mesh>
        </group>
      ))}
      {o.on && metalCell && s.minutes > 0 && (
        <mesh position={[1.3 + 0.1 + coat / 2, 1.9, 0]}>
          <boxGeometry args={[coat, 2.5, 1.14]} />
          <meshStandardMaterial color={cathodeMetal} metalness={1} roughness={0.3} envMapIntensity={1.4} />
        </mesh>
      )}
      {anodeGas && <Bubbles x={-1.3} count={bubbles} colour={anodeColour} />}
      {!metalCell && <Bubbles x={1.3} count={bubbles * 2} colour="#e0f2fe" />}
      {/* supply and leads */}
      <PowerSupply position={[6, 0, -1.2]} volts={s.voltage} />
      <Wire points={[[6 - 0.2 + 0.35, 0.9, -0.2], [4.5, 3.6, -0.6], [-1.0, 4.4, -0.5], [-1.3, 3.95, 0]]} color="#dc2626" r={0.07} />
      <Wire points={[[6 + 0.55 + 0.35, 0.9, -0.2], [5.0, 3.2, 0.2], [1.8, 4.3, 0.3], [1.3, 3.95, 0]]} color="#2563eb" r={0.07} />
      <Tag position={[-1.3, 4.7, 0.6]}>Anode (+)</Tag>
      <Tag position={[1.3, 4.7, 0.6]}>Cathode (−)</Tag>
      <Tag position={[-1.3, 0.1, 2.0]} tone="#475569">{o.on ? o.anode.name : "—"}</Tag>
      <Tag position={[1.3, 0.1, 2.0]} tone="#475569">{o.on ? o.cathode.name : "—"}</Tag>
    </group>
  );
}
