"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { realisticGeometry } from "@/lib/human-body/geometry";
import { BODY_PARTS, focusOf, LAYERS, shapesOf, type BodyPart, type LayerId, type Shape } from "@/lib/human-body/body-data";

import type { BodyViewApi } from "./view-types";

// The 3D body. Four layers sit one inside another; the learner "peels" down to
// the layer they want. Only that layer can be tapped. The layers outside it
// fade away and the ones underneath stay as a faint ghost, so you can always
// see where you are in the body.

const LAYER_ORDER: LayerId[] = LAYERS.map((layer) => layer.id);
const HOME_POSITION = new THREE.Vector3(0, 0.15, 6.6);
const HOME_TARGET = new THREE.Vector3(0, -0.02, 0);
const FOCUS_SECONDS = 1.6;
const noRaycast = () => undefined;

// How glossy each layer is: skin and bone are satin, muscle and organs look wet.
const LAYER_FINISH: Record<LayerId, { roughness: number; clearcoat: number; clearcoatRoughness: number }> = {
  skin: { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 },
  muscle: { roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.3 },
  organs: { roughness: 0.3, clearcoat: 0.85, clearcoatRoughness: 0.18 },
  skeleton: { roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.35 },
};

interface Props {
  layer: LayerId;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Auto-rotate the body slowly. Stops as soon as the learner takes control. */
  spin: boolean;
  onUserMove: () => void;
  reducedMotion: boolean;
  /** False while the viewport is off screen, so nothing is drawn. */
  active: boolean;
  apiRef: { current: BodyViewApi | null };
  /** Quiz mode hides the name tag, which would give the answer away. */
  hideLabels: boolean;
}

/** How visible a layer should be when `focus` is the layer being studied. */
function targetAlpha(index: number, focusIndex: number): number {
  if (index < focusIndex) return 0; // peeled away
  if (index === focusIndex) return 1;
  // Under the skin nothing shows through; deeper down, a faint ghost remains.
  if (focusIndex === 0) return 0;
  return index === focusIndex + 1 ? 0.1 : 0.04; // ghost of what lies beneath
}

function ShapeMesh({ shape, material, active, onClick, onOver, onOut }: {
  shape: Shape;
  material: THREE.Material;
  active: boolean;
  onClick: (event: ThreeEvent<MouseEvent>) => void;
  onOver: (event: ThreeEvent<PointerEvent>) => void;
  onOut: () => void;
}) {
  const handlers = active ? { onClick, onPointerOver: onOver, onPointerOut: onOut } : { raycast: noRaycast };

  if (shape.t === "ring") {
    // A rib: a torus lying flat, open at the front (+z) where the breastbone sits.
    const gap = 0.9;
    return (
      <group position={shape.p} rotation={[0.25, -(Math.PI / 2 + gap / 2), 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, shape.rz / shape.rx, 1]} material={material} {...handlers}>
          <torusGeometry args={[shape.rx, shape.tube, 8, 44, Math.PI * 2 - gap]} />
        </mesh>
      </group>
    );
  }
  if (shape.t === "c") {
    return (
      <mesh position={shape.p} rotation={[0, 0, shape.rot ?? 0]} material={material} {...handlers}>
        <capsuleGeometry args={[shape.rad, Math.max(shape.len - shape.rad * 2, 0.001), 6, 18]} />
      </mesh>
    );
  }
  return (
    <mesh position={shape.p} rotation={[0, 0, shape.rot ?? 0]} scale={shape.r} material={material} {...handlers}>
      <sphereGeometry args={[1, 28, 20]} />
    </mesh>
  );
}

