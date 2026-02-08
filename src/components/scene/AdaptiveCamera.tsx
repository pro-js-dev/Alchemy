import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { CELL_SIZE } from '../../game/gridUtils'
import { useGameStore } from '../../store/useGameStore'

const PADDING = 1.4

export function AdaptiveCamera() {
  const { camera, size } = useThree()
  const boardRows = useGameStore((s) => s.boardRows)
  const boardCols = useGameStore((s) => s.boardCols)

  useEffect(() => {
    const boardW = boardCols * CELL_SIZE + PADDING
    const boardH = boardRows * CELL_SIZE + PADDING
    camera.zoom = Math.min(size.width / boardW, size.height / boardH)
    camera.updateProjectionMatrix()
  }, [camera, size, boardRows, boardCols])

  return null
}
