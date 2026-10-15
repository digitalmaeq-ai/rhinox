"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";

import { orbitAngle, spinAngle, SUN_RADIUS } from "@/lib/solar-system/orbital-engine";
import { planets, sun } from "@/lib/solar-system/planet-data";
import type { BodyId, CelestialBody } from "@/lib/solar-system/solar-system-types";

import { Atmosphere, ATMOSPHERES, RadialRing } from "./SolarSystem3D";
import styles from "./SolarShowcase.module.css";
import { createCloudTexture, createGlowTexture, createNebulaTexture, createPlanetTexture, createRingTexture } from "./planet-textures";

// Homepage showcase: the real 3D Solar System, seen from the SIDE, with every
// planet circling the Sun at a slow, calm pace. It is a display piece, not the
// full explorer: no controls, no labels, no selection. Clicking through to the
// explorer is handled by the card that hosts it.
//
//  - Same data, textures and orbit maths as the explorer (teaching scale).
//  - Camera sits only ~9 degrees above the orbital plane, so the orbits
//    become thin ellipses, and drifts very slowly so the scene never feels
//    frozen. It is fitted to the width of the box so Neptune is never cut off.
//  - Pauses while off screen (the host passes `active`) and shows one still
//    frame for visitors who prefer reduced motion.

const ELEVATION = THREE.MathUtils.degToRad(9);
const FOV = 30;
/** Simulated days per real second. Earth takes about 36 s per lap: slow and readable. */
const DAYS_PER_SECOND = 10;
/** Planets are drawn larger than the explorer's so they stay readable in a small box. */
const PLANET_SCALE = 2.6;
/**
 * Orbit radii for this display only: evenly stepped, with the gaps growing a
 * little outward. Not to scale (the explorer's "true scale" mode is). Periods
 * still come from the real data. Tighter than the explorer so the camera can
 * zoom in much closer while Neptune still fits.
 */
const SHOW_RADIUS: Record<string, number> = { mercury: 8, venus: 11, earth: 14, mars: 17, jupiter: 22, saturn: 27, uranus: 32, neptune: 36.5 };
/** Half the width the camera must fit: Neptune's orbit plus its size and some air. */
const FIT_RADIUS = SHOW_RADIUS.neptune + 11;

/**
 * Label placement by body index (0 = Sun, 1 = Mercury ... 8 = Neptune):
 * [side, extra pixels]. Side -1 is above the planet, 1 is below.
 */
const LABEL_SLOT: [number, number][] = [
  [-1, 40], // Sun
  [-1, 12], // Mercury
  [1, 12], // Venus
  [-1, 70], // Earth
  [1, 22], // Mars
  [1, 14], // Jupiter
  [-1, 14], // Saturn
  [1, 14], // Uranus
  [-1, 14], // Neptune
];

/** One short fact per world, for the labels (NASA fact sheets). */
const FACTS: Record<string, string> = {
  sun: "Our star",
  mercury: "Closest to the Sun",
  venus: "Hottest planet",
  earth: "Our home",
  mars: "The red planet",
  jupiter: "Largest planet",
  saturn: "Famous rings",
  uranus: "Spins on its side",
  neptune: "Windiest planet",
};

/** Inner planets crowd together near the Sun, so only the outer worlds carry the info line. */
const OUTER = new Set<string>(["jupiter", "saturn", "uranus", "neptune"]);

function yearLabel(body: CelestialBody) {
  const days = body.orbitalDays ?? 0;
  if (days === 0) return "";
  return days < 365 ? `${Math.round(days)}-day year` : `${(days / 365.25).toFixed(days / 365.25 < 10 ? 1 : 0)}-yr orbit`;
}
const SUN_GLOW = [
  { tint: "#fff1c2", opacity: 0.95, size: 5.2 },
  { tint: "#ffb347", opacity: 0.5, size: 9.5 },
  { tint: "#ff8a1f", opacity: 0.22, size: 18 },
];

interface Assets {
  textures: Map<BodyId, THREE.Texture>;
  ring: THREE.Texture;
  glow: THREE.Texture;
  clouds: THREE.Texture;
  nebula: THREE.Texture;
}

