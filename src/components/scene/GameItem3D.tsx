import { useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MathUtils } from "three";
import type { Group } from "three";
import { gridToWorld } from "../../game/gridUtils";
import { getItemDef } from "../../game/itemRegistry";
import type { BoardItem } from "../../game/types";
import { useCalibStore } from "../../store/useCalibStore";
import { useGameStore } from "../../store/useGameStore";
import { releaseModelSlot, requestModelSlot } from "../../utils/modelLoadQueue";
import { GLBModel } from "./GLBModel";
import { ItemGeometry } from "./ItemGeometry";

const MERGE_ANIM_DURATION = 0.45; // seconds

const DEG2RAD = Math.PI / 180;

interface GameItem3DProps {
  item: BoardItem;
}

export function GameItem3D({ item }: GameItem3DProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const boardRows = useGameStore((s) => s.boardRows);
  const boardCols = useGameStore((s) => s.boardCols);
  const selectedItemId = useGameStore((s) => s.selectedItemId);
  const dragItemId = useGameStore((s) => s.dragItemId);
  const dragWorldPos = useGameStore((s) => s.dragWorldPos);

  const mergedItemId = useGameStore((s) => s.mergedItemId);

  const def = getItemDef(item.definitionId);
  const calib = useCalibStore(
    useCallback((s) => s.overrides[item.definitionId], [item.definitionId]),
  );
  const worldPos = gridToWorld(item.position, boardRows, boardCols);
  const isSelected = selectedItemId === item.instanceId;
  const isDragging = dragItemId === item.instanceId;
  const isMerged = mergedItemId === item.instanceId;

  // Merge animation state
  const mergeAnimStart = useRef<number | null>(null);
  const mergeScale = useRef(1);

  useEffect(() => {
    if (isMerged) {
      mergeAnimStart.current = -1; // will be set to clock time on first frame
    }
  }, [isMerged]);

  // Effective calibration values (override from store or fallback to ItemDefinition defaults)
  const effectiveScale = calib?.s ?? def.scale;
  const effectiveOffset: [number, number, number] = calib
    ? [calib.x, calib.y, calib.z]
    : (def.offset ?? [0, 0, 0]);
  const effectiveRotation: [number, number, number] = calib
    ? [calib.rx * DEG2RAD, calib.ry * DEG2RAD, calib.rz * DEG2RAD]
    : [0, 0, 0];
  const effectivePivot: [number, number, number] = calib
    ? [-calib.px, -calib.py, -calib.pz]
    : [0, 0, 0];

  // Queued model loading — only mount GLBModel when a slot is available
  const [canLoad, setCanLoad] = useState(false);
  const slotState = useRef<"none" | "acquired" | "released">("none");

  useEffect(() => {
    if (!def.modelPath) return;
    const cancel = requestModelSlot(() => {
      slotState.current = "acquired";
      setCanLoad(true);
    });
    return () => {
      cancel();
      if (slotState.current === "acquired") {
        releaseModelSlot();
        slotState.current = "released";
      }
    };
  }, [def.modelPath]);

  const handleModelLoaded = useCallback(() => {
    if (slotState.current === "acquired") {
      slotState.current = "released";
      releaseModelSlot();
    }
  }, []);

  // Позиция: при drag следуем за курсором, иначе — grid-позиция
  const displayX = isDragging && dragWorldPos ? dragWorldPos[0] : worldPos[0];
  const displayZ = isDragging && dragWorldPos ? dragWorldPos[2] : worldPos[2];

  // Уникальные скорости вращения и фазы для каждого предмета
  const motion = useMemo(
    () => ({
      spinX: 0.15 + Math.random() * 0.2,
      spinY: 0.25 + Math.random() * 0.3,
      spinZ: 0.1 + Math.random() * 0.15,
      bobSpeed: 0.8 + Math.random() * 0.4,
      bobAmplitude: 0.04,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
    }),
    [],
  );

  const yOffset = isDragging ? 0.8 : 0.5;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const speed = isSelected ? 3 : 1;

    groupRef.current.rotation.x =
      Math.sin(t * motion.spinX * speed + motion.phaseX) * 0.3 * speed;
    groupRef.current.rotation.y = t * motion.spinY * speed + motion.phaseY;
    groupRef.current.rotation.z =
      Math.sin(t * motion.spinZ * speed + motion.phaseZ) * 0.2 * speed;

    const bob = isSelected ? motion.bobAmplitude * 2.5 : motion.bobAmplitude;
    groupRef.current.position.y =
      yOffset + Math.sin(t * motion.bobSpeed * speed) * bob;

    // Merge bounce animation
    if (mergeAnimStart.current !== null) {
      if (mergeAnimStart.current < 0) mergeAnimStart.current = t;
      const elapsed = t - mergeAnimStart.current;
      const progress = Math.min(elapsed / MERGE_ANIM_DURATION, 1);
      // Elastic bounce: overshoot to ~1.5 then settle to 1.0
      const ease = 1 + Math.sin(progress * Math.PI) * 0.5 * (1 - progress);
      mergeScale.current = MathUtils.lerp(0, ease, Math.min(progress * 3, 1));
      if (progress >= 1) {
        mergeScale.current = 1;
        mergeAnimStart.current = null;
        useGameStore.setState({ mergedItemId: null });
      }
    }
  });

  let scale = effectiveScale * mergeScale.current;
  if (isDragging) scale *= 2;
  else if (isSelected) scale *= 1.2;
  else if (hovered) scale *= 1.1;

  return (
    <group position={[displayX, 0, displayZ]}>
      <group ref={groupRef} position={[0, yOffset, 0]} castShadow>
        <group
          castShadow
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {def.modelPath ? (
            canLoad ? (
              <Suspense
                fallback={
                  <mesh castShadow scale={scale}>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color={def.color} wireframe />
                  </mesh>
                }
              >
                <group
                  scale={scale}
                  position={effectiveOffset}
                  rotation={effectiveRotation}
                >
                  <group position={effectivePivot}>
                    <GLBModel path={def.modelPath} onLoad={handleModelLoaded} />
                  </group>
                </group>
              </Suspense>
            ) : (
              <mesh castShadow scale={scale}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={def.color} wireframe />
              </mesh>
            )
          ) : (
            <mesh castShadow scale={scale}>
              <ItemGeometry
                geometryType={def.geometry}
                args={def.geometryArgs}
              />
              <meshPhysicalMaterial
                color={def.color}
                emissive={isSelected || isDragging ? def.color : "#000000"}
                emissiveIntensity={isSelected || isDragging ? 0.4 : 0}
                roughness={0.25}
                metalness={0.15}
                clearcoat={0.8}
                clearcoatRoughness={0.2}
                envMapIntensity={1.0}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}
