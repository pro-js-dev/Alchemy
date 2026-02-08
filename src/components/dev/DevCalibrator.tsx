import { useState, useCallback, useEffect, Suspense, useRef } from 'react'
import {
  Box,
  Typography,
  Slider,
  Button,
  Stack,
  Chip,
  Paper,
  IconButton,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Grid, TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import type { Group } from 'three'
import { create } from 'zustand'
import { itemRegistry } from '../../game/itemRegistry'
import type { ItemDefinition } from '../../game/types'
import { GLBModel } from '../scene/GLBModel'
import { loadAndAutoCalibrate } from '../../utils/autoCalibrate'

const ALL_ITEMS: ItemDefinition[] = [...itemRegistry.values()].sort((a, b) => {
  if (a.chain !== b.chain) return a.chain.localeCompare(b.chain)
  return a.level - b.level
})

const STORAGE_KEY = 'alchemy_scales'
const DELETED_KEY = 'alchemy_deleted'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Calibration data per item
interface CalibData {
  s: number
  x: number
  y: number
  z: number
  rx: number
  ry: number
  rz: number
  px: number
  py: number
  pz: number
}

const CALIB_DEFAULTS: CalibData = { s: 1, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, px: 0, py: 0, pz: 0 }

function toCalib(raw: unknown, defaultScale: number): CalibData {
  if (typeof raw === 'number') return { ...CALIB_DEFAULTS, s: raw }
  if (raw && typeof raw === 'object' && 's' in raw) {
    const r = raw as Partial<CalibData>
    return { ...CALIB_DEFAULTS, s: r.s ?? defaultScale, x: r.x ?? 0, y: r.y ?? 0, z: r.z ?? 0,
      rx: r.rx ?? 0, ry: r.ry ?? 0, rz: r.rz ?? 0, px: r.px ?? 0, py: r.py ?? 0, pz: r.pz ?? 0 }
  }
  return { ...CALIB_DEFAULTS, s: defaultScale }
}

type GizmoMode = 'translate' | 'rotate' | 'scale' | 'none'

// Mini-store для передачи данных внутрь Canvas без пропс-пробрасывания
interface DevStore {
  scale: number
  offset: [number, number, number]
  rotation: [number, number, number]
  pivot: [number, number, number]
  autoRotate: boolean
  showCell: boolean
  gizmoMode: GizmoMode
  isDraggingGizmo: boolean
  setScale: (s: number) => void
  setOffset: (o: [number, number, number]) => void
  setRotation: (r: [number, number, number]) => void
  setPivot: (p: [number, number, number]) => void
  setAutoRotate: (v: boolean) => void
  setShowCell: (v: boolean) => void
  setGizmoMode: (m: GizmoMode) => void
  setIsDraggingGizmo: (v: boolean) => void
}
const useDevStore = create<DevStore>((set) => ({
  scale: 1,
  offset: [0, 0, 0],
  rotation: [0, 0, 0],
  pivot: [0, 0, 0],
  autoRotate: true,
  showCell: false,
  gizmoMode: 'none',
  isDraggingGizmo: false,
  setScale: (s) => set({ scale: s }),
  setOffset: (o) => set({ offset: o }),
  setRotation: (r) => set({ rotation: r }),
  setPivot: (p) => set({ pivot: p }),
  setAutoRotate: (v) => set({ autoRotate: v }),
  setShowCell: (v) => set({ showCell: v }),
  setGizmoMode: (m) => set({ gizmoMode: m }),
  setIsDraggingGizmo: (v) => set({ isDraggingGizmo: v }),
}))

// --- 3D Scene components ---

function PivotMarker() {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const { pivot, scale: s } = useDevStore.getState()
    if (ref.current) {
      ref.current.position.set(pivot[0], 0.5 + pivot[1], pivot[2])
      ref.current.scale.setScalar(Math.min(0.08, 0.03 / Math.max(s, 0.1)))
    }
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#ff4444" depthTest={false} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

/** Transparent cell preview — shows the game cell boundary (1.2 x 1.2) */
function CellPreview() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial color="#4a90d9" transparent opacity={0.15} depthWrite={false} />
    </mesh>
  )
}

