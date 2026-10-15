"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

import { photoRate } from "../specs/photosynthesis";
import { cardiac } from "../specs/circulatory-system";
import { outcome, FOODS } from "../specs/food-tests";
import type { FoodState } from "../specs/food-model";
import { Arrow, Beaker, Brass, Floor, Flow, Glow, GlassMat, Lathe, Steel, Tag, TestTube, type V3 } from "./kit";

import type { SimState } from "../types";

type P = { state: SimState };

// ---------- Photosynthesis ----------
function Rising({ count, x0 = 0, spread = 0.7, bottom = 0.5, top = 2.8, size = 0.1, colour = "#ffffff", speed = 0.45 }: { count: number; x0?: number; spread?: number; bottom?: number; top?: number; size?: number; colour?: string; speed?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const u = (clock.elapsedTime * speed + i / Math.max(count, 1)) % 1;
      m.position.set(x0 + Math.sin(i * 3.1 + u * 5) * spread, bottom + u * (top - bottom), Math.cos(i * 2.3) * spread * 0.6);
      m.scale.setScalar(0.6 + u * 0.6);
    });
  });
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[size, 14, 14]} />
          <meshPhysicalMaterial color={colour} transparent opacity={0.7} roughness={0.04} clearcoat={1} envMapIntensity={2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// Pondweed: curved stems wrapped in whorls of small leaves (one instanced mesh).
function Pondweed() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const stems = useMemo(
    () => [
      { x: -0.45, lean: -0.16, h: 2.3 },
      { x: 0.05, lean: 0.06, h: 2.7 },
      { x: 0.5, lean: 0.2, h: 2.1 },
    ],
    [],
  );
  const total = stems.length * 15 * 4;
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    let n = 0;
    stems.forEach((st, si) => {
      for (let k = 0; k < 15; k++) {
        const t = k / 14;
        const y = 0.5 + t * st.h;
        const cx = st.x + st.lean * t * st.h;
        for (let j = 0; j < 4; j++) {
          const a = (j / 4) * Math.PI * 2 + k * 0.9 + si;
          const len = 0.42 * (1 - t * 0.35);
          e.set(0.5, a, 0.35);
          q.setFromEuler(e);
          m.compose(
            new THREE.Vector3(cx + Math.cos(a) * len * 0.5, y, Math.sin(a) * len * 0.5),
            q,
            new THREE.Vector3(len, 0.045, 0.1),
          );
          mesh.setMatrixAt(n++, m);
        }
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [stems]);
  return (
    <group>
      {stems.map((st, i) => (
        <mesh key={i} position={[st.x + (st.lean * st.h) / 2, 0.5 + st.h / 2, 0]} rotation-z={-st.lean} castShadow>
          <cylinderGeometry args={[0.03, 0.04, st.h, 8]} />
          <meshStandardMaterial color="#2f7a3a" roughness={0.7} />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, total]} castShadow>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshPhysicalMaterial color="#3fbf55" roughness={0.45} clearcoat={0.5} emissive="#0f5a22" emissiveIntensity={0.25} />
      </instancedMesh>
    </group>
  );
}

// A desk lamp: weighted base, jointed arm and a shaded head.
function DeskLamp({ position, level }: { position: V3; level: number }) {
  const lit = level > 0.02;
  return (
    <group position={position}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.28, 32]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 2.9, 14]} />
        <Steel colour="#cbd5e1" rough={0.2} />
      </mesh>
      <mesh position={[0, 3.05, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <Steel colour="#9aa5b4" />
      </mesh>
      <group position={[0, 3.05, 0]} rotation-z={-Math.PI / 2 + 0.25}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
          <Steel colour="#cbd5e1" rough={0.2} />
        </mesh>
        <group position={[0, 1.25, 0]} rotation-z={Math.PI / 2 - 0.1}>
          <mesh castShadow>
            <coneGeometry args={[0.75, 1.0, 36, 1, true]} />
            <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.28, 20, 20]} />
            <meshStandardMaterial color={lit ? "#fff3b0" : "#9ca3af"} emissive={lit ? "#ffd84d" : "#000000"} emissiveIntensity={lit ? level * 2.2 : 0} toneMapped={!lit} />
          </mesh>
        </group>
      </group>
      {lit && <Glow position={[0.7, 3.55, 0]} size={2 + level * 3} opacity={0.2 + level * 0.5} />}
    </group>
  );
}

