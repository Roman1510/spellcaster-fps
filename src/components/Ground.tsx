import { useLoader } from '@react-three/fiber'
import { CylinderCollider, RigidBody } from '@react-three/rapier'
import { RepeatWrapping, TextureLoader } from 'three'
import { EXRLoader } from 'three/examples/jsm/Addons.js'

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
    <RigidBody type="fixed" colliders={false} friction={0.7}>
      <CylinderCollider position={[0, -0.1, 0]} args={[0.1, 50]}>
        <mesh
          receiveShadow
          position={[0, 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[150, 64]} />
          <meshPhysicalMaterial
            map={texture}
            roughnessMap={roughnessMap}
            normalMap={normalMap}
          />
        </mesh>
      </CylinderCollider>
    </RigidBody>
  )
}
