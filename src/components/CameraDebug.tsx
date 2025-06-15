import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useRef } from 'react'
import * as THREE from 'three'

export const CameraDebug = () => {
  const lineRef = useRef<THREE.BufferGeometry>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const { showDebug, laserLength } = useControls('Camera Debug', {
    showDebug: false,
    laserLength: { value: 50, min: 1, max: 100 },
  })

  useFrame((state) => {
    if (!showDebug || !lineRef.current || !meshRef.current) return

    const camera = state.camera

    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)

    const start = camera.position.clone().add(new THREE.Vector3(0.2, -0.1, 0)) // offset right and down
    const end = start.clone().add(direction.multiplyScalar(laserLength))

    const points = [start, end]
    lineRef.current.setFromPoints(points)

    meshRef.current.position.copy(camera.position)
  })

  if (!showDebug) return null

  return (
    <group>
      {/* Camera direction laser */}
      <line>
        <bufferGeometry ref={lineRef} />
        <lineBasicMaterial color="red" linewidth={3} />
      </line>

      {/* Camera position indicator */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="yellow" />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.05, 0.05, laserLength]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  )
}

export default CameraDebug
