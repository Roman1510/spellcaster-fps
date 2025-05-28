import React, { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { BrickWall } from './BrickWall'
import { DirectionalLight, DirectionalLightHelper } from 'three'
import { useHelper } from '@react-three/drei'

import { ProjectileSystem } from './Projectile'

export const Stage = () => {
  const lightRef = useRef<DirectionalLight>(null!)

  useHelper(
    lightRef as React.MutableRefObject<DirectionalLight>,
    DirectionalLightHelper,
    5,
    'yellow'
  )

  return (
    <>
      <directionalLight
        intensity={5}
        ref={lightRef}
        position={[150, 100, 100]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={50}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-radius={15}
      />
      <Physics gravity={[0, -10, 0]} timeStep="vary">
        <Player />
        <Ground />
        <BrickWall />
        <ProjectileSystem />
      </Physics>
    </>
  )
}

export default Stage