function Thermometer({ position, temp }: { position: V3; temp: number }) {
  const col = ((temp - 5) / 40) * 2.6 + 0.2;
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.2, 28]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3.4, 20]} />
        <GlassMat opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.45 + col / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.055, col, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.2, 18, 18]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.6} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0.9 + i * 0.26, 0.15]}>
          <boxGeometry args={[i % 2 ? 0.1 : 0.16, 0.012, 0.01]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      ))}
    </group>
  );
}

export function Photosynthesis3D({ state }: P) {
  const s = state as unknown as { light: number; co2: number; temp: number };
  const rate = photoRate(s);
  const water = s.temp > 35 ? "#f3d6c1" : s.temp < 12 ? "#c5dcf3" : "#b6e2ee";
  const sun = s.light / 100;
  const funnel: [number, number][] = [
    [0.1, 3.9],
    [0.1, 3.0],
    [0.9, 1.0],
    [0.95, 0.9],
    [0.88, 0.9],
    [0.07, 3.0],
    [0.07, 3.9],
  ];
  return (
    <group>
      <Floor size={[24, 12]} />
      <DeskLamp position={[-5, 0, 0]} level={sun} />
      {sun > 0 && <pointLight position={[-3.8, 3.4, 0]} intensity={sun * 70} distance={16} color="#ffe9a8" />}
      <Tag position={[-5, 4.9, 0]}>Lamp {s.light}%</Tag>
      <Beaker position={[0, 0, 0]} radius={1.9} height={4} liquid={0.85} colour={water} opacity={0.6} />
      <Pondweed />
      {/* inverted funnel and collecting tube, as in the school experiment */}
      <Lathe profile={funnel} castShadow renderOrder={2}>
        <GlassMat opacity={0.25} />
      </Lathe>
      <Rising count={Math.round(rate / 6)} x0={0.1} bottom={0.7} top={3.3} />
      <Rising count={Math.round(s.co2 / 10)} x0={0} spread={1.4} bottom={0.4} top={3.2} size={0.05} colour="#94a3b8" speed={0.12} />
      <Tag position={[0, 5.2, 0]}>Oxygen bubbles: {(rate / 10).toFixed(1)}/s</Tag>
      <Thermometer position={[4.2, 0, 0]} temp={s.temp} />
      <Tag position={[4.2, 4.1, 0]}>{s.temp}°C</Tag>
    </group>
  );
}

// ---------- Circulatory system ----------
function vesselPoints(c: THREE.CatmullRomCurve3) {
  return c.getPoints(30).map((p) => [p.x, p.y, p.z] as V3);
}

function Vessel({ curve, colour, on, speed }: { curve: THREE.CatmullRomCurve3; colour: string; on: boolean; speed: number }) {
  const points = useMemo(() => vesselPoints(curve), [curve]);
  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 48, 0.16, 14, false]} />
        <meshPhysicalMaterial color={colour} transparent opacity={on ? 0.8 : 0.2} roughness={0.25} clearcoat={0.9} emissive={colour} emissiveIntensity={on ? 0.25 : 0} />
      </mesh>
      <Flow points={points} count={10} speed={speed} color="#ffe4e6" size={0.1} active={on} />
    </group>
  );
}

