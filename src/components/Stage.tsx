import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import Tower from './Tower'

import { ProjectileSystem } from './Projectile'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useMemo } from 'react'
import { usePause } from '../store/GameStore'
// import { PositionDebugLine } from './PositionDebugLine'

export const Stage = () => {
  const pause = usePause()

  const towerPositions = useMemo(
    () => [
      { x: -108, y: 40, z: -125 },
      { x: -150, y: 0, z: 30 },
      { x: 120, y: 0, z: -100 },
      { x: -20, y: 0, z: -110 },
      { x: -200, y: 0, z: -70 },
      { x: 30, y: 0, z: -60 },
    ],
    []
  )

  return (
    <>
      <ambientLight intensity={5} color="#621666" />
      <Environment files={['purple.jpg']} path="/" background />
      <Physics gravity={[0, -10, 0]} paused={pause}>
        <Suspense>
          <Player />
          <Ground />
          <Tower wallPositions={towerPositions} />
        </Suspense>
        {/* <PositionDebugLine name="Wall Position Debug" /> */}

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
