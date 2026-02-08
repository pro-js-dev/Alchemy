import { useState } from 'react'
import { gridToWorld, worldToGrid, CELL_SIZE } from '../../game/gridUtils'
import { useGameStore } from '../../store/useGameStore'

interface GridCell3DProps {
  row: number
  col: number
}

export function GridCell3D({ row, col }: GridCell3DProps) {
  const [hovered, setHovered] = useState(false)
  const boardRows = useGameStore((s) => s.boardRows)
  const boardCols = useGameStore((s) => s.boardCols)
  const selectedItemId = useGameStore((s) => s.selectedItemId)
  const selectItem = useGameStore((s) => s.selectItem)
  const moveItem = useGameStore((s) => s.moveItem)
  const startDrag = useGameStore((s) => s.startDrag)
  const dragItemId = useGameStore((s) => s.dragItemId)
  const dragWorldPos = useGameStore((s) => s.dragWorldPos)

  const itemAtCell = useGameStore((s) =>
    s.items.find((i) => i.position.row === row && i.position.col === col),
  )

  const position = gridToWorld({ row, col }, boardRows, boardCols)

  // Подсветка ячейки как drop target при перетаскивании
  const isDragTarget = (() => {
    if (!dragItemId || !dragWorldPos) return false
    const target = worldToGrid(dragWorldPos[0], dragWorldPos[2], boardRows, boardCols)
    return target !== null && target.row === row && target.col === col
  })()

  const handlePointerDown = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (dragItemId) return // Во время drag клики игнорируются
    if (!selectedItemId) {
      if (itemAtCell) {
        startDrag(itemAtCell.instanceId)
      }
    } else if (selectedItemId === itemAtCell?.instanceId) {
      selectItem(null)
    } else {
      moveItem(selectedItemId, { row, col })
    }
  }

  // Цвета в стиле клетчатой скатерти (красно-белая)
  const isEven = (row + col) % 2 === 0
  let color = isEven ? '#f5f0e8' : '#c0392b'
  if (isDragTarget) color = isEven ? '#d4f5d4' : '#4CAF50'
  else if (hovered && selectedItemId) color = isEven ? '#ffe0d0' : '#e74c3c'

  return (
    <group>
      {/* Видимая клетка скатерти */}
      <mesh
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[CELL_SIZE * 0.98, CELL_SIZE * 0.98]} />
        <meshStandardMaterial
          color={color}
          roughness={0.92}
          metalness={0.0}
          opacity={isDragTarget ? 0.9 : hovered && selectedItemId ? 0.85 : 0.75}
          transparent
        />
      </mesh>

      {/* Невидимая кликабельная зона выше поверхности (ловит клики мимо 3D-объектов) */}
      <mesh
        position={[position[0], 0.5, position[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[CELL_SIZE, CELL_SIZE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
