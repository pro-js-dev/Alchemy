import { useState, useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import type { Group } from 'three'
import type { Generator } from '../../game/types'
import { gridToWorld } from '../../game/gridUtils'
import { useGameStore } from '../../store/useGameStore'
import { GLBModel } from './GLBModel'

interface Generator3DProps {
  generator: Generator
}

export function Generator3D({ generator }: Generator3DProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<Group>(null)
  const boardRows = useGameStore((s) => s.boardRows)
  const boardCols = useGameStore((s) => s.boardCols)
  const spawnItem = useGameStore((s) => s.spawnItem)
  const selectItem = useGameStore((s) => s.selectItem)

  const worldPos = gridToWorld(generator.position, boardRows, boardCols)

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    selectItem(null)
    spawnItem(generator.instanceId)
  }

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.3
  })

  const s = hovered ? 1.15 : 1

  return (
    <group position={[worldPos[0], 0.05, worldPos[2]]}>
      <Float speed={1.5} floatIntensity={0.15}>
        <group
          ref={groupRef}
          scale={[s, s, s]}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.5, 0.5]} />
              <meshStandardMaterial color="#FFD700" wireframe />
            </mesh>
          }>
            <group scale={1.2}>
              <GLBModel path="/models/cake_birthday.glb" />
            </group>
          </Suspense>

          {/* Золотое свечение вокруг сундука */}
          <pointLight
            color="#FFD700"
            intensity={hovered ? 3 : 1}
            distance={2.5}
            position={[0, 0.5, 0]}
          />
        </group>
      </Float>
    </group>
  )
}
