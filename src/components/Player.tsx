import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier'
import { Vector3, Mesh } from 'three'

const direction = new Vector3()
const frontVector = new Vector3()
const sideVector = new Vector3()
const targetOffset = new Vector3()
const playerPosition = new Vector3()

const MAX_VERTICAL_ANGLE = Math.PI / 7.5
const BASE_SPEED_MULTIPLIER = 200
const DASH_SPEED_MULTIPLIER = 400

export function Player() {
  const ref = useRef<RapierRigidBody>(null)

  const targetRef = useRef<Mesh>(null)
  const [, get] = useKeyboardControls()

  useFrame((state) => {
    if (ref.current) {
      const { forward, backward, left, right, dash } = get()
      const velocity = ref.current.linvel()

      state.camera.rotation.order = 'YXZ'
      const cameraRotation = state.camera.rotation.x
      if (cameraRotation > MAX_VERTICAL_ANGLE) {
        state.camera.rotation.x = MAX_VERTICAL_ANGLE
      } else if (cameraRotation < -MAX_VERTICAL_ANGLE) {
        state.camera.rotation.x = -MAX_VERTICAL_ANGLE
      }

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
        targetOffset.set(0, 0, -70).applyQuaternion(state.camera.quaternion)
        targetRef.current.position.copy(state.camera.position).add(targetOffset)
      }

      playerPosition.set(x, y, z)
    }
  })

  return (
    <>
      <RigidBody
        ref={ref}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 20, 0]}
        enabledRotations={[false, true, false]}
      >
        <CapsuleCollider args={[0.75, 1]} />
      </RigidBody>

      <mesh ref={targetRef} position={[0, 0, -6]} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </>
  )
}