/** Wireframe border of the cell */
function CellBorder() {
  return (
    <lineSegments position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <edgesGeometry args={[new THREE.PlaneGeometry(1.2, 1.2)]} />
      <lineBasicMaterial color="#4a90d9" transparent opacity={0.5} />
    </lineSegments>
  )
}

function PreviewItem({ def, transformTarget }: { def: ItemDefinition; transformTarget: React.RefObject<Group | null> }) {
  const baseRef = useRef<Group>(null)
  const innerRef = useRef<Group>(null)
  const targetRef = useRef<Group>(null)
  const pivotRef = useRef<Group>(null)

  // Expose targetRef for TransformControls
  useEffect(() => {
    if (transformTarget && 'current' in transformTarget) {
      (transformTarget as React.MutableRefObject<Group | null>).current = targetRef.current
    }
  })

  useFrame(({ clock }) => {
    const { scale: s, offset, rotation, pivot, autoRotate, isDraggingGizmo, gizmoMode } = useDevStore.getState()

    // Skip target updates while gizmo is being dragged
    if (!isDraggingGizmo && targetRef.current) {
      const DEG2RAD = Math.PI / 180
      targetRef.current.position.set(offset[0], offset[1], offset[2])
      targetRef.current.rotation.set(rotation[0] * DEG2RAD, rotation[1] * DEG2RAD, rotation[2] * DEG2RAD)
      targetRef.current.scale.setScalar(s)
    }
    if (pivotRef.current) {
      pivotRef.current.position.set(-pivot[0], -pivot[1], -pivot[2])
    }
    if (innerRef.current) {
      if (autoRotate && gizmoMode === 'none') {
        const t = clock.getElapsedTime()
        innerRef.current.rotation.y = t * 0.4
        innerRef.current.position.y = Math.sin(t * 0.8) * 0.04
      }
    }
  })

  // Hierarchy:
  // baseRef [0, 0.5, 0] — base height
  //   innerRef — auto-rotate & bob (only when gizmo is off)
  //     targetRef — scale + offset(position) + rotation ← TransformControls target
  //       pivotRef — -pivot offset
  //         model
  return (
    <group ref={baseRef} position={[0, 0.5, 0]}>
      <group ref={innerRef}>
        <group ref={targetRef}>
          <group ref={pivotRef}>
          {def.modelPath ? (
            <Suspense fallback={
              <mesh castShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={def.color} wireframe />
              </mesh>
            }>
              <GLBModel path={def.modelPath} />
            </Suspense>
          ) : (
            <mesh castShadow>
              <sphereGeometry args={[0.3]} />
              <meshStandardMaterial color={def.color} />
            </mesh>
          )}
          </group>
        </group>
      </group>
    </group>
  )
}

/** Gizmo wrapper — syncs TransformControls changes back to DevStore/sliders */
function GizmoWrapper({
  targetRef,
  onTransformChange,
}: {
  targetRef: React.RefObject<Group | null>
  onTransformChange: (mode: GizmoMode, values: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 }) => void
}) {
  const gizmoMode = useDevStore((s) => s.gizmoMode)
  const setIsDragging = useDevStore((s) => s.setIsDraggingGizmo)
  const transformRef = useRef<any>(null)

  // Sync dragging state and read values on change
  useEffect(() => {
    const controls = transformRef.current
    if (!controls) return

    const onDraggingChanged = (event: { value: boolean }) => {
      setIsDragging(event.value)
      if (!event.value && targetRef.current) {
        // Drag ended — read final values from the object
        onTransformChange(gizmoMode, {
          position: targetRef.current.position.clone(),
          rotation: targetRef.current.rotation.clone(),
          scale: targetRef.current.scale.clone(),
        })
      }
    }

    const onObjectChange = () => {
      if (!targetRef.current) return
      onTransformChange(gizmoMode, {
        position: targetRef.current.position.clone(),
        rotation: targetRef.current.rotation.clone(),
        scale: targetRef.current.scale.clone(),
      })
    }

    controls.addEventListener('dragging-changed', onDraggingChanged)
    controls.addEventListener('objectChange', onObjectChange)
    return () => {
      controls.removeEventListener('dragging-changed', onDraggingChanged)
      controls.removeEventListener('objectChange', onObjectChange)
    }
  }, [gizmoMode, setIsDragging, targetRef, onTransformChange])

  if (gizmoMode === 'none' || !targetRef.current) return null

  return (
    <TransformControls
      ref={transformRef}
      object={targetRef.current}
      mode={gizmoMode}
      size={0.75}
    />
  )
}

