import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { Vector3, Mesh, Group } from 'three'
import { Arms } from './Arms'

const direction = new Vector3()
const frontVector = new Vector3()
const sideVector = new Vector3()
const targetOffset = new Vector3()
const playerPosition = new Vector3()

const BASE_SPEED_MULTIPLIER = 5
const DASH_SPEED_MULTIPLIER = 20

export function Player() {
  const ref = useRef<RapierRigidBody>(null)
  const targetRef = useRef<Mesh>(null)
  const armsRef = useRef<Group>(null)
  const [, get] = useKeyboardControls()

  useFrame((state) => {
    if (ref.current) {
      const { forward, backward, left, right, dash } = get()

      const velocity = ref.current.linvel()

      const { x, y, z } = ref.current.translation()

      state.camera.position.set(x, y, z)
      frontVector.set(0, 0, +backward - +forward)
      sideVector.set(+left - +right, 0, 0)
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(dash ? DASH_SPEED_MULTIPLIER : BASE_SPEED_MULTIPLIER)
        .applyQuaternion(state.camera.quaternion)
      ref.current.setLinvel(
        { x: direction.x, y: velocity.y, z: direction.z },
        true
      )

      if (targetRef.current) {
        targetOffset.set(0, 0, -1).applyQuaternion(state.camera.quaternion)
        targetRef.current.position.copy(state.camera.position).add(targetOffset)
      }

      if (armsRef.current) {
        const cameraDirection = new Vector3()
        state.camera.getWorldDirection(cameraDirection)
        cameraDirection.multiplyScalar(0.1)
        const armsPosition = new Vector3()
          .copy(state.camera.position)
          .add(cameraDirection)

        armsRef.current.position.copy(armsPosition)
        armsRef.current.quaternion.copy(state.camera.quaternion)
      }

      playerPosition.set(x, y, z)
    }
  })

  return (
    <>
      <RigidBody
        ref={ref}
        colliders={'ball'}
        mass={100}
        type="dynamic"
        position={[0, 2, 0]}
      ></RigidBody>

      <group ref={armsRef}>
        <Arms />
      </group>

      <mesh ref={targetRef} visible={true}>
        <sphereGeometry args={[0.002, 8]} />
      </mesh>
    </>
  )
}