function Orrery({ reducedMotion }: { reducedMotion: boolean }) {
  const assets = useMemo<Assets>(() => {
    const textures = new Map<BodyId, THREE.Texture>();
    [sun, ...planets].forEach((body) => textures.set(body.id, createPlanetTexture(body)));
    return { textures, ring: createRingTexture(), glow: createGlowTexture(), clouds: createCloudTexture(), nebula: createNebulaTexture() };
  }, []);
  useEffect(
    () => () => {
      assets.textures.forEach((texture) => texture.dispose());
      assets.ring.dispose();
      assets.glow.dispose();
      assets.clouds.dispose();
      assets.nebula.dispose();
    },
    [assets],
  );

  const orbitGeometries = useMemo(
    () =>
      planets.map((body) => {
        const radius = SHOW_RADIUS[body.id];
        const points = Array.from({ length: 160 }, (_, i) => {
          const a = (i / 160) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
        });
        return new THREE.BufferGeometry().setFromPoints(points);
      }),
    [],
  );
  useEffect(() => () => orbitGeometries.forEach((geometry) => geometry.dispose()), [orbitGeometries]);

  // Our own clock (frame time, clamped) so pausing off screen never makes the
  // planets jump when the page scrolls back into view.
  const time = useRef(reducedMotion ? 40 : 0);
  const places = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef<(THREE.Mesh | null)[]>([]);
  const clouds = useRef<THREE.Mesh>(null);
  const glowSprites = useRef<(THREE.Sprite | null)[]>([]);
  const sunCore = useRef<THREE.Mesh>(null);
  // Label boxes: index 0 is the Sun, then the planets in order. Their offset
  // from the planet is set every frame so they clear the planet at any zoom.
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useFrame((state, delta) => {
    if (!reducedMotion) time.current += Math.min(delta, 0.1);
    const t = time.current;
    const days = t * DAYS_PER_SECOND + 30;

    planets.forEach((body, index) => {
      const place = places.current[index];
      if (place) {
        const angle = orbitAngle(body, days);
        place.position.set(Math.cos(angle) * SHOW_RADIUS[body.id], 0, Math.sin(angle) * SHOW_RADIUS[body.id]);
      }
      const spin = spins.current[index];
      if (spin) spin.rotation.y = spinAngle(body, t);
      if (body.id === "earth" && clouds.current) clouds.current.rotation.y = spinAngle(body, t) * 1.12;
    });
    if (sunCore.current) sunCore.current.rotation.y = spinAngle(sun, t);
    const pulse = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.03;
    glowSprites.current.forEach((sprite, index) => sprite?.scale.setScalar(SUN_RADIUS * SUN_GLOW[index].size * (1 + pulse * (index + 1) * 0.5)));

    // Camera: fitted to the box width, with a very slow sway so it feels alive.
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const halfFov = THREE.MathUtils.degToRad(FOV / 2);
    const distance = FIT_RADIUS / (Math.tan(halfFov) * Math.max(aspect, 0.5));
    const sway = reducedMotion ? 0 : Math.sin(t * 0.09) * 0.1;
    const elevation = ELEVATION + (reducedMotion ? 0 : Math.sin(t * 0.07) * 0.025);
    camera.position.set(
      distance * Math.cos(elevation) * Math.sin(sway),
      distance * Math.sin(elevation),
      distance * Math.cos(elevation) * Math.cos(sway),
    );
    camera.lookAt(0, 0, 0);

    // Labels: planets alternate above/below so neighbours rarely collide, and
    // the offset follows the planet's size on screen.
    const pxPerUnit = state.size.height / (2 * distance * Math.tan(halfFov));
    const compact = state.size.width < 460;
    [sun, ...planets].forEach((body, index) => {
      const node = labels.current[index];
      if (!node) return;
      const radius = (index === 0 ? SUN_RADIUS * 1.15 : body.displayRadius * PLANET_SCALE * (body.hasRings ? 1.9 : 1.1)) * pxPerUnit;
      // Labels sit above (-1) or below (1) their planet. The crowded inner
      // worlds sit at different heights, so their tags never stack on each other.
      const [side, extra] = LABEL_SLOT[index] ?? [-1, 12];
      node.style.transform = `translateY(${side * (radius + extra)}px)`;
      node.dataset.compact = compact ? "1" : "0";
    });
  });

  return (
    <>
      <color attach="background" args={["#02060f"]} />
      <ambientLight intensity={0.18} color="#8fb4ff" />
      <hemisphereLight args={["#9db8ff", "#0a1226", 0.3]} />
      <pointLight position={[0, 0, 0]} intensity={6.4} decay={0} color="#fff0d4" />

      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[900, 32, 16]} />
        <meshBasicMaterial map={assets.nebula} side={THREE.BackSide} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <Stars radius={420} depth={90} count={1600} factor={5} saturation={0} fade speed={0} />

      {/* Sun: textured core plus three additive glow layers (cheap "bloom"). */}
      <group>
        <mesh ref={sunCore}>
          <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
          <meshBasicMaterial map={assets.textures.get("sun")} color="#fff0c4" toneMapped={false} />
        </mesh>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div ref={(node) => { labels.current[0] = node; }} className={styles.label}>
            <b>Sun</b>
          </div>
        </Html>
        {SUN_GLOW.map((layer, index) => (
          <sprite key={layer.tint} ref={(node) => { glowSprites.current[index] = node; }}>
            <spriteMaterial map={assets.glow} color={layer.tint} transparent opacity={layer.opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
        ))}
      </group>

      {planets.map((body, index) => {
        const atmosphere = ATMOSPHERES[body.id];
        return (
          <group key={body.id} ref={(node) => { places.current[index] = node; }}>
            <group rotation={[0, 0, THREE.MathUtils.degToRad(body.axialTiltDeg)]} scale={PLANET_SCALE}>
              <mesh ref={(node) => { spins.current[index] = node; }}>
                <sphereGeometry args={[body.displayRadius, 48, 32]} />
                <meshStandardMaterial map={assets.textures.get(body.id)} roughness={0.9} metalness={0} emissive="#ffffff" emissiveMap={assets.textures.get(body.id)} emissiveIntensity={0.12} />
              </mesh>
              {body.id === "earth" && (
                <mesh ref={clouds} scale={1.012}>
                  <sphereGeometry args={[body.displayRadius, 40, 28]} />
                  <meshStandardMaterial map={assets.clouds} transparent roughness={1} depthWrite={false} emissive="#ffffff" emissiveMap={assets.clouds} emissiveIntensity={0.08} />
                </mesh>
              )}
              {atmosphere && <Atmosphere radius={body.displayRadius} style={atmosphere} />}
              {body.hasRings && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <RadialRing inner={body.displayRadius * 1.35} outer={body.displayRadius * 2.45} />
                  <meshBasicMaterial map={assets.ring} side={THREE.DoubleSide} transparent depthWrite={false} />
                </mesh>
              )}
            </group>
            <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
              <div ref={(node) => { labels.current[index + 1] = node; }} className={styles.label}>
                <b>{body.name}</b>
                {OUTER.has(body.id) && <span>{FACTS[body.id]} · {yearLabel(body)}</span>}
              </div>
            </Html>
          </group>
        );
      })}

      {orbitGeometries.map((geometry, index) => (
        <lineLoop key={planets[index].id} geometry={geometry}>
          <lineBasicMaterial color="#6fa2ee" transparent opacity={0.3} depthWrite={false} />
        </lineLoop>
      ))}
    </>
  );
}

export default function SolarShowcase({ active, reducedMotion, onReady }: { active: boolean; reducedMotion: boolean; onReady?: () => void }) {
  return (
    <Canvas
      // Reduced motion: draw one still frame (and again on resize), nothing more.
      frameloop={active && !reducedMotion ? "always" : "demand"}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "default", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      camera={{ position: [0, 20, 100], fov: FOV, near: 0.1, far: 1800 }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      onCreated={() => onReady?.()}
      aria-hidden="true"
    >
      <Orrery reducedMotion={reducedMotion} />
    </Canvas>
  );
}
