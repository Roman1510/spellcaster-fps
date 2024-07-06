import { useLoader } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { RepeatWrapping, TextureLoader } from 'three'
import { EXRLoader } from 'three/examples/jsm/Addons.js'

export const Ground = () => {
  const texture = useLoader(TextureLoader, '/floor_diff.jpg')
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(64, 64)

  const roughnessMap = useLoader(TextureLoader, '/floor_rough.jpg')
  roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping
  roughnessMap.repeat.set(64, 64)

  const displacementMap = useLoader(TextureLoader, '/floor_disp.png')
  displacementMap.wrapS = displacementMap.wrapT = RepeatWrapping
  displacementMap.repeat.set(64, 64)

  const normalMap = useLoader(EXRLoader, '/floor_norm.exr')
  normalMap.wrapS = normalMap.wrapT = RepeatWrapping
  normalMap.repeat.set(64, 64)

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[0, 0, 0]} args={[150, 1, 150]}>
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.5, 0]}
        >
          <planeGeometry args={[300, 300]} />
          <meshPhysicalMaterial
            map={texture}
            roughnessMap={roughnessMap}
            displacementMap={displacementMap}
            normalMap={normalMap}
          />
        </mesh>
      </CuboidCollider>
    </RigidBody>
  )
}