export function Circulatory3D({ state }: P) {
  const s = state as unknown as { activity: string; focus: string };
  const a = cardiac(s);
  const lungs = s.focus === "all" || s.focus === "lungs";
  const body = s.focus === "all" || s.focus === "body";
  const heart = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!heart.current) return;
    const beat = Math.pow(Math.max(0, Math.sin(clock.elapsedTime * (a.bpm / 60) * Math.PI * 2)), 6);
    heart.current.scale.setScalar(1 + beat * 0.14);
  });
  const speed = a.bpm / 160;

  const curves = useMemo(() => {
    const mk = (pts: V3[]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    return {
      toLungs: mk([[-0.5, 0.3, 0], [-1.2, 1.8, 0.2], [-1.4, 3.2, 0], [-1.2, 4.3, 0]]),
      fromLungs: mk([[1.2, 4.3, 0], [1.5, 3.2, 0], [1.2, 1.8, 0.2], [0.5, 0.3, 0]]),
      toBody: mk([[0.7, -0.4, 0], [2.4, -1.2, 0.2], [3.0, -3.4, 0], [1.2, -5.0, 0]]),
      fromBody: mk([[-1.2, -5.0, 0], [-3.0, -3.4, 0], [-2.4, -1.2, 0.2], [-0.7, -0.4, 0]]),
    };
  }, []);

  return (
    <group>
      <Floor size={[24, 14]} y={-6.2} />
      {/* windpipe and lungs */}
      <mesh position={[0, 5.7, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2.2, 16]} />
        <meshPhysicalMaterial color="#fecdd3" roughness={0.4} clearcoat={0.6} />
      </mesh>
      {[-1, 1].map((d) => (
        <group key={d} position={[d * 1.62, 4.8, 0]}>
          <mesh scale={[0.78, 1.15, 0.6]} castShadow>
            <sphereGeometry args={[1, 40, 32]} />
            <meshPhysicalMaterial color="#f08cae" roughness={0.38} clearcoat={0.7} clearcoatRoughness={0.25} transparent opacity={lungs ? 0.96 : 0.35} />
          </mesh>
          <mesh position={[d * -0.15, -0.35, 0.18]} scale={[0.6, 0.8, 0.45]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshPhysicalMaterial color="#e9789f" roughness={0.4} clearcoat={0.6} transparent opacity={lungs ? 0.9 : 0.3} />
          </mesh>
        </group>
      ))}
      <Tag position={[0, 7.0, 0]}>Lungs</Tag>
      {/* the rest of the body */}
      <mesh position={[0, -5.0, 0]} rotation-z={Math.PI / 2} castShadow>
        <capsuleGeometry args={[0.85, 2.6, 12, 28]} />
        <meshPhysicalMaterial color="#b5a3f2" roughness={0.4} clearcoat={0.6} transparent opacity={body ? 0.95 : 0.35} />
      </mesh>
      <Tag position={[0, -6.3, 0]}>Body</Tag>
      {/* the heart: two pumps, glossy like living tissue */}
      <group ref={heart} position={[0, -0.1, 0]}>
        <mesh position={[-0.55, 0, 0]} castShadow>
          <sphereGeometry args={[0.85, 40, 32]} />
          <meshPhysicalMaterial color="#2f6fe0" roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0.55, 0, 0]} castShadow>
          <sphereGeometry args={[0.95, 40, 32]} />
          <meshPhysicalMaterial color="#d3202f" roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.2} />
        </mesh>
      </group>
      <Tag position={[-2.4, 0.3, 0]} tone="#1d4ed8">Right side</Tag>
      <Tag position={[2.4, 0.3, 0]} tone="#b91c1c">Left side</Tag>
      <Vessel speed={speed} curve={curves.toLungs} colour="#3b82f6" on={lungs} />
      <Vessel speed={speed} curve={curves.fromLungs} colour="#ef4444" on={lungs} />
      <Vessel speed={speed} curve={curves.toBody} colour="#ef4444" on={body} />
      <Vessel speed={speed} curve={curves.fromBody} colour="#3b82f6" on={body} />
      <Tag position={[4.4, 1.8, 0]}>{a.bpm} beats/min</Tag>
    </group>
  );
}

