import { RigidBody } from '@react-three/rapier'

import { Castle } from './Castle'

export const Ground = () => {
  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <Castle scale={30} position={[0, -37, 0]} />
      </RigidBody>
    </group>
  )
}
