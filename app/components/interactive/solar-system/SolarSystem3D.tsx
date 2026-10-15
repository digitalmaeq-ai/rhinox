"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { celestialBodies, getBody, planets, sun } from "@/lib/solar-system/planet-data";
import { orbitPosition, orbitRadius, spinAngle, trailPoints } from "@/lib/solar-system/orbital-engine";
import type { BodyId, CameraPreset, CelestialBody, ScaleMode } from "@/lib/solar-system/solar-system-types";

import { createCloudTexture, createGlowTexture, createNebulaTexture, createPlanetTexture, createRingTexture } from "./planet-textures";
import type { SolarViewProps } from "./view-types";

// Interactive 3D Solar System (Three.js via React Three Fiber and Drei).
// Loaded client-side only; see SolarSystemExperiment.
//
// What makes it feel premium (all cheap enough for school devices):
//  - a raised, cinematic camera with a short intro fly-in;
//  - a Sun with layered glow, used as the only strong light source;
//  - Fresnel atmospheres (Earth, Venus, gas and ice giants) and Earth clouds;
//  - a glowing selection halo, a faint nebula backdrop;
//  - "bloom" done with additive glow sprites, and a CSS vignette (see the
//    experiment), so no post-processing package is required.

// ---------------------------------------------------------------------------
// Camera presets. Angles are elevation above the orbital plane (the ecliptic).
//
//   overview  44 degrees, turned 18 degrees to one side: a raised three-quarter
//             view of the whole system, so orbits read as ellipses and planets
//             have depth. This is the default.
//   follow    about 35 degrees, medium distance, on the Sun-facing side. Keeps
//             the planet in view with its orbit around it while it moves.
//   closeup   about 14 degrees, close in. Best for studying the planet itself.
//   top       about 83 degrees: the classic map view for comparing orbits.
// ---------------------------------------------------------------------------
const deg = THREE.MathUtils.degToRad;
const OVERVIEW_ELEVATION = deg(44);
const OVERVIEW_AZIMUTH = deg(18);
const OVERVIEW_DISTANCE = 112;
const TOP_ELEVATION = deg(83);
const TOP_DISTANCE = 108;
const FOLLOW_ELEVATION = deg(35);
const FOLLOW_AZIMUTH = 0.7; // radians off the planet-to-Sun line
const CLOSEUP_ELEVATION = deg(14);
const CLOSEUP_AZIMUTH = 0.5;

// Planets are drawn this much larger than their data radius (a display choice
// on top of the teaching scale) so they stay readable from the overview.
const PLANET_SCALE = 1.3;

// Intro fly-in: from a low, close angle to the overview framing.
const INTRO_SECONDS = 2.2;
const INTRO_FROM = { azimuth: -0.95, elevation: deg(13), distance: 56 };

/** How long a preset change takes. Reduced motion makes it instant. */
const TRANSITION_SECONDS = 1.6;

// Play the intro once per page visit, not every time the learner flips 2D/3D.
const introState = { played: false };

function sphericalToCartesian(azimuth: number, elevation: number, distance: number) {
  return new THREE.Vector3(
    distance * Math.cos(elevation) * Math.sin(azimuth),
    distance * Math.sin(elevation),
    distance * Math.cos(elevation) * Math.cos(azimuth),
  );
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ---------------------------------------------------------------------------
// Atmospheres: a slightly larger sphere whose brightness rises toward the
// edge (Fresnel), strongest on the Sun-facing side. Additive, no depth write.
// ---------------------------------------------------------------------------
interface AtmosphereStyle {
  color: string;
  scale: number;
  power: number;
  intensity: number;
}

export const ATMOSPHERES: Partial<Record<BodyId, AtmosphereStyle>> = {
  venus: { color: "#ffe2a6", scale: 1.1, power: 2.3, intensity: 1.15 },
  earth: { color: "#6db6ff", scale: 1.09, power: 2.5, intensity: 1.6 },
  mars: { color: "#ffb48e", scale: 1.06, power: 3.2, intensity: 0.55 },
  jupiter: { color: "#ffd6a8", scale: 1.05, power: 3.0, intensity: 0.65 },
  saturn: { color: "#f5e2b4", scale: 1.05, power: 3.0, intensity: 0.55 },
  uranus: { color: "#9ff0f2", scale: 1.08, power: 2.6, intensity: 1.0 },
  neptune: { color: "#6f8dff", scale: 1.08, power: 2.6, intensity: 1.15 },
};

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), uPower);
    // The Sun sits at the origin, so the Sun direction is toward (0,0,0).
    vec3 sunDirection = normalize(-vWorldPosition);
    float lit = clamp(dot(normal, sunDirection) * 0.85 + 0.35, 0.0, 1.0);
    float alpha = rim * uIntensity * lit;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

