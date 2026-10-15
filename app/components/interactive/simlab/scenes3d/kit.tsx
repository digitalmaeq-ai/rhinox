"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export type V3 = [number, number, number];

/* =====================================================================
   Materials: real-looking glass, metal, plastic and liquid.
   They rely on the studio reflections set up in Stage3D.
   ===================================================================== */

export function GlassMat({ tint = "#e3f2ff", opacity = 0.2 }: { tint?: string; opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color={tint}
      transparent
      opacity={opacity}
      roughness={0.03}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.03}
      envMapIntensity={1.8}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

export function LiquidMat({ colour, opacity = 0.9 }: { colour: string; opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color={colour}
      transparent
      opacity={opacity}
      roughness={0.08}
      clearcoat={0.8}
      clearcoatRoughness={0.1}
      envMapIntensity={1.1}
      depthWrite={false}
    />
  );
}

export function Steel({ colour = "#b7c0cc", rough = 0.28 }: { colour?: string; rough?: number }) {
  return <meshStandardMaterial color={colour} metalness={0.95} roughness={rough} envMapIntensity={1.4} />;
}

export function Brass({ rough = 0.3 }: { rough?: number }) {
  return <meshStandardMaterial color="#d6a64a" metalness={1} roughness={rough} envMapIntensity={1.4} />;
}

export function Plastic({ colour, rough = 0.45 }: { colour: string; rough?: number }) {
  return <meshPhysicalMaterial color={colour} roughness={rough} clearcoat={0.4} clearcoatRoughness={0.4} />;
}

/* =====================================================================
   Building blocks
   ===================================================================== */

// A surface of revolution from a [radius, height] profile (glassware, bulbs…).
export function Lathe({
  profile,
  segments = 56,
  children,
  ...props
}: {
  profile: [number, number][];
  segments?: number;
  children: React.ReactNode;
} & Omit<React.ComponentProps<"mesh">, "children">) {
  const key = JSON.stringify(profile);
  const geometry = useMemo(
    () => new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segments),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, segments],
  );
  return (
    <mesh geometry={geometry} {...props}>
      {children}
    </mesh>
  );
}

// A cylinder wire/rod between two points.
export function Rod({ a, b, color = "#475569", r = 0.05, opacity = 1, metal = false }: { a: V3; b: V3; color?: string; r?: number; opacity?: number; metal?: boolean }) {
  const { pos, len, quat } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const length = dir.length() || 0.0001;
    return {
      pos: va.clone().add(vb).multiplyScalar(0.5),
      len: length,
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
    };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[r, r, len, 14]} />
      {metal ? (
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} envMapIntensity={1.3} />
      ) : (
        <meshPhysicalMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.45} clearcoat={0.5} />
      )}
    </mesh>
  );
}

