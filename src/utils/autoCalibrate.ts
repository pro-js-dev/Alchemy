import type { Object3D } from "three";
import { Box3, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CELL_SIZE } from "../game/gridUtils";

export interface AutoCalibResult {
  s: number;
  x: number;
  y: number;
  z: number;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Compute scale + offset to center a model and fit it within a game cell.
 * TARGET ≈ 0.45 * CELL_SIZE so the model fills ~90% of the cell with padding.
 */
export function computeAutoCalib(object: Object3D): AutoCalibResult {
  const box = new Box3().setFromObject(object);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const TARGET = CELL_SIZE * 0.45 * 1.7;
  const s = maxDim > 0 ? TARGET / maxDim : 1;

  // Position and scale are on the same Three.js group (matrix = T * R * S),
  // so offset must be in parent space: offset = -center * s
  return {
    s: round2(s),
    x: round2(-center.x * s),
    y: round2(-center.y * s),
    z: round2(-center.z * s),
  };
}

const loader = new GLTFLoader();

/**
 * Load a GLB model and compute auto-calibration values.
 * Uses GLTFLoader directly (not useGLTF) so it works outside React components.
 * Browser HTTP cache prevents duplicate network requests.
 */
export function loadAndAutoCalibrate(
  modelPath: string,
): Promise<AutoCalibResult> {
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => resolve(computeAutoCalib(gltf.scene)),
      undefined,
      reject,
    );
  });
}