export function Atmosphere({ radius, style }: { radius: number; style: AtmosphereStyle }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(style.color) },
          uPower: { value: style.power },
          uIntensity: { value: style.intensity },
        },
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [style],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh scale={style.scale}>
      <sphereGeometry args={[radius, 48, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Selection halo: crisp ring plus a soft glow, gently pulsing.
// ---------------------------------------------------------------------------
function SelectionHalo({ radius, color, wide, glow, reducedMotion }: { radius: number; color: string; wide: boolean; glow: THREE.Texture; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = radius * (wide ? 2.75 : 1.28);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.4) * 0.035);
  });

  return (
    <Billboard>
      <group ref={group}>
        <mesh>
          <ringGeometry args={[ring, ring + radius * 0.02, 128]} />
          <meshBasicMaterial color="#9fd0ff" transparent opacity={0.85} depthWrite={false} toneMapped={false} />
        </mesh>
        <sprite scale={[ring * 2.5, ring * 2.5, 1]}>
          <spriteMaterial map={glow} color={color} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      </group>
    </Billboard>
  );
}

// ---------------------------------------------------------------------------
// Bodies
// ---------------------------------------------------------------------------
interface Shared {
  glow: THREE.Texture;
  clouds: THREE.Texture;
}

function PlanetBody({ body, props, texture, ringTexture, shared }: { body: CelestialBody; props: SolarViewProps; texture: THREE.Texture; ringTexture: THREE.Texture | null; shared: Shared }) {
  const { settings, clockRef, selectedId, onSelect, reducedMotion } = props;
  const place = useRef<THREE.Group>(null);
  const tiltGroup = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Mesh>(null);
  const cloudSpin = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const selected = selectedId === body.id;
  const radius = body.displayRadius;
  const tilt = useMemo(() => THREE.MathUtils.degToRad(body.axialTiltDeg), [body.axialTiltDeg]);
  const atmosphere = ATMOSPHERES[body.id];

  useFrame((state) => {
    const clock = clockRef.current;
    if (place.current) {
      const { x, z } = orbitPosition(body, clock.days, settings.scale);
      place.current.position.set(x, 0, z);
    }
    const angle = spinAngle(body, clock.spin);
    if (spin.current) spin.current.rotation.y = angle;
    if (cloudSpin.current) cloudSpin.current.rotation.y = angle * 1.12;
    // The four inner labels crowd together in the overview, so they fade in
    // as the camera moves closer (or when the planet is selected).
    if (labelRef.current && place.current && (body.distanceAu ?? 9) < 2) {
      const distance = state.camera.position.distanceTo(place.current.position);
      const visible = selected ? 1 : Math.min(1, Math.max(0, (80 - distance) / 25));
      labelRef.current.style.opacity = String(visible);
    }
    // Gentle "pop" when selected.
    if (tiltGroup.current) {
      const goal = (selected ? 1.05 : 1) * PLANET_SCALE;
      tiltGroup.current.scale.setScalar(reducedMotion ? goal : THREE.MathUtils.lerp(tiltGroup.current.scale.x, goal, 0.12));
    }
  });

  return (
    <group ref={place} name={`body-${body.id}`}>
      <group ref={tiltGroup} rotation={[0, 0, tilt]} scale={PLANET_SCALE}>
        <mesh ref={spin}>
          <sphereGeometry args={[radius, 64, 40]} />
          {/* A little self-light keeps the night side readable for learners. */}
          <meshStandardMaterial map={texture} roughness={0.9} metalness={0} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.1} />
        </mesh>

        {body.id === "earth" && (
          <mesh ref={cloudSpin} scale={1.012}>
            <sphereGeometry args={[radius, 48, 32]} />
            <meshStandardMaterial map={shared.clouds} transparent roughness={1} depthWrite={false} emissive="#ffffff" emissiveMap={shared.clouds} emissiveIntensity={0.08} />
          </mesh>
        )}

        {atmosphere && <Atmosphere radius={radius} style={atmosphere} />}

        {ringTexture && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <RadialRing inner={radius * 1.35} outer={radius * 2.45} />
            <meshBasicMaterial map={ringTexture} side={THREE.DoubleSide} transparent depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* Larger invisible target so small planets are easy to tap. */}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect(body.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <sphereGeometry args={[Math.max(radius * PLANET_SCALE * 1.4, 0.9), 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {selected && <SelectionHalo radius={radius * PLANET_SCALE} color={body.color} wide={Boolean(body.hasRings)} glow={shared.glow} reducedMotion={reducedMotion} />}

      {settings.showLabels && (
        <Html position={[0, radius * PLANET_SCALE * (body.hasRings ? 1.9 : 1.3) + 0.5, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <span ref={labelRef} className={`rx-ss-label ${selected ? "rx-ss-label-on" : ""}`}>{body.name}</span>
        </Html>
      )}
    </group>
  );
}

// A flat ring whose texture runs from the inner to the outer edge.
export function RadialRing({ inner, outer }: { inner: number; outer: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner, outer, 128, 1);
    const position = geo.getAttribute("position");
    const uv = geo.getAttribute("uv");
    const vector = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 1) {
      vector.fromBufferAttribute(position, i);
      uv.setXY(i, (vector.length() - inner) / (outer - inner), 0.5);
    }
    return geo;
  }, [inner, outer]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <primitive object={geometry} attach="geometry" />;
}

function OrbitRing({ body, scale, highlighted }: { body: CelestialBody; scale: ScaleMode; highlighted: boolean }) {
  const geometry = useMemo(() => {
    const radius = orbitRadius(body, scale);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 192; i += 1) {
      const a = (i / 192) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [body, scale]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={highlighted ? body.color : "#6fb4ff"} transparent opacity={highlighted ? 0.85 : 0.3} depthWrite={false} />
    </lineLoop>
  );
}

function Trail({ body, props }: { body: CelestialBody; props: SolarViewProps }) {
  const lineRef = useRef<THREE.Line>(null);
  const { geometry, line } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(37 * 3), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: body.color, transparent: true, opacity: 0.95 }));
    return { geometry: g, line: l };
  }, [body.color]);
  useEffect(
    () => () => {
      geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [geometry, line],
  );

  useFrame(() => {
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    const points = trailPoints(body, props.clockRef.current.days, props.settings.scale);
    points.forEach((point, index) => attribute.setXYZ(index, point.x, 0, point.z));
    attribute.needsUpdate = true;
    geometry.computeBoundingSphere();
    if (lineRef.current) lineRef.current.visible = props.settings.showTrails;
  });

  return <primitive ref={lineRef} object={line} />;
}

