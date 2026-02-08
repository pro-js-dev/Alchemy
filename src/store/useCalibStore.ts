import { create } from 'zustand'
import bundledDefaults from '../data/calibration.json'

export interface CalibOverride {
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

const STORAGE_KEY = 'alchemy_scales'

function normalize(value: unknown): CalibOverride | null {
  if (typeof value === 'number') {
    return { s: value, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, px: 0, py: 0, pz: 0 }
  }
  if (value && typeof value === 'object' && 's' in value) {
    const v = value as Partial<CalibOverride>
    return {
      s: v.s ?? 1, x: v.x ?? 0, y: v.y ?? 0, z: v.z ?? 0,
      rx: v.rx ?? 0, ry: v.ry ?? 0, rz: v.rz ?? 0,
      px: v.px ?? 0, py: v.py ?? 0, pz: v.pz ?? 0,
    }
  }
  return null
}

function parseRecord(raw: unknown): Record<string, CalibOverride> {
  if (typeof raw !== 'object' || raw === null) return {}
  const result: Record<string, CalibOverride> = {}
  for (const [key, value] of Object.entries(raw)) {
    const n = normalize(value)
    if (n) result[key] = n
  }
  return result
}

function readFromStorage(): Record<string, CalibOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return parseRecord(JSON.parse(raw))
  } catch {
    return {}
  }
}

/** Merge bundled defaults (from calibration.json) with localStorage overrides.
 *  localStorage values take priority. */
function buildOverrides(): Record<string, CalibOverride> {
  const defaults = parseRecord(bundledDefaults)
  const local = readFromStorage()
  return { ...defaults, ...local }
}

interface CalibStore {
  overrides: Record<string, CalibOverride>
  loadFromStorage: () => void
}

export const useCalibStore = create<CalibStore>()((set) => ({
  overrides: buildOverrides(),
  loadFromStorage: () => {
    set({ overrides: buildOverrides() })
  },
}))
