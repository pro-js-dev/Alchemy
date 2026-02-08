import { Environment } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { Board3D } from './Board3D'

export function GameScene() {
  return (
    <>
      {/* Заполняющий свет — низкий, чтобы тени были контрастными */}
      <ambientLight intensity={0.35} />

      {/* Ключевой свет — смещён вбок для видимых теней при виде сверху */}
      <directionalLight
        position={[-8, 12, -6]}
        intensity={2.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Заполняющий свет — слабый, холодный */}
      <directionalLight position={[6, 8, 4]} intensity={0.3} color="#e6f0ff" />
      {/* Контровой свет — сзади */}
      <directionalLight position={[-4, 6, 8]} intensity={0.2} color="#ffffff" />
      {/* Hemisphere — приглушённый */}
      <hemisphereLight args={['#fff5e6', '#d4a68a', 0.35]} />

      {/* HDRI для отражений */}
      <Environment preset="city" environmentIntensity={0.3} />

      <Board3D />

      {/* Пост-обработка */}
      <EffectComposer multisampling={0}>
        <Vignette offset={0.3} darkness={0.65} />
      </EffectComposer>
    </>
  )
}
