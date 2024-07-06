import { useLoader } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { RepeatWrapping, TextureLoader } from 'three'
import { EXRLoader } from 'three/examples/jsm/Addons.js'

export const Ground = () => {
  const texture = useLoader(TextureLoader, '/floor_diff.jpg')
  const roughnessMap = useLoader(TextureLoader, '/floor_rough.jpg')
  const displacementMap = useLoader(TextureLoader, '/floor_disp.png')
  const normalMap = useLoader(EXRLoader, '/floor_norm.exr')

  const repeatCount = 128

  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatCount, repeatCount)

  roughnessMap.wrapS = roughnessMap.wrapT = RepeatWrapping
  roughnessMap.repeat.set(repeatCount, repeatCount)

  displacementMap.wrapS = displacementMap.wrapT = RepeatWrapping
  displacementMap.repeat.set(repeatCount, repeatCount)

  normalMap.wrapS = normalMap.wrapT = RepeatWrapping
  normalMap.repeat.set(repeatCount, repeatCount)

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider position={[0, -0.1, 0]} args={[100, 0.1, 100]}>
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
        >
          <planeGeometry args={[200, 200]} />
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