function ResetCameraButton({ onReset: _onReset }: { onReset: () => void }) {
  const { camera } = useThree()
  useEffect(() => {
    // Set initial perspective camera position
    camera.position.set(2, 2.5, 2)
    camera.lookAt(0, 0.5, 0)
  }, [camera])

  return null
}

function CellOverlay() {
  const showCell = useDevStore((s) => s.showCell)
  if (!showCell) return null
  return (
    <>
      <CellPreview />
      <CellBorder />
    </>
  )
}

function DevScene3D({
  currentItem,
  onTransformChange,
}: {
  currentItem: ItemDefinition
  onTransformChange: (mode: GizmoMode, values: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 }) => void
}) {
  const transformTargetRef = useRef<Group>(null)

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[-4, 10, -3]}
        intensity={2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <hemisphereLight args={['#b1e1ff', '#2a1a3e', 0.3]} />
      <Environment preset="city" environmentIntensity={0.3} />

      {/* Visual helpers */}
      <Grid
        args={[10, 10]}
        position={[0, -0.01, 0]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#888888"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#444444"
        fadeDistance={8}
        infiniteGrid
      />
      <axesHelper args={[1]} position={[0, 0.01, 0]} />
      <PivotMarker />
      <CellOverlay />

      <PreviewItem key={currentItem.id} def={currentItem} transformTarget={transformTargetRef} />
      <GizmoWrapper targetRef={transformTargetRef} onTransformChange={onTransformChange} />

      <OrbitControls
        makeDefault
        target={[0, 0.5, 0]}
        enableDamping
        dampingFactor={0.1}
        minDistance={0.5}
        maxDistance={10}
      />
      <ResetCameraButton onReset={() => {}} />
    </>
  )
}

// --- Property row: slider + number input ---

interface PropRowProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}

