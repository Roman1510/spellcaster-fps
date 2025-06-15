import React, { useRef } from 'react'
import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { BrickWall } from './BrickWall'
import { DirectionalLight, DirectionalLightHelper } from 'three'
import { useHelper } from '@react-three/drei'
import { ProjectileSystem } from './Projectile'
import CameraDebug from './CameraDebug'

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
        ref={lightRef}
        position={[0, 300, 0]}
        target-position={[-10, 0, -50]}
        intensity={5}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-radius={0}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      <Physics gravity={[0, -10, 0]}>
        <Player />
        <Ground />
        <BrickWall />
        <ProjectileSystem />
        <CameraDebug />
      </Physics>
    </>
  )
}

export default Stage