function PartMesh({ part, alphaRef, hovered, selected, studied, snap, onSelect, onHover }: {
  part: BodyPart;
  alphaRef: { current: Record<LayerId, number> };
  hovered: boolean;
  selected: boolean;
  /** True when this part's layer is the one being studied (so it can be tapped). */
  studied: boolean;
  snap: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  // Organs, muscles, the skull and the long bones have detailed painted meshes.
  // Anything else draws from its simple shapes.
  const geometry = useMemo(() => realisticGeometry(part), [part]);
  const material = useMemo(() => {
    const finish = LAYER_FINISH[part.layer];
    return new THREE.MeshPhysicalMaterial({
      color: geometry ? "#ffffff" : part.color,
      vertexColors: Boolean(geometry),
      roughness: finish.roughness,
      clearcoat: finish.clearcoat,
      clearcoatRoughness: finish.clearcoatRoughness,
      metalness: 0,
      transparent: true,
      emissive: new THREE.Color("#2d8cff"),
      emissiveIntensity: 0,
    });
  }, [part.color, part.layer, geometry]);
  // The frame loop reaches the material through a ref (it changes it every frame).
  const materialRef = useRef(material);
  useEffect(() => {
    materialRef.current = material;
    return () => material.dispose();
  }, [material]);
  const shapes = useMemo(() => shapesOf(part), [part]);
  const live = useRef({ hovered, selected, snap });
  useEffect(() => {
    live.current = { hovered, selected, snap };
  }, [hovered, selected, snap]);

  // Fade with the layer, and glow when hovered or selected.
  useFrame(({ clock }, delta) => {
    const mat = materialRef.current;
    const alpha = alphaRef.current[part.layer];
    mat.opacity = alpha;
    mat.visible = alpha > 0.01;
    mat.depthWrite = alpha > 0.9;
    const { hovered: isHover, selected: isSelected, snap: still } = live.current;
    const pulse = isSelected && !still ? 0.5 + 0.12 * Math.sin(clock.elapsedTime * 3.2) : isSelected ? 0.55 : 0;
    const wanted = Math.max(pulse, isHover ? 0.32 : 0);
    mat.emissiveIntensity += (wanted - mat.emissiveIntensity) * Math.min(1, delta * 12);
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6) return; // that was a drag, not a tap
    event.stopPropagation();
    onSelect(part.id);
  };
  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(part.id);
  };

  return (
    <group renderOrder={LAYER_ORDER.indexOf(part.layer)}>
      {geometry ? (
        <mesh geometry={geometry} material={material} {...(studied ? { onClick: handleClick, onPointerOver: handleOver, onPointerOut: () => onHover(null) } : { raycast: noRaycast })} />
      ) : (
        shapes.map((shape, index) => (
          <ShapeMesh key={index} shape={shape} material={material} active={studied} onClick={handleClick} onOver={handleOver} onOut={() => onHover(null)} />
        ))
      )}
    </group>
  );
}