// ---------- Food tests ----------
export function FoodTests3D({ state }: P) {
  const s = state as unknown as FoodState & { label?: string };
  const o = outcome({ ...s, drops: Number(s.drops) || 0 });
  const heating = s.test === "benedict" && s.heat && s.added;
  return (
    <group>
      <Floor size={[24, 12]} />
      {/* wooden test-tube rack */}
      <RoundedBox args={[9, 0.3, 2.6]} radius={0.06} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#b98a55" roughness={0.6} />
      </RoundedBox>
      {[-4.2, 4.2].map((x) => (
        <RoundedBox key={x} args={[0.3, 3.2, 0.5]} radius={0.05} position={[x, 1.7, -0.9]} castShadow>
          <meshStandardMaterial color="#a67a47" roughness={0.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[9, 0.26, 0.5]} radius={0.05} position={[0, 3.1, -0.9]} castShadow>
        <meshStandardMaterial color="#a67a47" roughness={0.6} />
      </RoundedBox>
      <TestTube position={[-2.6, 0.3, 0]} radius={0.55} height={3.2} fill={0.55} colour={FOODS[s.food]?.colour ?? "#f3d9a6"} />
      {/* the test tube that receives the reagent, in a water bath when heated */}
      {heating && (
        <group position={[2.6, 0, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.55, 0.4, 36]} />
            <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.41, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.9, 1.4, 48]} />
            <meshStandardMaterial color="#ff7a2f" emissive="#ff5a1f" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <Beaker position={[0, 0.4, 0]} radius={1.1} height={2.3} liquid={0.7} colour="#bfe3f7" opacity={0.55} marks={false} />
          <pointLight position={[0, 0.9, 0]} intensity={8} distance={6} color="#fb923c" />
        </group>
      )}
      <TestTube position={[2.6, heating ? 0.7 : 0.3, 0]} radius={0.55} height={3.2} fill={0.55} colour={o.colour} cloudy={s.test === "emulsion" && s.added && o.positive} />
      {/* rack clips */}
      {[-2.6, ...(heating ? [] : [2.6])].map((x) => (
        <mesh key={x} position={[x, 2.4, -0.2]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.62, 0.05, 10, 32]} />
          <Steel colour="#9aa5b4" />
        </mesh>
      ))}
      {/* reagent bottle: amber glass with a dropper cap */}
      <group position={[0, 0.3, 1.1]}>
        <Lathe profile={[[0, 0], [0.55, 0], [0.62, 0.12], [0.62, 1.2], [0.45, 1.55], [0.22, 1.7], [0.22, 1.95], [0.15, 1.95], [0.15, 1.7], [0.38, 1.5], [0.54, 1.18], [0.54, 0.16], [0, 0.1]]} castShadow>
          <meshPhysicalMaterial color="#b45309" transparent opacity={0.65} roughness={0.08} clearcoat={1} envMapIntensity={1.5} side={THREE.DoubleSide} />
        </Lathe>
        <mesh position={[0, 1.2, 0]} scale={[1, 1, 1]}>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 28]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.3, 0]} scale={[1, 1.3, 1]} castShadow>
          <sphereGeometry args={[0.25, 20, 16]} />
          <meshPhysicalMaterial color="#111827" roughness={0.5} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.21, 0.24, 0.3, 18]} />
          <Brass />
        </mesh>
      </group>
      <Arrow from={[-1.3, 2.0, 0.2]} to={[1.3, 2.0, 0.2]} color="#38bdf8" r={0.05} />
      <Tag position={[-2.6, 4.2, 0]}>{s.label || FOODS[s.food].name}</Tag>
      <Tag position={[2.6, 4.2, 0]}>After the test</Tag>
      <Tag position={[0, 3.6, 0]} tone="#475569">{o.positive ? "Positive" : "Negative"}</Tag>
      <Tag position={[0, -0.7, 2.2]} tone="#475569">{o.text}</Tag>
    </group>
  );
}
