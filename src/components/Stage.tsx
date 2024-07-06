import React, { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { BrickWall } from './BrickWall'
import { DirectionalLight, DirectionalLightHelper } from 'three'
import { useHelper } from '@react-three/drei'
import ShotCube from './ShotCube'

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
        intensity={1}
        ref={lightRef}
        position={[150, 100, 100]}
        castShadow
      />
      <Physics gravity={[0, -10, 0]} timeStep="vary">
        <Player />
        <Ground />
        <BrickWall />
        <ShotCube />
      </Physics>
    </>
  )
}

export default Stage
