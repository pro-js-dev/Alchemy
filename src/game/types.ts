export const GEOMETRY_TYPES = {
  Box: 'Box',
  Sphere: 'Sphere',
  Cylinder: 'Cylinder',
  Cone: 'Cone',
  Torus: 'Torus',
  Dodecahedron: 'Dodecahedron',
  Octahedron: 'Octahedron',
  Icosahedron: 'Icosahedron',
} as const

export type GeometryType = (typeof GEOMETRY_TYPES)[keyof typeof GEOMETRY_TYPES]

export interface ItemDefinition {
  id: string
  name: string
  chain: string
  level: number
  mergesInto: string | null
  /** Примитивная геометрия (используется если modelPath не задан) */
  geometry: GeometryType
  color: string
  scale: number
  /** Смещение модели [x, y, z] для коррекции позиции */
  offset?: [number, number, number]
  geometryArgs?: number[]
  /** Путь к GLB-модели (приоритет над geometry) */
  modelPath?: string
  scoreValue: number
}

export interface GridPosition {
  row: number
  col: number
}

export interface BoardItem {
  instanceId: string
  definitionId: string
  position: GridPosition
}

export interface Generator {
  instanceId: string
  chain: string
  spawnsDefinitionId: string
  /** Pool of definition IDs to spawn randomly from (overrides spawnsDefinitionId) */
  spawnsPool?: string[]
  usesRemaining: number
  position: GridPosition
}

export interface GameState {
  boardRows: number
  boardCols: number
  items: BoardItem[]
  generators: Generator[]
  selectedItemId: string | null
  score: number
  moves: number

  // Drag & drop
  dragItemId: string | null
  dragWorldPos: [number, number, number] | null

  // Merge animation
  mergedItemId: string | null

  selectItem: (instanceId: string | null) => void
  moveItem: (instanceId: string, target: GridPosition) => void
  spawnItem: (generatorId: string) => void
  addItem: (definitionId: string, position: GridPosition) => void
  startDrag: (instanceId: string) => void
  updateDrag: (worldPos: [number, number, number]) => void
  endDrag: () => void
  initBoard: () => void
}