/** Moves the camera to the chosen part, then hands control back to the learner. */
function CameraRig({ controlsRef, selectedId, reducedMotion, apiRef }: {
  controlsRef: { current: OrbitControlsImpl | null };
  selectedId: string | null;
  reducedMotion: boolean;
  apiRef: { current: BodyViewApi | null };
}) {
  const { camera, invalidate } = useThree();
  const timer = useRef(0);
  const desired = useRef<{ target: THREE.Vector3; distance: number; back: boolean } | null>(null);

  useEffect(() => {
    const part = selectedId ? BODY_PARTS.find((item) => item.id === selectedId) : null;
    if (part) {
      const [x, y, z] = focusOf(part);
      desired.current = { target: new THREE.Vector3(x * 0.6, y, 0), distance: 4.4, back: z < -0.05 };
    } else {
      desired.current = { target: HOME_TARGET.clone(), distance: HOME_POSITION.z, back: false };
    }
    timer.current = FOCUS_SECONDS;
    invalidate();
  }, [selectedId, invalidate]);

  useEffect(() => {
    apiRef.current = {
      resetView: () => {
        const controls = controlsRef.current;
        camera.position.copy(HOME_POSITION);
        controls?.target.copy(HOME_TARGET);
        controls?.update();
        desired.current = null;
        timer.current = 0;
        invalidate();
      },
      zoomBy: (factor: number) => {
        const controls = controlsRef.current;
        if (!controls) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(offset.length() / factor, 2.6, 9);
        camera.position.copy(controls.target).add(offset.setLength(distance));
        controls.update();
        invalidate();
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [camera, controlsRef, apiRef, invalidate]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const goal = desired.current;
    if (!controls || !goal || timer.current <= 0) return;
    timer.current -= delta;
    const k = reducedMotion ? 1 : 1 - Math.exp(-5 * delta);
    controls.target.lerp(goal.target, k);

    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.radius += (goal.distance - spherical.radius) * k;
    // Turn to the back for back muscles; come round to the front otherwise.
    const wantedTheta = goal.back ? Math.PI : 0;
    let diff = wantedTheta - spherical.theta;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    if (goal.back || Math.abs(spherical.theta) > Math.PI / 2) spherical.theta += diff * k;
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
  });
  return null;
}

function Scene({ layer, selectedId, onSelect, spin, onUserMove, reducedMotion, apiRef, hideLabels }: Omit<Props, "active">) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const gl = useThree((state) => state.gl);
  const [hovered, setHovered] = useState<string | null>(null);
  const focusIndex = LAYER_ORDER.indexOf(layer);

  const alphaRef = useRef<Record<LayerId, number>>({ skin: 1, muscle: 0, organs: 0, skeleton: 0 });
  // Ease each layer's opacity toward its target (instant if motion is reduced).
  useFrame((_, delta) => {
    const k = reducedMotion ? 1 : 1 - Math.exp(-7 * delta);
    LAYER_ORDER.forEach((id, index) => {
      const goal = targetAlpha(index, focusIndex);
      alphaRef.current[id] += (goal - alphaRef.current[id]) * k;
    });
    // Negative priority: runs before the parts read these values in the same frame
    // (matters when motion is reduced and only one frame is drawn per change).
  }, -1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    canvasRef.current = gl.domElement;
  }, [gl]);
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.style.cursor = hovered ? "pointer" : "grab";
  }, [hovered]);

  const selected = selectedId ? BODY_PARTS.find((part) => part.id === selectedId) ?? null : null;
  const labelAt = selected ? focusOf(selected) : null;

  return (
    <>
      {/* A small studio made of light panels, so glossy surfaces have something to reflect. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#9ec8ff" position={[-5, 1, 2]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[5, 0, -3]} scale={[3, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 5]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#7fb4ff" />
      <pointLight position={[0, 0.4, 3]} intensity={0.9} color="#bcd9ff" distance={9} />

      {/* Stage: a thin glowing ring and a soft disc under the feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 0]}>
        <ringGeometry args={[0.95, 0.985, 96]} />
        <meshBasicMaterial color="#4aa3ff" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.851, 0]}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial color="#2d7be0" transparent opacity={0.1} />
      </mesh>

      {BODY_PARTS.map((part) => (
        <PartMesh
          key={part.id}
          part={part}
          alphaRef={alphaRef}
          hovered={hovered === part.id}
          selected={selectedId === part.id}
          studied={part.layer === layer}
          snap={reducedMotion}
          onSelect={onSelect}
          onHover={setHovered}
        />
      ))}

      {selected && labelAt && !hideLabels && (
        <Html position={[labelAt[0] * 0.6, labelAt[1], Math.max(labelAt[2], 0) + 0.3]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <span className="rx-body-label">{selected.name}</span>
        </Html>
      )}

      <CameraRig controlsRef={controlsRef} selectedId={selectedId} reducedMotion={reducedMotion} apiRef={apiRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.09}
        minDistance={2.6}
        maxDistance={9}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI - 0.55}
        autoRotate={spin && !reducedMotion && !selectedId}
        autoRotateSpeed={1.1}
        target={[HOME_TARGET.x, HOME_TARGET.y, HOME_TARGET.z]}
        onStart={onUserMove}
      />
    </>
  );
}

export default function HumanBody3D({ active, ...rest }: Props) {
  return (
    <Canvas
      frameloop={active && !rest.reducedMotion ? "always" : "demand"}
      dpr={[1, 1.75]}
      camera={{ position: HOME_POSITION.toArray(), fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => rest.onSelect(null)}
      aria-label="3D human body. Drag to turn it, scroll to zoom, tap a part to learn about it."
      role="img"
    >
      <Scene {...rest} />
    </Canvas>
  );
}
