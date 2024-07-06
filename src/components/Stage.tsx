import React, { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import Pyramid from './Pyramid'
import { DirectionalLight, DirectionalLightHelper } from 'three'
import { useHelper } from '@react-three/drei'

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
      />
      <Physics gravity={[0, -10, 0]}>
        <Player />
        <Ground />
        <Pyramid />
      </Physics>
    </>
  )
}

export default Stage
