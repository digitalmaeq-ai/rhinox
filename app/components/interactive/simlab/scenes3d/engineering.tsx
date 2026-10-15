"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";

import { capacity, MATERIALS } from "../specs/bridge-builder";
import { solar, sunElevation } from "../specs/solar-energy";
import { Floor, Glow, Rod, Tag, type V3 } from "./kit";

import type { SimState } from "../types";

type P = { state: SimState };

// Real-looking structural materials.
function Structural({ material }: { material: string }) {
  if (material === "steel") return <meshStandardMaterial color="#9aa6b6" metalness={0.9} roughness={0.32} envMapIntensity={1.4} />;
  if (material === "wood") return <meshStandardMaterial color="#a8743a" roughness={0.75} />;
  return <meshStandardMaterial color="#8f949c" roughness={0.92} />;
}

const MATERIAL_COLOUR: Record<string, string> = { wood: "#a8743a", concrete: "#8f949c", steel: "#9aa6b6" };

// ---------- Bridge builder ----------
export function Bridge3D({ state }: P) {
  const s = state as unknown as { design: string; material: string; span: number; load: number };
  const { holds, ratio } = capacity(s);
  const S = 4 + s.span * 0.1;
  const half = S / 2;
  const col = MATERIAL_COLOUR[s.material] ?? "#94a3b8";
  const metal = s.material === "steel";
  const sag = holds ? Math.min(ratio, 1) * 0.35 : 0;
  const N = 16;
  const deckPoint = (u: number): V3 => [-half + u * S, -sag * (1 - Math.pow(2 * u - 1, 2)), 0];

  const cable = useMemo(() => {
    const top = 4;
    return Array.from({ length: 21 }, (_, i) => {
      const u = i / 20;
      const x = -half - 1 + u * (S + 2);
      return new THREE.Vector3(x, 0.4 + (top - 0.4) * Math.pow(Math.abs(x / (half * 0.8)), 2) * 0.9, 0);
    });
  }, [half, S]);

  const deck = holds ? (
    <group>
      {Array.from({ length: N }, (_, i) => {
        const p = deckPoint((i + 0.5) / N);
        return (
          <mesh key={i} position={[p[0], p[1] - 0.12, 0]} castShadow receiveShadow>
            <boxGeometry args={[S / N + 0.02, 0.28, 2.4]} />
            <Structural material={s.material} />
          </mesh>
        );
      })}
      {/* road surface */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[S, 0.02, 1.7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
    </group>
  ) : (
    <group>
      <group position={[-half, 0, 0]} rotation-z={-0.75}>
        <mesh position={[S / 4, -0.12, 0]} castShadow><boxGeometry args={[S / 2, 0.28, 2.4]} /><Structural material={s.material} /></mesh>
      </group>
      <group position={[half, 0, 0]} rotation-z={0.75}>
        <mesh position={[-S / 4, -0.12, 0]} castShadow><boxGeometry args={[S / 2, 0.28, 2.4]} /><Structural material={s.material} /></mesh>
      </group>
    </group>
  );

  const structure = (() => {
    if (!holds) return null;
    if (s.design === "arch") {
      return (
        <group>
          <mesh rotation-z={Math.PI} scale={[1, 0.38, 1]} castShadow>
            <torusGeometry args={[half, 0.2, 14, 56, Math.PI]} />
            <Structural material={s.material} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const u = (i + 1) / 8;
            const x = -half + u * S;
            const y = -Math.sqrt(Math.max(0, 1 - Math.pow(x / half, 2))) * half * 0.38;
            return <Rod key={i} a={[x, y, 0]} b={[x, -0.1, 0]} color={col} r={0.07} metal={metal} />;
          })}
        </group>
      );
    }
    if (s.design === "truss") {
      return (
        <group>
          {[-1, 1].map((z) => (
            <group key={z}>
              <Rod a={[-half, 1.6, z]} b={[half, 1.6, z]} color={col} r={0.1} metal={metal} />
              {Array.from({ length: 8 }, (_, i) => {
                const x1 = -half + (i * S) / 8;
                const x2 = -half + ((i + 1) * S) / 8;
                return (
                  <group key={i}>
                    <Rod a={[x1, 0, z]} b={[x1, 1.6, z]} color={col} r={0.06} metal={metal} />
                    <Rod a={i % 2 ? [x1, 0, z] : [x1, 1.6, z]} b={i % 2 ? [x2, 1.6, z] : [x2, 0, z]} color={col} r={0.06} metal={metal} />
                  </group>
                );
              })}
              <Rod a={[half, 0, z]} b={[half, 1.6, z]} color={col} r={0.06} metal={metal} />
            </group>
          ))}
        </group>
      );
    }
    if (s.design === "suspension") {
      const tw = half * 0.8;
      return (
        <group>
          {[-1, 1].map((z) => (
            <group key={z}>
              {[-tw, tw].map((x) => (
                <mesh key={x} position={[x, 2.2, z]} castShadow><boxGeometry args={[0.38, 4.4, 0.38]} /><Structural material={s.material} /></mesh>
              ))}
              {cable.slice(1).map((p, i) => (
                <Rod key={i} a={[cable[i].x, cable[i].y, z]} b={[p.x, p.y, z]} color="#dbe2ea" r={0.06} metal />
              ))}
              {Array.from({ length: 9 }, (_, i) => {
                const x = -half + ((i + 0.5) * S) / 9;
                const y = 0.4 + 3.6 * Math.pow(Math.abs(x / tw), 2) * 0.9;
                return <Rod key={i} a={[x, Math.min(y, 4.2), z]} b={[x, -sag * (1 - Math.pow(((x + half) / S) * 2 - 1, 2)), z]} color="#cbd5e1" r={0.025} metal />;
              })}
            </group>
          ))}
        </group>
      );
    }
    return null;
  })();

  const lorryY = holds ? -sag + 0.3 : -2.2;
  return (
    <group>
      <Floor size={[34, 12]} y={-2.5} />
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.5, 8]} />
        <meshPhysicalMaterial color="#1670ad" transparent opacity={0.92} roughness={0.2} clearcoat={0.1} envMapIntensity={0.25} />
      </mesh>
      {[-1, 1].map((d) => (
        <group key={d}>
          <RoundedBox args={[6, 2.4, 6.4]} radius={0.15} smoothness={3} position={[d * (half + 3), -1.2, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#6b5a43" roughness={1} />
          </RoundedBox>
          <mesh position={[d * (half + 3), 0.02, 0]} receiveShadow>
            <boxGeometry args={[6, 0.06, 6.4]} />
            <meshStandardMaterial color="#3d8a49" roughness={1} />
          </mesh>
        </group>
      ))}
      {deck}
      {structure}
      {/* delivery lorry */}
      <group position={[holds ? 0 : 1.6, lorryY, holds ? 0 : 0.5]} rotation-z={holds ? 0 : 0.5}>
        <RoundedBox args={[1.3, 0.8, 1.1]} radius={0.08} position={[0.5, 0.5, 0]} castShadow>
          <meshPhysicalMaterial color="#e63946" roughness={0.3} clearcoat={0.8} />
        </RoundedBox>
        <RoundedBox args={[0.7, 0.55, 1.1]} radius={0.08} position={[-0.75, 0.38, 0]} castShadow>
          <meshPhysicalMaterial color="#f8fafc" roughness={0.35} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[-1.04, 0.5, 0]}><boxGeometry args={[0.02, 0.25, 0.9]} /><meshStandardMaterial color="#7dd3fc" metalness={0.8} roughness={0.1} /></mesh>
        {[-0.7, 0.7].map((x) => [-0.56, 0.56].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.1, z]} rotation-x={Math.PI / 2}>
            <mesh castShadow><cylinderGeometry args={[0.24, 0.24, 0.14, 24]} /><meshStandardMaterial color="#111827" roughness={0.8} /></mesh>
            <mesh position={[0, z > 0 ? 0.075 : -0.075, 0]}><cylinderGeometry args={[0.12, 0.12, 0.02, 16]} /><meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} /></mesh>
          </group>
        )))}
        <Tag position={[0, 1.5, 0]}>{s.load} t</Tag>
      </group>
      <Tag position={[0, 5.4, 0]} tone={holds ? "#0b1f4a" : "#b91c1c"}>
        {holds ? `${s.design} bridge · ${MATERIALS[s.material].name} · ${s.span} m` : "The bridge has collapsed!"}
      </Tag>
    </group>
  );
}

