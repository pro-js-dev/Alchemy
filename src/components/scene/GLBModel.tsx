import { useGLTF } from '@react-three/drei'
import { useMemo, useEffect, useRef } from 'react'
import { Box3, Vector3 } from 'three'
import type { Mesh } from 'three'

interface GLBModelProps {
  path: string
  /** Normalize model to fit in a 1×1×1 cube (default: false) */
  normalize?: boolean
  /** Called once when the model has finished loading and is rendered */
  onLoad?: () => void
}

export function GLBModel({ path, normalize = false, onLoad }: GLBModelProps) {
  const { scene } = useGLTF(path)

  // Fire onLoad once after mount (model is guaranteed loaded at this point)
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad
  useEffect(() => {
    onLoadRef.current?.()
  }, [])
  const { cloned, normScale, offset } = useMemo(() => {
    const c = scene.clone()
    c.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (!normalize) return { cloned: c, normScale: 1, offset: new Vector3() }

    const box = new Box3().setFromObject(c)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const ns = maxDim > 0 ? 1 / maxDim : 1

    return { cloned: c, normScale: ns, offset: center.multiplyScalar(-ns) }
  }, [scene, normalize])

  if (normalize) {
    return (
      <group scale={normScale}>
        <group position={[offset.x / normScale, offset.y / normScale, offset.z / normScale]}>
          <primitive object={cloned} />
        </group>
      </group>
    )
  }

  return <primitive object={cloned} />
}