function PropRow({ label, value, onChange, min, max, step, suffix }: PropRowProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
        {label}
      </Typography>
      <Slider
        value={value}
        onChange={(_, v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={min}
        max={max}
        step={step}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
        inputProps={{ step, style: { padding: '4px 8px', width: 56, fontSize: 12 } }}
        sx={{ '& .MuiOutlinedInput-root': { height: 28 } }}
      />
      {suffix && (
        <Typography variant="caption" color="text.secondary">{suffix}</Typography>
      )}
    </Stack>
  )
}

// --- Main DevCalibrator component ---

interface DevCalibratorProps {
  onExit: () => void
}

export function DevCalibrator({ onExit }: DevCalibratorProps) {
  const savedCalibRef = useRef<Record<string, CalibData | number>>(readStorage(STORAGE_KEY, {}))

  const [deletedSet, setDeletedSet] = useState<Set<string>>(
    () => {
      const raw = readStorage<string[]>(DELETED_KEY, [])
      return new Set(Array.isArray(raw) ? raw : [])
    },
  )

  const [index, setIndex] = useState(0)
  const currentItem = ALL_ITEMS[index]
  const isDeleted = deletedSet.has(currentItem.id)

  const initCalib = toCalib(savedCalibRef.current[currentItem.id], currentItem.scale)
  const [liveScale, setLiveScale] = useState(initCalib.s)
  const [liveOffset, setLiveOffset] = useState<[number, number, number]>([initCalib.x, initCalib.y, initCalib.z])
  const [liveRotation, setLiveRotation] = useState<[number, number, number]>([initCalib.rx, initCalib.ry, initCalib.rz])
  const [livePivot, setLivePivot] = useState<[number, number, number]>([initCalib.px, initCalib.py, initCalib.pz])
  const [autoRotate, setAutoRotate] = useState(true)
  const [showCell, setShowCell] = useState(false)
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('none')

  const setDevScale = useDevStore((s) => s.setScale)
  const setDevOffset = useDevStore((s) => s.setOffset)
  const setDevRotation = useDevStore((s) => s.setRotation)
  const setDevPivot = useDevStore((s) => s.setPivot)
  const setDevAutoRotate = useDevStore((s) => s.setAutoRotate)
  const setDevShowCell = useDevStore((s) => s.setShowCell)
  const setDevGizmoMode = useDevStore((s) => s.setGizmoMode)

  useEffect(() => { setDevScale(liveScale) }, [liveScale, setDevScale])
  useEffect(() => { setDevOffset(liveOffset) }, [liveOffset, setDevOffset])
  useEffect(() => { setDevRotation(liveRotation) }, [liveRotation, setDevRotation])
  useEffect(() => { setDevPivot(livePivot) }, [livePivot, setDevPivot])
  useEffect(() => { setDevAutoRotate(autoRotate) }, [autoRotate, setDevAutoRotate])
  useEffect(() => { setDevShowCell(showCell) }, [showCell, setDevShowCell])
  useEffect(() => { setDevGizmoMode(gizmoMode) }, [gizmoMode, setDevGizmoMode])

  const toggleGizmoMode = useCallback((mode: GizmoMode) => {
    setGizmoMode((prev) => prev === mode ? 'none' : mode)
  }, [])

  // Callback from TransformControls — sync gizmo changes back to sliders/cookies
  const handleTransformChangeRef = useRef<(mode: GizmoMode, values: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 }) => void>(() => {})
  handleTransformChangeRef.current = (mode, values) => {
    const RAD2DEG = 180 / Math.PI
    if (mode === 'translate' && values.position) {
      const off: [number, number, number] = [values.position.x, values.position.y, values.position.z]
      setLiveOffset(off)
      setDevOffset(off)
      persistCalib(currentItem.id, { ...currentCalib(), x: off[0], y: off[1], z: off[2] })
    } else if (mode === 'rotate' && values.rotation) {
      const rot: [number, number, number] = [
        values.rotation.x * RAD2DEG,
        values.rotation.y * RAD2DEG,
        values.rotation.z * RAD2DEG,
      ]
      setLiveRotation(rot)
      setDevRotation(rot)
      persistCalib(currentItem.id, { ...currentCalib(), rx: rot[0], ry: rot[1], rz: rot[2] })
    } else if (mode === 'scale' && values.scale) {
      // Uniform scale — use x component
      const s = values.scale.x
      setLiveScale(s)
      setDevScale(s)
      persistCalib(currentItem.id, { ...currentCalib(), s })
    }
  }
  const handleTransformChange = useCallback(
    (mode: GizmoMode, values: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 }) => {
      handleTransformChangeRef.current(mode, values)
    },
    [],
  )

  // Sync live values when switching items
  const prevIndexRef = useRef(index)
  if (prevIndexRef.current !== index) {
    prevIndexRef.current = index
    const item = ALL_ITEMS[index]
    const calib = toCalib(savedCalibRef.current[item.id], item.scale)
    setLiveScale(calib.s)
    setDevScale(calib.s)
    const off: [number, number, number] = [calib.x, calib.y, calib.z]
    setLiveOffset(off)
    setDevOffset(off)
    const rot: [number, number, number] = [calib.rx, calib.ry, calib.rz]
    setLiveRotation(rot)
    setDevRotation(rot)
    const piv: [number, number, number] = [calib.px, calib.py, calib.pz]
    setLivePivot(piv)
    setDevPivot(piv)
  }

  const persistCalib = useCallback(
    (id: string, calib: CalibData) => {
      const round = (v: number) => Math.round(v * 100) / 100
      const rounded: CalibData = {
        s: round(calib.s), x: round(calib.x), y: round(calib.y), z: round(calib.z),
        rx: round(calib.rx), ry: round(calib.ry), rz: round(calib.rz),
        px: round(calib.px), py: round(calib.py), pz: round(calib.pz),
      }
      savedCalibRef.current = { ...savedCalibRef.current, [id]: rounded }
      writeStorage(STORAGE_KEY, savedCalibRef.current)
    },
    [],
  )

  const currentCalibRef = useRef<() => CalibData>(() => CALIB_DEFAULTS)
  currentCalibRef.current = () => ({
    s: liveScale,
    x: liveOffset[0], y: liveOffset[1], z: liveOffset[2],
    rx: liveRotation[0], ry: liveRotation[1], rz: liveRotation[2],
    px: livePivot[0], py: livePivot[1], pz: livePivot[2],
  })
  const currentCalib = () => currentCalibRef.current()

  const updateScale = (v: number) => {
    setLiveScale(v)
    setDevScale(v)
    persistCalib(currentItem.id, { ...currentCalib(), s: v })
  }

  const updateOffset = (axis: 0 | 1 | 2, v: number) => {
    const next: [number, number, number] = [...liveOffset]
    next[axis] = v
    setLiveOffset(next)
    setDevOffset(next)
    persistCalib(currentItem.id, { ...currentCalib(), x: next[0], y: next[1], z: next[2] })
  }

  const updateRotation = (axis: 0 | 1 | 2, v: number) => {
    const next: [number, number, number] = [...liveRotation]
    next[axis] = v
    setLiveRotation(next)
    setDevRotation(next)
    persistCalib(currentItem.id, { ...currentCalib(), rx: next[0], ry: next[1], rz: next[2] })
  }

  const updatePivot = (axis: 0 | 1 | 2, v: number) => {
    const next: [number, number, number] = [...livePivot]
    next[axis] = v
    setLivePivot(next)
    setDevPivot(next)
    persistCalib(currentItem.id, { ...currentCalib(), px: next[0], py: next[1], pz: next[2] })
  }

  const resetAll = useCallback(() => {
    const s = currentItem.scale
    setLiveScale(s)
    setDevScale(s)
    const zero: [number, number, number] = [0, 0, 0]
    setLiveOffset(zero)
    setDevOffset(zero)
    setLiveRotation(zero)
    setDevRotation(zero)
    setLivePivot(zero)
    setDevPivot(zero)
    persistCalib(currentItem.id, { ...CALIB_DEFAULTS, s })
  }, [currentItem, setDevScale, setDevOffset, setDevRotation, setDevPivot, persistCalib])

  // --- Auto-calibration ---
  const [isAutoCalibrating, setIsAutoCalibrating] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const [autoTotal, setAutoTotal] = useState(0)

  const handleAutoCalibrate = useCallback(async () => {
    if (!currentItem.modelPath) return
    setIsAutoCalibrating(true)
    try {
      const result = await loadAndAutoCalibrate(currentItem.modelPath)
      const calib: CalibData = {
        ...currentCalib(),
        s: result.s,
        x: result.x, y: result.y, z: result.z,
      }
      setLiveScale(calib.s)
      setDevScale(calib.s)
      const off: [number, number, number] = [calib.x, calib.y, calib.z]
      setLiveOffset(off)
      setDevOffset(off)
      persistCalib(currentItem.id, calib)
    } catch (err) {
      console.warn('Auto-calibrate failed:', err)
    } finally {
      setIsAutoCalibrating(false)
    }
  }, [currentItem, persistCalib, setDevScale, setDevOffset])

  const handleAutoAll = useCallback(async () => {
    const itemsWithModels = ALL_ITEMS.filter((item) => item.modelPath)
    setAutoTotal(itemsWithModels.length)
    setAutoProgress(0)
    setIsAutoCalibrating(true)

    for (let i = 0; i < itemsWithModels.length; i++) {
      const item = itemsWithModels[i]
      try {
        const result = await loadAndAutoCalibrate(item.modelPath!)
        const existing = toCalib(savedCalibRef.current[item.id], item.scale)
        const calib: CalibData = {
          s: result.s,
          x: result.x, y: result.y, z: result.z,
          rx: existing.rx, ry: existing.ry, rz: existing.rz,
          px: existing.px, py: existing.py, pz: existing.pz,
        }
        persistCalib(item.id, calib)
      } catch (err) {
        console.warn(`Auto-calibrate failed for ${item.id}:`, err)
      }
      setAutoProgress(i + 1)
    }

    // Refresh current item display
    const calibData = toCalib(savedCalibRef.current[currentItem.id], currentItem.scale)
    setLiveScale(calibData.s)
    setDevScale(calibData.s)
    setLiveOffset([calibData.x, calibData.y, calibData.z])
    setDevOffset([calibData.x, calibData.y, calibData.z])
    setIsAutoCalibrating(false)
  }, [persistCalib, currentItem, setDevScale, setDevOffset])

  // --- Export / Import ---
  const handleExport = useCallback(() => {
    const json = JSON.stringify(savedCalibRef.current, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calibration.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (typeof parsed === 'object' && parsed !== null) {
          savedCalibRef.current = parsed
          writeStorage(STORAGE_KEY, parsed)
          // Refresh current item display
          const calibData = toCalib(savedCalibRef.current[currentItem.id], currentItem.scale)
          setLiveScale(calibData.s)
          setDevScale(calibData.s)
          setLiveOffset([calibData.x, calibData.y, calibData.z])
          setDevOffset([calibData.x, calibData.y, calibData.z])
          setLiveRotation([calibData.rx, calibData.ry, calibData.rz])
          setDevRotation([calibData.rx, calibData.ry, calibData.rz])
          setLivePivot([calibData.px, calibData.py, calibData.pz])
          setDevPivot([calibData.px, calibData.py, calibData.pz])
        }
      } catch (err) {
        console.warn('Import failed:', err)
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be imported again
    e.target.value = ''
  }, [currentItem, setDevScale, setDevOffset, setDevRotation, setDevPivot])

  const deleteItem = useCallback(
    (id: string) => {
      const next = new Set(deletedSet)
      next.add(id)
      setDeletedSet(next)
      writeStorage(DELETED_KEY, [...next])
    },
    [deletedSet],
  )

  const restoreItem = useCallback(
    (id: string) => {
      const next = new Set(deletedSet)
      next.delete(id)
      setDeletedSet(next)
      writeStorage(DELETED_KEY, [...next])
    },
    [deletedSet],
  )

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % ALL_ITEMS.length)
  }, [])

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + ALL_ITEMS.length) % ALL_ITEMS.length)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'w' || e.key === 'W') toggleGizmoMode('translate')
      else if (e.key === 'e' || e.key === 'E') toggleGizmoMode('rotate')
      else if (e.key === 's' || e.key === 'S') toggleGizmoMode('scale')
      else if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') setGizmoMode('none')
      else if ((e.key === 'r' || e.key === 'R') && e.ctrlKey) { e.preventDefault(); resetAll() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, resetAll, toggleGizmoMode])

  const calibrated = Object.keys(savedCalibRef.current).length
  const deleted = deletedSet.size
  const total = ALL_ITEMS.length

  const AXIS_LABELS = ['X', 'Y', 'Z'] as const

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#1e1e1e' }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          zIndex: 10,
          borderRadius: 0,
          bgcolor: '#2d2d2d',
          color: '#eee',
        }}
      >
        <IconButton onClick={onExit} size="small" sx={{ color: '#eee' }} title="Back to game">
          <Typography>←</Typography>
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dev Calibrator</Typography>

        <Divider orientation="vertical" flexItem sx={{ borderColor: '#555' }} />

        <IconButton size="small" onClick={goPrev} sx={{ color: '#eee' }} title="Prev (←)">
          <Typography>◀</Typography>
        </IconButton>
        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center', color: '#aaa' }}>
          {index + 1} / {total}
        </Typography>
        <IconButton size="small" onClick={goNext} sx={{ color: '#eee' }} title="Next (→)">
          <Typography>▶</Typography>
        </IconButton>

        <Chip label={currentItem.name} size="small" sx={{ bgcolor: '#444', color: '#fff' }} />

        <Divider orientation="vertical" flexItem sx={{ borderColor: '#555' }} />

        {/* Gizmo mode buttons */}
        {(['translate', 'rotate', 'scale'] as const).map((mode) => {
          const labels: Record<GizmoMode, string> = { translate: 'W Move', rotate: 'E Rotate', scale: 'S Scale', none: '' }
          return (
            <Button
              key={mode}
              size="small"
              variant={gizmoMode === mode ? 'contained' : 'text'}
              onClick={() => toggleGizmoMode(mode)}
              sx={{
                textTransform: 'none',
                fontSize: 11,
                minWidth: 0,
                px: 1,
                color: gizmoMode === mode ? '#fff' : '#aaa',
                bgcolor: gizmoMode === mode ? '#555' : 'transparent',
                '&:hover': { bgcolor: gizmoMode === mode ? '#666' : '#3a3a3a' },
              }}
            >
              {labels[mode]}
            </Button>
          )
        })}

        <Box sx={{ flex: 1 }} />

        <Chip label={`${calibrated}/${total}`} color="info" size="small" variant="outlined" />
        {deleted > 0 && <Chip label={`${deleted} del`} color="error" size="small" variant="outlined" />}

      </Paper>

      {/* Main area: viewport + right panel */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 3D Viewport */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Canvas
            camera={{ position: [2, 2.5, 2], fov: 45, near: 0.01, far: 100 }}
            shadows={{ type: PCFSoftShadowMap }}
            gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <DevScene3D currentItem={currentItem} onTransformChange={handleTransformChange} />
          </Canvas>

          {/* Viewport overlay — keyboard hints */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              color: 'rgba(255,255,255,0.35)',
              fontSize: 10,
              pointerEvents: 'none',
            }}
          >
            ← → nav &nbsp; W move &nbsp; E rotate &nbsp; S scale &nbsp; Q off &nbsp; Ctrl+R reset &nbsp; LMB orbit &nbsp; RMB pan
          </Typography>
        </Box>

        {/* Right panel — Inspector */}
        <Paper
          elevation={4}
          sx={{
            width: 320,
            overflow: 'auto',
            borderRadius: 0,
            bgcolor: '#2a2a2a',
            color: '#ddd',
            '& .MuiAccordion-root': { bgcolor: 'transparent', color: '#ddd', boxShadow: 'none' },
            '& .MuiAccordionSummary-root': { minHeight: 36, px: 1.5 },
            '& .MuiAccordionSummary-content': { my: 0.5 },
            '& .MuiAccordionDetails-root': { px: 1.5, pt: 0, pb: 1 },
            '& .MuiTypography-root': { color: '#ddd' },
            '& .MuiSlider-root': { color: '#6b9bff' },
            '& .MuiOutlinedInput-root': {
              color: '#ddd',
              '& fieldset': { borderColor: '#555' },
              '&:hover fieldset': { borderColor: '#888' },
            },
          }}
        >
          {/* Item Info */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Item Info
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {currentItem.name}
                {isDeleted && <Chip label="DEL" color="error" size="small" sx={{ ml: 1, height: 18, fontSize: 10 }} />}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                {currentItem.chain} / lvl {currentItem.level}
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: '#666', fontSize: 10 }}>
                {currentItem.id}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {isDeleted ? (
                  <Button size="small" color="success" variant="outlined"
                    sx={{ textTransform: 'none', fontSize: 11 }}
                    onClick={() => restoreItem(currentItem.id)}>
                    Restore
                  </Button>
                ) : (
                  <Button size="small" color="error" variant="outlined"
                    sx={{ textTransform: 'none', fontSize: 11 }}
                    onClick={() => { deleteItem(currentItem.id); goNext() }}>
                    Delete
                  </Button>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* Scale */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Scale
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PropRow label="S" value={liveScale} onChange={updateScale}
                min={0.01} max={20} step={0.01} />
              <Typography variant="caption" sx={{ color: '#666', fontSize: 10 }}>
                Default: {currentItem.scale}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* Position (Offset) */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Position
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {AXIS_LABELS.map((label, i) => (
                <PropRow key={label} label={label} value={liveOffset[i as 0 | 1 | 2]}
                  onChange={(v) => updateOffset(i as 0 | 1 | 2, v)}
                  min={-5} max={5} step={0.01} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* Rotation */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Rotation
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {AXIS_LABELS.map((label, i) => (
                <PropRow key={label} label={label} value={liveRotation[i as 0 | 1 | 2]}
                  onChange={(v) => updateRotation(i as 0 | 1 | 2, v)}
                  min={-360} max={360} step={1} suffix="°" />
              ))}
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* Pivot */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Pivot
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {AXIS_LABELS.map((label, i) => (
                <PropRow key={label} label={label} value={livePivot[i as 0 | 1 | 2]}
                  onChange={(v) => updatePivot(i as 0 | 1 | 2, v)}
                  min={-5} max={5} step={0.01} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* View Options */}
          <Accordion defaultExpanded disableGutters>
            <AccordionSummary expandIcon={<Typography sx={{ color: '#888' }}>▾</Typography>}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                View
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControlLabel
                control={
                  <Switch size="small" checked={autoRotate}
                    onChange={(_, v) => setAutoRotate(v)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6b9bff' } }}
                  />
                }
                label={<Typography variant="caption">Auto-rotate</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch size="small" checked={showCell}
                    onChange={(_, v) => setShowCell(v)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4a90d9' } }}
                  />
                }
                label={<Typography variant="caption">Show cell (1.2 x 1.2)</Typography>}
              />
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderColor: '#444' }} />

          {/* Actions */}
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={handleAutoCalibrate}
              disabled={!currentItem.modelPath || isAutoCalibrating}
              sx={{ textTransform: 'none', mb: 1, bgcolor: '#4a6fa5', '&:hover': { bgcolor: '#5a7fb5' } }}
            >
              Auto Calibrate
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={handleAutoAll}
              disabled={isAutoCalibrating}
              sx={{ textTransform: 'none', color: '#aaa', borderColor: '#555', mb: 1 }}
            >
              {isAutoCalibrating && autoTotal > 0
                ? `Auto All (${autoProgress}/${autoTotal})`
                : 'Auto All'}
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={resetAll}
              sx={{ textTransform: 'none', color: '#eee', borderColor: '#555', mb: 1 }}
            >
              Reset All (Ctrl+R)
            </Button>

            <Divider sx={{ borderColor: '#444', my: 1 }} />

            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleExport}
                sx={{ textTransform: 'none', color: '#8bc34a', borderColor: '#5a7a2e', fontSize: 11 }}
              >
                Export JSON
              </Button>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleImport}
                sx={{ textTransform: 'none', color: '#aaa', borderColor: '#555', fontSize: 11 }}
              >
                Import JSON
              </Button>
            </Stack>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Typography variant="caption" sx={{ color: '#555', fontSize: 9, mt: 0.5, display: 'block' }}>
              Export → save to src/data/calibration.json → commit
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