// Solar cells drawn as a real panel: dark silicon with silver grid lines.
function panelTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, "#1b3a8a");
  grad.addColorStop(1, "#0f2562");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(210,220,240,0.55)";
  g.lineWidth = 2;
  for (let i = 0; i <= 6; i++) {
    g.beginPath(); g.moveTo(i * (256 / 6), 0); g.lineTo(i * (256 / 6), 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * (256 / 6)); g.lineTo(256, i * (256 / 6)); g.stroke();
  }
  g.strokeStyle = "rgba(210,220,240,0.22)";
  g.lineWidth = 1;
  for (let i = 0; i < 6 * 4; i++) {
    const x = i * (256 / 24);
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// ---------- Solar energy ----------
export function Solar3D({ state }: P) {
  const s = state as unknown as { panels: number; hour: number; tilt: number; cloud: number };
  const r = solar(s);
  const e = sunElevation(s.hour);
  const er = (e * Math.PI) / 180;
  const Rr = 13;
  const t = (s.hour - 6) / 12;
  const sun: V3 = [Rr * Math.cos(er) * 0.9 + 1, Math.max(-1, Rr * Math.sin(er)) + 0.5, -Rr * 0.6 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)))];
  const night = e <= 0;
  const lights = Math.min(8, Math.floor(r.power / 150));
  const roof = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(-2.1, 0); sh.lineTo(2.1, 0); sh.lineTo(0, 1.6); sh.closePath();
    return new THREE.ExtrudeGeometry(sh, { depth: 3.9, bevelEnabled: false });
  }, []);
  const cells = useMemo(() => panelTexture(), []);
  const cloudOpacity = 0.25 + (s.cloud / 100) * 0.65;
  const sky = night ? "#0b1226" : s.cloud > 60 ? "#9fb6cc" : "#8fcaf0";
  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 30, 70]} />
      <Environment resolution={128} frames={1} environmentIntensity={night ? 0.15 : 0.9}>
        <Lightformer form="rect" intensity={night ? 0.4 : 4} position={[0, 10, 0]} scale={[30, 30, 1]} rotation-x={Math.PI / 2} color={night ? "#8aa2ff" : "#ffffff"} />
        <Lightformer form="rect" intensity={night ? 0.2 : 1.6} position={[0, 4, 12]} scale={[24, 8, 1]} color={night ? "#6b7fd6" : "#cfe8ff"} />
      </Environment>
      <ambientLight intensity={night ? 0.25 : 0.55} />
      <directionalLight position={sun} intensity={night ? 0.15 : 2.1 * (1 - 0.6 * (s.cloud / 100))} color="#fff1d6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-camera-far={44} shadow-bias={-0.0004} />
      {/* diorama plinth */}
      <RoundedBox args={[17, 0.6, 11]} radius={0.15} smoothness={4} position={[0, -0.3, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#3d8a49" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[17.2, 0.5, 11.2]} radius={0.15} smoothness={4} position={[0, -0.85, 0]}>
        <meshStandardMaterial color="#5b4630" roughness={1} />
      </RoundedBox>
      <mesh position={sun}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color={night ? "#e8eef7" : "#ffe27a"} toneMapped={false} />
      </mesh>
      {!night && <Glow position={sun} size={7} colour="#ffd36b" opacity={0.6 * (1 - 0.7 * (s.cloud / 100))} />}
      {/* house */}
      <group position={[-3.2, 0, 0]}>
        <RoundedBox args={[3.8, 2.2, 3.6]} radius={0.05} position={[0, 1.1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#f1f3f6" roughness={0.85} />
        </RoundedBox>
        <mesh geometry={roof} position={[0, 2.2, -1.95]} castShadow><meshStandardMaterial color="#a8442a" roughness={0.85} /></mesh>
        <mesh position={[1.1, 3.3, -0.4]} castShadow><boxGeometry args={[0.45, 1.0, 0.45]} /><meshStandardMaterial color="#8a3a22" roughness={0.9} /></mesh>
        <mesh position={[0, 0.85, 1.81]}><boxGeometry args={[0.7, 1.3, 0.06]} /><meshStandardMaterial color="#7c4a23" roughness={0.7} /></mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 1.3, 1.81]}>
            <boxGeometry args={[0.7, 0.6, 0.04]} />
            <meshStandardMaterial color={night ? "#ffd75e" : "#9cd3f5"} emissive={night ? "#ffb02e" : "#000000"} emissiveIntensity={night ? 1.4 : 0} metalness={night ? 0 : 0.6} roughness={0.12} toneMapped={!night} />
          </mesh>
        ))}
      </group>
      {/* panels on a ground rack */}
      {Array.from({ length: Math.min(s.panels, 10) }, (_, i) => (
        <group key={i} position={[2.4 + Math.floor(i / 5) * 1.9, 0.7, -3.4 + (i % 5) * 1.7]}>
          <mesh position={[0, -0.35, 0]} castShadow><boxGeometry args={[0.08, 0.7, 0.08]} /><meshStandardMaterial color="#9aa6b6" metalness={0.9} roughness={0.35} /></mesh>
          <group rotation-z={-(s.tilt * Math.PI) / 180}>
            <mesh castShadow>
              <boxGeometry args={[1.56, 0.07, 1.46]} />
              <meshStandardMaterial color="#c8d0dc" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.041, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[1.44, 1.34]} />
              <meshPhysicalMaterial map={cells} metalness={0.4} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.6} emissive="#1d4ed8" emissiveIntensity={r.power > 0 ? 0.18 : 0} />
            </mesh>
          </group>
        </group>
      ))}
      {/* clouds */}
      {s.cloud > 10 && [[-4, 6.5, -2], [2, 7.2, 1], [6, 6.2, -3], [0, 8, -4]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {[[-0.9, 0, 0.8], [0, 0.35, 1], [0.9, 0, 0.8], [0.3, -0.1, 0.9]].map(([dx, dy, k], j) => (
            <mesh key={j} position={[dx, dy, 0]} scale={k}><sphereGeometry args={[0.9, 20, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={cloudOpacity} /></mesh>
          ))}
        </group>
      ))}
      {/* lights powered by the panels */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[-5.8 + i * 0.7, 0, 3.6]}>
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.12, 0.14, 0.4, 14]} /><meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.4} /></mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color={i < lights ? "#fff3b0" : "#9ca3af"} emissive={i < lights ? "#ffc933" : "#000000"} emissiveIntensity={i < lights ? 1.8 : 0} toneMapped={i >= lights} />
          </mesh>
        </group>
      ))}
      <Tag position={[-3.4, 1.4, 3.8]} tone="#0b1f4a">{r.power} W</Tag>
    </>
  );
}
