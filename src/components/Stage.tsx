import { Physics } from '@react-three/rapier'
import { Ground } from './Ground'
import { Player } from './Player'
import { BrickWall } from './BrickWall'

import { ProjectileSystem } from './Projectile'
import { Environment } from '@react-three/drei'

export const Stage = () => {
  return (
    <>
      <ambientLight intensity={3} color="#621666" />
      <Environment preset="night" />
      <Physics gravity={[0, -10, 0]}>
        <Player />
        <Ground />
        <group scale={1.5}>
          <BrickWall />
        </group>

        <ProjectileSystem />
      </Physics>
    </>
  )
}

export default Stage