// ---------------------------------------------------------------------------
// The Sun: textured core plus three additive glow layers (the "bloom"), with
// a very slow breathing pulse (off for reduced motion).
// ---------------------------------------------------------------------------
function SunBody({ props, texture, shared }: { props: SolarViewProps; texture: THREE.Texture; shared: Shared }) {
  const core = useRef<THREE.Mesh>(null);
  const layers = useRef<(THREE.Sprite | null)[]>([]);
  const selected = props.selectedId === "sun";
  const radius = sun.displayRadius;

  useFrame(({ clock }) => {
    if (core.current) core.current.rotation.y = spinAngle(sun, props.clockRef.current.spin);
    const pulse = props.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.03;
    layers.current.forEach((sprite, index) => {
      if (sprite) sprite.scale.setScalar(radius * [5.2, 9.5, 18][index] * (1 + pulse * (index + 1) * 0.5));
    });
  });

  const tints = ["#fff1c2", "#ffb347", "#ff8a1f"];
  const opacity = [0.95, 0.5, 0.22];

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[radius, 64, 40]} />
        <meshBasicMaterial map={texture} color="#fff0c4" toneMapped={false} />
      </mesh>
      {tints.map((tint, index) => (
        <sprite key={tint} ref={(node) => { layers.current[index] = node; }}>
          <spriteMaterial map={shared.glow} color={tint} transparent opacity={opacity[index]} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          props.onSelect("sun");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <sphereGeometry args={[radius * 1.15, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && <SelectionHalo radius={radius * 1.05} color="#ffd25e" wide={false} glow={shared.glow} reducedMotion={props.reducedMotion} />}
      {props.settings.showLabels && (
        <Html position={[0, radius * 1.3 + 0.6, 0]} center style={{ pointerEvents: "none" }}>
          <span className={`rx-ss-label ${selected ? "rx-ss-label-on" : ""}`}>Sun</span>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera rig
//  1. Intro: a 2.2 s fly-in from a low, close angle to the overview framing.
//  2. Presets: every preset is a TARGET (what the camera looks at) plus an
//     OFFSET (direction and distance from it). Changing preset eases the
//     offset in spherical coordinates (azimuth, elevation, distance), which
//     swings the camera round smoothly instead of cutting through the planet.
//  3. Follow / close-up keep the target locked on the selected planet as it
//     orbits. Overview / top look at the Sun and leave the target alone after
//     the move, so the learner can pan freely.
//  4. Touching the view (orbit, zoom, pan) cancels an easing move at once,
//     so the camera never fights the learner.
// Reduced motion: no intro, presets apply instantly.
// ---------------------------------------------------------------------------

/** What a preset means for the camera, given the selected body (if any). */
function framingFor(preset: CameraPreset, body: CelestialBody | null) {
  const hasRings = Boolean(body?.hasRings);
  const size = body ? body.displayRadius * PLANET_SCALE : 1;
  switch (preset) {
    case "top":
      return { elevation: TOP_ELEVATION, distance: TOP_DISTANCE, azimuth: null as number | null, locksOnBody: false };
    case "follow":
      return { elevation: FOLLOW_ELEVATION, distance: THREE.MathUtils.clamp(size * (hasRings ? 15 : 11), 9, 30), azimuth: FOLLOW_AZIMUTH, locksOnBody: true };
    case "closeup":
      return { elevation: CLOSEUP_ELEVATION, distance: Math.max(size * (hasRings ? 8 : 4.4), 3.4), azimuth: CLOSEUP_AZIMUTH, locksOnBody: true };
    default:
      return { elevation: OVERVIEW_ELEVATION, distance: OVERVIEW_DISTANCE, azimuth: OVERVIEW_AZIMUTH as number | null, locksOnBody: false };
  }
}

const wrapAngle = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

function CameraRig({ props, playIntro }: { props: SolarViewProps; playIntro: boolean }) {
  const { selectedId, settings, clockRef, apiRef, reducedMotion, cameraPreset } = props;
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const camera = useThree((state) => state.camera);
  const dom = useThree((state) => state.gl.domElement);

  // Follow and close-up need a planet; without one, fall back to overview.
  const body = getBody(selectedId);
  const preset: CameraPreset = !body && (cameraPreset === "follow" || cameraPreset === "closeup") ? "overview" : cameraPreset;

  const intro = useRef(playIntro ? 0 : INTRO_SECONDS);
  const transition = useRef(0);
  const scaleRef = useRef(settings.scale);
  useEffect(() => {
    scaleRef.current = settings.scale;
  }, [settings.scale]);

  // Mark the intro as seen, and let any touch or click skip it.
  useEffect(() => {
    if (playIntro) introState.played = true;
    const skip = () => {
      intro.current = INTRO_SECONDS;
    };
    dom.addEventListener("pointerdown", skip);
    return () => dom.removeEventListener("pointerdown", skip);
  }, [dom, playIntro]);

  // Any manual orbit / zoom / pan stops the easing move.
  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      transition.current = 0;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  // A new preset or a new selected planet starts a smooth move.
  useEffect(() => {
    transition.current = reducedMotion ? 0.001 : TRANSITION_SECONDS;
  }, [preset, selectedId, reducedMotion]);

  useEffect(() => {
    apiRef.current = {
      zoomBy: (factor) => {
        if (!controls) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(offset.length() * factor, 2, 170);
        camera.position.copy(controls.target).add(offset.setLength(distance));
        transition.current = 0;
      },
      // "Reset view" re-frames the current preset.
      resetView: () => {
        transition.current = reducedMotion ? 0.001 : TRANSITION_SECONDS;
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera, controls, reducedMotion]);

  useFrame((state, delta) => {
    const ctrl = state.controls as OrbitControlsImpl | null;
    if (!ctrl) return;

    // ---- 1. Intro fly-in -------------------------------------------------
    if (intro.current < INTRO_SECONDS) {
      intro.current += delta;
      const t = Math.min(intro.current / INTRO_SECONDS, 1);
      const swing = easeInOutCubic(t);
      const pull = easeOutCubic(t);
      const azimuth = THREE.MathUtils.lerp(INTRO_FROM.azimuth, OVERVIEW_AZIMUTH, swing);
      const elevation = THREE.MathUtils.lerp(INTRO_FROM.elevation, OVERVIEW_ELEVATION, swing);
      const distance = THREE.MathUtils.lerp(INTRO_FROM.distance, OVERVIEW_DISTANCE, pull);
      ctrl.enabled = false;
      ctrl.target.set(0, 0, 0);
      camera.position.copy(sphericalToCartesian(azimuth, elevation, distance));
      ctrl.update();
      return;
    }
    if (!ctrl.enabled) ctrl.enabled = true;

    // ---- 2 & 3. Presets ---------------------------------------------------
    const framing = framingFor(preset, body);
    const bodyPosition = new THREE.Vector3();
    if (body && body.id !== "sun") {
      const { x, z } = orbitPosition(body, clockRef.current.days, scaleRef.current);
      bodyPosition.set(x, 0, z);
    }

    const alpha = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.4);
    const easing = transition.current > 0;

    // Target: locked on the planet for follow / close-up; otherwise eased to
    // the Sun only while a move is running (so panning sticks afterwards).
    if (framing.locksOnBody || easing) {
      const before = ctrl.target.clone();
      const goal = framing.locksOnBody ? bodyPosition : new THREE.Vector3();
      ctrl.target.lerp(goal, alpha);
      camera.position.add(ctrl.target.clone().sub(before));
    }

    if (easing) {
      transition.current -= delta;
      const offset = camera.position.clone().sub(ctrl.target);
      const length = offset.length();
      const currentElevation = Math.asin(THREE.MathUtils.clamp(offset.y / Math.max(length, 1e-6), -1, 1));
      const currentAzimuth = Math.atan2(offset.x, offset.z);

      // Desired azimuth: relative to the planet-to-Sun line when locked on a
      // planet (so it is lit); a fixed angle for overview; unchanged for top.
      let desiredAzimuth = currentAzimuth;
      if (framing.locksOnBody) {
        const toSun = bodyPosition.clone().negate();
        const base = toSun.lengthSq() < 1e-6 ? 0 : Math.atan2(toSun.x, toSun.z);
        desiredAzimuth = base + (framing.azimuth ?? 0);
      } else if (framing.azimuth !== null) {
        desiredAzimuth = framing.azimuth;
      }

      const azimuth = currentAzimuth + wrapAngle(desiredAzimuth - currentAzimuth) * alpha;
      const elevation = THREE.MathUtils.lerp(currentElevation, framing.elevation, alpha);
      const distance = THREE.MathUtils.lerp(length, framing.distance, alpha);
      camera.position.copy(ctrl.target).add(sphericalToCartesian(azimuth, elevation, distance));
    }
    ctrl.update();
  });

  return null;
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------
export default function SolarSystem3D(props: SolarViewProps) {
  const { settings, selectedId, reducedMotion, cameraPreset } = props;
  const [playIntro] = useState(() => !introState.played && !reducedMotion && selectedId === null);

  // Textures are created once on the client and disposed on unmount.
  const textures = useMemo(() => {
    const map = new Map<BodyId, THREE.Texture>();
    celestialBodies.forEach((body) => map.set(body.id, createPlanetTexture(body)));
    return map;
  }, []);
  const ringTexture = useMemo(() => createRingTexture(), []);
  const shared = useMemo<Shared>(() => ({ glow: createGlowTexture(), clouds: createCloudTexture() }), []);
  const nebula = useMemo(() => createNebulaTexture(), []);
  useEffect(
    () => () => {
      textures.forEach((texture) => texture.dispose());
      ringTexture.dispose();
      shared.glow.dispose();
      shared.clouds.dispose();
      nebula.dispose();
    },
    [textures, ringTexture, shared, nebula],
  );

  const startPosition = useMemo(
    () =>
      (playIntro
        ? sphericalToCartesian(INTRO_FROM.azimuth, INTRO_FROM.elevation, INTRO_FROM.distance)
        : sphericalToCartesian(OVERVIEW_AZIMUTH, OVERVIEW_ELEVATION, OVERVIEW_DISTANCE)
      ).toArray(),
    [playIntro],
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      camera={{ position: startPosition, fov: 40, near: 0.1, far: 1800 }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      aria-label="Interactive 3D model of the Solar System"
    >
      <color attach="background" args={["#02060f"]} />

      {/* Lighting: the Sun is the key light; a cool sky fill and a faint
          ambient keep the night sides readable without flattening the form. */}
      <ambientLight intensity={0.16} color="#8fb4ff" />
      <hemisphereLight args={["#9db8ff", "#0a1226", 0.3]} />
      <pointLight position={[0, 0, 0]} intensity={6.4} decay={0} color="#fff0d4" />

      {/* Backdrop: faint nebula and two star layers (near, bright / far, fine). */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[900, 32, 16]} />
        <meshBasicMaterial map={nebula} side={THREE.BackSide} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <Stars radius={420} depth={90} count={2200} factor={5} saturation={0} fade speed={0} />
      <Stars radius={600} depth={60} count={1800} factor={2.5} saturation={0.2} fade speed={0} />

      <SunBody props={props} texture={textures.get("sun")!} shared={shared} />
      {planets.map((body) => (
        <PlanetBody key={body.id} body={body} props={props} texture={textures.get(body.id)!} ringTexture={body.hasRings ? ringTexture : null} shared={shared} />
      ))}
      {settings.showOrbits && planets.map((body) => <OrbitRing key={`o-${body.id}`} body={body} scale={settings.scale} highlighted={selectedId === body.id} />)}
      {planets.map((body) => (
        <Trail key={`t-${body.id}`} body={body} props={props} />
      ))}

      {/* Controls: damped, light panning in overview and top views (off while
          locked on a planet), a slow drift in close-up. Only the Top preset
          may look straight down. */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.65}
        zoomSpeed={0.8}
        enablePan={cameraPreset === "overview" || cameraPreset === "top" || selectedId === null}
        screenSpacePanning
        panSpeed={0.6}
        minDistance={2}
        maxDistance={170}
        minPolarAngle={cameraPreset === "top" ? 0.03 : 0.32}
        maxPolarAngle={Math.PI * 0.88}
        autoRotate={cameraPreset === "closeup" && selectedId !== null && !reducedMotion}
        autoRotateSpeed={0.45}
      />
      <CameraRig props={props} playIntro={playIntro} />
    </Canvas>
  );
}