// Small glowing particles that travel along a polyline (current, blood, ...).
export function Flow({ points, count = 10, speed = 0.1, color = "#facc15", size = 0.09, active = true }: { points: V3[]; count?: number; speed?: number; color?: string; size?: number; active?: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const { pts, lens, total } = useMemo(() => {
    const v = points.map((p) => new THREE.Vector3(...p));
    const l = v.slice(1).map((p, i) => p.distanceTo(v[i]));
    return { pts: v, lens: l, total: l.reduce((x, y) => x + y, 0) || 1 };
  }, [points]);

  useFrame(({ clock }) => {
    if (!active) return;
    const t = clock.elapsedTime * speed;
    refs.current.forEach((m, i) => {
      if (!m) return;
      let d = ((t + i / count) % 1) * total;
      let k = 0;
      while (k < lens.length - 1 && d > lens[k]) {
        d -= lens[k];
        k++;
      }
      const f = lens[k] ? Math.min(1, d / lens[k]) : 0;
      m.position.lerpVectors(pts[k], pts[k + 1], f);
    });
  });

  if (!active) return null;
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// The lab bench: a dark epoxy worktop with a polished edge, sitting in an
// endless studio floor that fades into the background.
export function Floor({ size = [24, 14] as [number, number], y = 0, color = "#141c2c" }: { size?: [number, number]; y?: number; color?: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color="#0a101d" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.18, 0]} receiveShadow castShadow>
        <boxGeometry args={[size[0], 0.36, size[1]]} />
        <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.05} clearcoat={0.35} clearcoatRoughness={0.35} envMapIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.375, 0]}>
        <boxGeometry args={[size[0] - 0.4, 0.06, size[1] - 0.4]} />
        <meshStandardMaterial color="#6b7a90" metalness={0.9} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Tag({ position, children, tone = "#0b1f4a" }: { position: V3; children: React.ReactNode; tone?: string }) {
  return (
    <Html position={position} center distanceFactor={11} style={{ pointerEvents: "none" }}>
      <div
        style={{
          font: "600 12.5px Inter, system-ui, sans-serif",
          color: tone,
          whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.92)",
          padding: "3px 9px",
          borderRadius: 999,
          boxShadow: "0 2px 10px rgba(2,8,23,0.35)",
          letterSpacing: "0.01em",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

// A soft halo for lamps and bulbs. Additive, so it reads as light.
export function Glow({ position = [0, 0, 0] as V3, size = 3, colour = "#fde68a", opacity = 0.6 }: { position?: V3; size?: number; colour?: string; opacity?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  if (opacity <= 0.01) return null;
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={texture} color={colour} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

/* =====================================================================
   Laboratory equipment
   ===================================================================== */

// Graduation marks on the front of a glass vessel.
function Marks({ radius, from, to, count, long = 0.4 }: { radius: number; from: number; to: number; count: number; long?: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const y = from + ((to - from) * i) / Math.max(count - 1, 1);
        const w = i % 2 === 0 ? long : long * 0.55;
        const z = Math.sqrt(Math.max(radius * radius - (w / 2) * (w / 2), 0.0001)) + 0.004;
        return (
          <mesh key={i} position={[0, y, z]}>
            <boxGeometry args={[w, 0.014, 0.004]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

// Glass beaker, thick base, spout and graduations, with a liquid level.
export function Beaker({ position = [0, 0, 0] as V3, radius = 1.5, height = 3, liquid = 0.7, colour = "#bfe3f7", opacity = 0.85, marks = true }: { position?: V3; radius?: number; height?: number; liquid?: number; colour?: string; opacity?: number; marks?: boolean }) {
  const r = radius;
  const wall = 0.07;
  const shell: [number, number][] = [
    [0, 0],
    [r - 0.12, 0],
    [r - 0.02, 0.08],
    [r, 0.2],
    [r, height],
    [r + 0.05, height + 0.04],
    [r - wall + 0.02, height + 0.01],
    [r - wall, height - 0.04],
    [r - wall, 0.28],
    [r - wall - 0.08, 0.2],
    [0, 0.17],
  ];
  const fill = height * liquid;
  const inner = r - wall - 0.01;
  const liq: [number, number][] = [
    [0, 0.19],
    [inner - 0.08, 0.19],
    [inner, 0.3],
    [inner, 0.19 + fill],
    [0, 0.19 + fill],
  ];
  return (
    <group position={position}>
      <Lathe profile={shell} castShadow>
        <GlassMat />
      </Lathe>
      {liquid > 0 && (
        <>
          <Lathe profile={liq} renderOrder={-1}>
            <LiquidMat colour={colour} opacity={opacity} />
          </Lathe>
          <mesh position={[0, 0.19 + fill + 0.002, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[inner, 48]} />
            <meshPhysicalMaterial color={colour} transparent opacity={Math.min(opacity + 0.06, 1)} roughness={0.04} clearcoat={1} envMapIntensity={1.6} depthWrite={false} />
          </mesh>
        </>
      )}
      {marks && <Marks radius={r} from={0.7} to={height - 0.45} count={Math.max(4, Math.round(height * 2.6))} long={Math.min(0.55, r * 0.35)} />}
    </group>
  );
}

// Conical (Erlenmeyer) flask.
export function ConicalFlask({ position = [0, 0, 0] as V3, radius = 1.3, height = 1.9, neck = 0.34, liquid = 0.4, colour = "#f9a8d4", opacity = 0.9 }: { position?: V3; radius?: number; height?: number; neck?: number; liquid?: number; colour?: string; opacity?: number }) {
  const t = 0.06;
  const neckH = height * 0.28;
  const bodyH = height - neckH;
  const outer: [number, number][] = [
    [0, 0],
    [radius - 0.2, 0],
    [radius, 0.14],
    [neck + 0.04, bodyH],
    [neck, bodyH + 0.1],
    [neck, height],
    [neck + 0.09, height + 0.03],
    [neck + 0.03, height + 0.05],
    [neck - t, height - 0.02],
    [neck - t, bodyH + 0.12],
    [neck - t + 0.02, bodyH],
    [radius - t - 0.06, 0.2],
    [radius - 0.28, 0.14],
    [0, 0.12],
  ];
  const fillY = 0.12 + (bodyH - 0.12) * liquid;
  const radiusAt = (y: number) => {
    const u = Math.min(1, Math.max(0, (y - 0.14) / (bodyH - 0.14)));
    return (radius - 0.04) * (1 - u) + (neck - 0.02) * u;
  };
  const liq: [number, number][] = [
    [0, 0.14],
    [radius - 0.28, 0.14],
    [radiusAt(0.3), 0.3],
    [radiusAt(fillY), fillY],
    [0, fillY],
  ];
  return (
    <group position={position}>
      <Lathe profile={outer} castShadow>
        <GlassMat />
      </Lathe>
      {liquid > 0 && (
        <Lathe profile={liq} renderOrder={-1}>
          <LiquidMat colour={colour} opacity={opacity} />
        </Lathe>
      )}
    </group>
  );
}

// Round-bottomed test tube. `fill` is 0..1 of the usable height.
export function TestTube({ position = [0, 0, 0] as V3, radius = 0.5, height = 3.2, fill = 0.55, colour = "#f5d9a8", cloudy = false, opacity = 0.95 }: { position?: V3; radius?: number; height?: number; fill?: number; colour?: string; cloudy?: boolean; opacity?: number }) {
  const t = 0.05;
  // base curve from centre outwards
  const baseCurve: [number, number][] = Array.from({ length: 11 }, (_, i) => {
    const a = (Math.PI / 2) * (i / 10);
    return [Math.sin(a) * radius, radius - Math.cos(a) * radius] as [number, number];
  });
  const shell: [number, number][] = [
    ...baseCurve,
    [radius, height],
    [radius + 0.06, height + 0.03],
    [radius - t + 0.01, height + 0.02],
    [radius - t, height - 0.05],
    ...[...baseCurve.map(([x, y]) => [Math.max(x - t * (x / radius), 0), y + t * 0.6] as [number, number])].reverse(),
  ];
  const fillH = radius + (height - radius * 1.5) * fill;
  const liquidCurve: [number, number][] = [
    ...Array.from({ length: 11 }, (_, i) => {
      const a = (Math.PI / 2) * (i / 10);
      return [Math.sin(a) * (radius - t - 0.01), radius - Math.cos(a) * (radius - t - 0.01) + 0.03] as [number, number];
    }),
    [radius - t - 0.01, fillH],
    [0, fillH],
  ];
  return (
    <group position={position}>
      <Lathe profile={shell} castShadow>
        <GlassMat />
      </Lathe>
      <Lathe profile={liquidCurve} renderOrder={-1}>
        <LiquidMat colour={colour} opacity={cloudy ? 0.8 : opacity} />
      </Lathe>
      <mesh position={[0, fillH + 0.002, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius - t - 0.01, 32]} />
        <meshPhysicalMaterial color={colour} transparent opacity={0.9} roughness={0.05} clearcoat={1} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Retort stand: heavy cast base, steel rod. `height` is the rod height.
export function RetortStand({ position = [0, 0, 0] as V3, height = 7 }: { position?: V3; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.24, 1.7]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.55} envMapIntensity={0.9} />
      </mesh>
      <mesh position={[-0.7, 0.26, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.1, 24]} />
        <Steel colour="#9aa5b4" />
      </mesh>
      <mesh position={[-0.7, height / 2 + 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, height, 20]} />
        <Steel colour="#cbd5e1" rough={0.18} />
      </mesh>
      <mesh position={[-0.7, height + 0.2, 0]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <Steel colour="#cbd5e1" rough={0.18} />
      </mesh>
    </group>
  );
}

// A boss-head with a clamp arm reaching out to a vessel at +x.
export function Clamp({ position = [0, 0, 0] as V3, reach = 0.9, arm = 0.5 }: { position?: V3; reach?: number; arm?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[reach / 2, 0, 0]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.055, 0.055, reach, 14]} />
        <Steel colour="#cbd5e1" rough={0.2} />
      </mesh>
      <mesh position={[reach, 0, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[arm, 0.045, 10, 32, Math.PI * 1.55]} />
        <Steel colour="#aab4c2" />
      </mesh>
      <mesh position={[0.17, 0.0, 0.17]}>
        <cylinderGeometry args={[0.05, 0.05, 0.25, 10]} />
        <Steel colour="#9aa5b4" />
      </mesh>
    </group>
  );
}

// A burette: graduated glass tube, liquid, PTFE stopcock and a drawn-out tip.
export function Burette({ position = [0, 0, 0] as V3, height = 4.6, level = 1, colour = "#9cc7ff" }: { position?: V3; height?: number; level?: number; colour?: string }) {
  const r = 0.24;
  const top = height;
  const tube: [number, number][] = [
    [r, 0.55],
    [r, top],
    [r + 0.05, top + 0.05],
    [r - 0.03, top + 0.03],
    [r - 0.03, 0.55],
    [0.05, 0.1],
    [0.05, 0],
    [0.08, 0],
    [0.08, 0.1],
    [r + 0.01, 0.55],
  ];
  const fill = Math.max(0.0001, (top - 0.55) * level);
  return (
    <group position={position}>
      <Lathe profile={tube} castShadow>
        <GlassMat opacity={0.22} />
      </Lathe>
      {level > 0 && (
        <mesh position={[0, 0.55 + fill / 2, 0]} renderOrder={-1}>
          <cylinderGeometry args={[r - 0.04, r - 0.04, fill, 24]} />
          <LiquidMat colour={colour} opacity={0.85} />
        </mesh>
      )}
      <Marks radius={r} from={0.9} to={top - 0.3} count={22} long={0.2} />
      {/* PTFE stopcock */}
      <mesh position={[0, 0.34, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      <mesh position={[0.36, 0.34, 0]}>
        <boxGeometry args={[0.28, 0.07, 0.34]} />
        <meshStandardMaterial color="#2563eb" roughness={0.4} />
      </mesh>
    </group>
  );
}

// An AA cell: metal can, coloured sleeve and a raised positive cap. Lies along the Z axis.
export function Cell({ position = [0, 0, 0] as V3, length = 0.95, radius = 0.3, sleeve = "#1d4ed8" }: { position?: V3; length?: number; radius?: number; sleeve?: string }) {
  return (
    <group position={position} rotation-x={Math.PI / 2}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, length, 28]} />
        <meshPhysicalMaterial color={sleeve} roughness={0.35} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, length * 0.18, 0]}>
        <cylinderGeometry args={[radius + 0.005, radius + 0.005, length * 0.12, 28]} />
        <Brass />
      </mesh>
      <mesh position={[0, length / 2 + 0.05, 0]}>
        <cylinderGeometry args={[radius * 0.4, radius * 0.4, 0.1, 16]} />
        <Steel colour="#e5e7eb" rough={0.2} />
      </mesh>
      <mesh position={[0, -length / 2 - 0.01, 0]}>
        <cylinderGeometry args={[radius * 0.97, radius * 0.97, 0.03, 28]} />
        <Steel colour="#9aa5b4" />
      </mesh>
    </group>
  );
}

// A screw-base filament bulb that glows with `level` (0..1).
export function BulbReal({ position = [0, 0, 0] as V3, level = 0, blown = false }: { position?: V3; level?: number; blown?: boolean }) {
  const globe: [number, number][] = [
    [0.2, 0.55],
    [0.3, 0.7],
    [0.55, 1.05],
    [0.66, 1.5],
    [0.6, 1.95],
    [0.38, 2.28],
    [0.1, 2.4],
    [0, 2.41],
  ];
  const lit = !blown && level > 0.02;
  return (
    <group position={position}>
      {/* brass screw base */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.62, 24]} />
        <Brass rough={0.4} />
      </mesh>
      {[0.12, 0.26, 0.4, 0.54].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.31, 0.03, 8, 28]} />
          <Brass rough={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        <Steel colour="#d1d5db" />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 0.08, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
      {/* glass globe, lit from inside */}
      <Lathe profile={globe}>
        <meshPhysicalMaterial
          color={blown ? "#cbd5e1" : lit ? "#fff4c2" : "#eaf4ff"}
          transparent
          opacity={lit ? 0.5 : 0.22}
          roughness={0.04}
          clearcoat={1}
          emissive={lit ? "#ffd75e" : "#000000"}
          emissiveIntensity={lit ? level * 1.6 : 0}
          envMapIntensity={1.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Lathe>
      {/* support wires and filament */}
      <Rod a={[-0.1, 0.65, 0]} b={[-0.1, 1.3, 0]} color="#9ca3af" r={0.015} metal />
      <Rod a={[0.1, 0.65, 0]} b={[0.1, 1.3, 0]} color="#9ca3af" r={0.015} metal />
      <mesh position={[0, 1.32, 0]} rotation-x={Math.PI / 2} scale={[1, 1, 1]}>
        <torusGeometry args={[0.1, 0.018, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color={lit ? "#fff7d6" : blown ? "#374151" : "#6b7280"}
          emissive={lit ? "#ffb02e" : "#000000"}
          emissiveIntensity={lit ? 1 + level * 3 : 0}
          toneMapped={!lit}
        />
      </mesh>
      {lit && <Glow position={[0, 1.4, 0]} size={2.4 + level * 3.2} opacity={0.25 + level * 0.5} />}
      {lit && <pointLight position={[0, 1.5, 0]} intensity={level * 16} distance={9} color="#ffd98a" />}
    </group>
  );
}

export function Arrow({ from, to, color = "#16a34a", r = 0.1 }: { from: V3; to: V3; color?: string; r?: number }) {
  const { quat, len, mid, tip } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const length = dir.length() || 0.0001;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    const head = Math.min(0.5, length * 0.4);
    return {
      quat: q,
      len: length - head,
      mid: a.clone().add(dir.clone().normalize().multiplyScalar((length - head) / 2)),
      tip: a.clone().add(dir.clone().normalize().multiplyScalar(length - head / 2)),
    };
  }, [from, to]);
  return (
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[r, r, Math.max(len, 0.01), 14]} />
        <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={tip} quaternion={quat}>
        <coneGeometry args={[r * 2.4, Math.min(0.5, (len + 0.001) * 0.6 + 0.2), 18]} />
        <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

// An insulated lead that runs smoothly through the given points.
export function Wire({ points, color = "#dc2626", r = 0.06 }: { points: V3[]; color?: string; r?: number }) {
  const key = JSON.stringify(points);
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.15);
    return new THREE.TubeGeometry(curve, Math.max(16, points.length * 10), r, 10, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, r]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.3} />
    </mesh>
  );
}

