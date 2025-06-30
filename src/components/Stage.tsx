import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import Tower from './Tower'

import { ProjectileSystem } from './Projectile'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { Suspense, useMemo, useEffect } from 'react'
import { usePause } from '../store/GameStore'
import { useInitializeTowers } from '../store/TowerStore'
// import { PositionDebugLine } from './PositionDebugLine'

export const Stage = () => {
  const pause = usePause()
  const initializeTowers = useInitializeTowers()

  const towerPositions = useMemo(
    () => [
      { x: -108, y: 40, z: -125 },
      { x: -260, y: 40, z: -85 },
      { x: 82, y: 53, z: -52 },
      { x: 4, y: 43, z: -126 },
      { x: -175, y: 40, z: -128 },
      { x: 150, y: 63, z: -35 },
      { x: 189, y: 64, z: 31 },
      { x: 186, y: 89.3, z: -22 },
    ],
    []
  )

  // Initialize towers in the store
  useEffect(() => {
    const bricksPerTower = 7 * 3 * 3 // numRows * numColumns * numDepth
    initializeTowers(towerPositions, bricksPerTower)
  }, [initializeTowers, towerPositions])

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
