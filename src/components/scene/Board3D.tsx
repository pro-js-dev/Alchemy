import { useMemo } from 'react'
import { CanvasTexture, RepeatWrapping } from 'three'
import { useGameStore } from '../../store/useGameStore'
import { CELL_SIZE } from '../../game/gridUtils'
import { GridCell3D } from './GridCell3D'
import { GameItem3D } from './GameItem3D'

/** Рисуем gingham-паттерн скатерти на canvas */
function createTableclothTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const cellPx = size / 8 // 8 полос на текстуру

  // Фон — белый / кремовый
  ctx.fillStyle = '#f5f0e8'
  ctx.fillRect(0, 0, size, size)

  // Горизонтальные полосы (полупрозрачный красный)
  ctx.fillStyle = 'rgba(192, 57, 43, 0.45)'
  for (let i = 0; i < 8; i += 2) {
    ctx.fillRect(0, i * cellPx, size, cellPx)
  }

  // Вертикальные полосы (полупрозрачный красный → пересечения темнее)
  ctx.fillStyle = 'rgba(192, 57, 43, 0.45)'
  for (let i = 0; i < 8; i += 2) {
    ctx.fillRect(i * cellPx, 0, cellPx, size)
  }

  // Лёгкая текстура ткани — тонкие линии
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
  ctx.lineWidth = 1
  for (let y = 0; y < size; y += 4) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
  for (let x = 0; x < size; x += 4) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

export function Board3D() {
  const boardRows = useGameStore((s) => s.boardRows)
  const boardCols = useGameStore((s) => s.boardCols)
  const items = useGameStore((s) => s.items)
  const dragItemId = useGameStore((s) => s.dragItemId)
  const updateDrag = useGameStore((s) => s.updateDrag)
  const endDrag = useGameStore((s) => s.endDrag)

  const cells: { row: number; col: number }[] = []
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      cells.push({ row: r, col: c })
    }
  }

  const groundWidth = boardCols * CELL_SIZE + 1
  const groundHeight = boardRows * CELL_SIZE + 1

  const tableclothMap = useMemo(() => {
    const tex = createTableclothTexture()
    // Повторяем паттерн так, чтобы клетки совпадали с сеткой
    tex.repeat.set(boardCols / 2, boardRows / 2)
    return tex
  }, [boardRows, boardCols])

  return (
    <group>
      {/* Скатерть-подложка под сеткой */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[groundWidth, groundHeight]} />
        <meshStandardMaterial
          map={tableclothMap}
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {cells.map(({ row, col }) => (
        <GridCell3D key={`${row}-${col}`} row={row} col={col} />
      ))}
      {items.map((item) => (
        <GameItem3D key={item.instanceId} item={item} />
      ))}

      {/* Невидимая плоскость для отслеживания drag & drop */}
      {dragItemId && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.5, 0]}
          onPointerMove={(e) => {
            e.stopPropagation()
            updateDrag([e.point.x, 0, e.point.z])
          }}
          onPointerUp={(e) => {
            e.stopPropagation()
            endDrag()
          }}
        >
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
