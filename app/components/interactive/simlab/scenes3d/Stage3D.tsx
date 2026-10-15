"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import type { ReactNode } from "react";

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export const STUDIO = "#0c1424";

// The shared 3D stage: a dark studio with soft light-boxes, reflections and
// contact shadows, so glass, metal and liquid look like real objects. Drag to
// rotate, scroll or pinch to zoom. Every experiment's scene is dropped in as
// children. No WebGL (or a very old device)? The flat 2D scene is shown.
export default function Stage3D({
  children,
  camera,
  target = [0, 0.8, 0],
  autoRotate = false,
  ownLights = false,
  fallback,
}: {
  children: ReactNode;
  camera: [number, number, number];
  target?: [number, number, number];
  autoRotate?: boolean;
  ownLights?: boolean;
  fallback: ReactNode;
}) {
  const ok = webglAvailable();
  if (!ok) return <>{fallback}</>;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      camera={{ position: camera, fov: 40, near: 0.1, far: 220 }}
      style={{ width: "100%", height: "100%" }}
    >
      {!ownLights && (
        <>
          <color attach="background" args={[STUDIO]} />
          <fog attach="fog" args={[STUDIO, 28, 70]} />
          <ambientLight intensity={0.25} />
          <hemisphereLight args={["#cfe3ff", "#1b2438", 0.5]} />
          <directionalLight
            position={[7, 12, 8]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-camera-far={50}
            shadow-bias={-0.0004}
            shadow-radius={5}
          />
          <directionalLight position={[-8, 5, -6]} intensity={0.7} color="#9db8ff" />
          <directionalLight position={[0, 4, 14]} intensity={0.9} />
          {/* Soft light boxes: they never show, but glass and metal reflect them. */}
          <Environment resolution={256} frames={1} environmentIntensity={0.9}>
            <Lightformer form="rect" intensity={4} position={[0, 9, 2]} scale={[16, 6, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={2.4} position={[-9, 4, 3]} scale={[8, 6, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={2.4} position={[9, 4, 3]} scale={[8, 6, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer form="rect" intensity={1.4} position={[0, 3, -9]} scale={[18, 5, 1]} />
            <Lightformer form="ring" intensity={2} color="#cfe0ff" position={[0, 5, 9]} scale={6} />
          </Environment>
          <ContactShadows position={[0, 0.005, 0]} opacity={0.55} scale={30} blur={2.6} far={7} resolution={1024} color="#02060f" />
        </>
      )}
      {children}
      <OrbitControls
        makeDefault
        enablePan={false}
        target={target}
        minDistance={4}
        maxDistance={40}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
        maxPolarAngle={ownLights ? Math.PI * 0.95 : Math.PI * 0.52}
      />
    </Canvas>
  );
}
