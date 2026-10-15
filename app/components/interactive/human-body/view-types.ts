// What the 3D view lets the experience do to the camera.
export interface BodyViewApi {
  resetView: () => void;
  zoomBy: (factor: number) => void;
}
