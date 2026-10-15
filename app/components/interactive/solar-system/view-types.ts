import type { MutableRefObject } from "react";

import type { BodyId, CameraPreset, SimClock, SimSettings } from "@/lib/solar-system/solar-system-types";

export interface ViewApi {
  zoomBy: (factor: number) => void;
  resetView: () => void;
}

// Everything the 2D and 3D views share. The clock lives in a ref owned by the
// experiment so switching views never restarts the simulation.
export interface SolarViewProps {
  clockRef: MutableRefObject<SimClock>;
  settings: SimSettings;
  selectedId: BodyId | null;
  onSelect: (id: BodyId | null) => void;
  apiRef: MutableRefObject<ViewApi | null>;
  reducedMotion: boolean;
  /** 3D only: which camera framing to use. The 2D view ignores it. */
  cameraPreset: CameraPreset;
}
