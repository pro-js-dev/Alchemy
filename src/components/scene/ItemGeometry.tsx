import type { GeometryType } from '../../game/types'

interface ItemGeometryProps {
  geometryType: GeometryType
  args?: number[]
}

export function ItemGeometry({ geometryType, args }: ItemGeometryProps) {
  switch (geometryType) {
    case 'Box':
      return <boxGeometry args={args as [number?, number?, number?]} />
    case 'Sphere':
      return <sphereGeometry args={(args as [number?, number?, number?]) ?? [0.5, 32, 32]} />
    case 'Cylinder':
      return <cylinderGeometry args={args as [number?, number?, number?, number?]} />
    case 'Cone':
      return <coneGeometry args={(args as [number?, number?, number?]) ?? [0.4, 0.8, 16]} />
    case 'Torus':
      return <torusGeometry args={(args as [number?, number?, number?, number?]) ?? [0.3, 0.15, 16, 48]} />
    case 'Dodecahedron':
      return <dodecahedronGeometry args={(args as [number?, number?]) ?? [0.5]} />
    case 'Octahedron':
      return <octahedronGeometry args={(args as [number?, number?]) ?? [0.5]} />
    case 'Icosahedron':
      return <icosahedronGeometry args={(args as [number?, number?]) ?? [0.5]} />
    default:
      return <boxGeometry />
  }
}
