import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { RepeatWrapping, TextureLoader } from 'three'
import { EXRLoader } from 'three/examples/jsm/Addons.js'
import { Castle } from './Castle'

export const Ground = () => {
  const texture = useLoader(TextureLoader, '/floor_diff.jpg')
  const roughnessMap = useLoader(TextureLoader, '/floor_rough.jpg')

  const normalMap = useLoader(EXRLoader, '/floor_norm.exr')

  const repeatCount = 128

  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatCount, repeatCount)

  roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping
  roughnessMap.repeat.set(repeatCount, repeatCount)

  normalMap.wrapS = normalMap.wrapT = RepeatWrapping
  normalMap.repeat.set(repeatCount, repeatCount)

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <Castle scale={30} position={[0, -37, 0]} />
      </RigidBody>
    </group>
  )
}
