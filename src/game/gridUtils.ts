import type { GridPosition } from './types'

export const CELL_SIZE = 1.2

export function gridToWorld(
  pos: GridPosition,
  boardRows: number,
  boardCols: number,
): [number, number, number] {
  const offsetX = ((boardCols - 1) * CELL_SIZE) / 2
  const offsetZ = ((boardRows - 1) * CELL_SIZE) / 2
  return [pos.col * CELL_SIZE - offsetX, 0, pos.row * CELL_SIZE - offsetZ]
}

export function worldToGrid(
  x: number,
  z: number,
  boardRows: number,
  boardCols: number,
): GridPosition | null {
  const offsetX = ((boardCols - 1) * CELL_SIZE) / 2
  const offsetZ = ((boardRows - 1) * CELL_SIZE) / 2
  const col = Math.round((x + offsetX) / CELL_SIZE)
  const row = Math.round((z + offsetZ) / CELL_SIZE)
  if (row < 0 || row >= boardRows || col < 0 || col >= boardCols) return null
  return { row, col }
}
