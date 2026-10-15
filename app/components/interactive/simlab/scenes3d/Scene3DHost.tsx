"use client";

import Stage3D from "./Stage3D";
import { scenes3d } from "./scenes";

import type { ReactNode } from "react";
import type { SimState } from "../types";

// Loaded lazily (three.js is heavy) the first time a 3D view is shown.
export default function Scene3DHost({
  sceneKey,
  state,
  autoRotate,
  fallback,
}: {
  sceneKey: string;
  state: SimState;
  autoRotate: boolean;
  fallback: ReactNode;
}) {
  const def = scenes3d[sceneKey];
  if (!def) return <>{fallback}</>;
  const Scene = def.Scene;
  return (
    <Stage3D
      camera={def.camera}
      target={def.target}
      ownLights={def.ownLights}
      autoRotate={autoRotate}
      fallback={fallback}
    >
      <Scene state={state} />
    </Stage3D>
  );
}
