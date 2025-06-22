import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { BrickWall } from './BrickWall'

import { ProjectileSystem } from './Projectile'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense } from 'react'
import { useGame } from '../hooks/useGame'

export const Stage = () => {
  const { pause } = useGame()

  return (
    <>
      <ambientLight intensity={5} color="#621666" />
      <Environment files={['purple.jpg']} path="/" background />
      <Physics gravity={[0, -10, 0]} paused={pause}>
        <Suspense>
          <Player />
          <Ground />
        </Suspense>
        <group
          scale={1.5}
          rotation={[0, Math.PI / 2, 0]}
          position={[35, 3, -5]}
        >
          <Suspense>
            <BrickWall />
          </Suspense>
        </group>
        <ProjectileSystem />
      </Physics>
      <EffectComposer>
        <Bloom
          intensity={1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  )
}

export default Stage
