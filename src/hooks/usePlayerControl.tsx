import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useEffect, RefObject } from 'react'
import { Vector3, Mesh, Group } from 'three'
import { RapierRigidBody } from '@react-three/rapier'

const direction = new Vector3()
const frontVector = new Vector3()
const sideVector = new Vector3()
const targetOffset = new Vector3()
const playerPosition = new Vector3()

const BASE_SPEED_MULTIPLIER = 5
const DASH_SPEED_MULTIPLIER = 25
const JUMP_VELOCITY = 25
const EYE_LEVEL_OFFSET = 2

export const usePlayerControl = (
  ref: RefObject<RapierRigidBody | null>,
  targetRef: RefObject<Mesh | null>,
  armsRef: RefObject<Group | null>
) => {
  const [, get] = useKeyboardControls()

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        console.log('Left mouse button clicked')
      } else if (event.button === 2) {
        console.log('Right mouse button clicked')
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  useFrame((state) => {
    if (ref.current) {
      const { forward, backward, left, right, dash, jump } = get()

      const velocity = ref.current.linvel()
      const { x, y, z } = ref.current.translation()

      const eyeLevelPosition = new Vector3(x, y + EYE_LEVEL_OFFSET, z)
      state.camera.position.copy(eyeLevelPosition)

      frontVector.set(0, 0, +backward - +forward)
      sideVector.set(+left - +right, 0, 0)
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(dash ? DASH_SPEED_MULTIPLIER : BASE_SPEED_MULTIPLIER)
        .applyQuaternion(state.camera.quaternion)

      const isGrounded = y <= 2
      const yVelocity = jump && isGrounded ? JUMP_VELOCITY : velocity.y

      ref.current.setLinvel(
        { x: direction.x, y: yVelocity, z: direction.z },
        true
      )

      if (targetRef.current) {
        targetOffset.set(0, 0, -0.01).applyQuaternion(state.camera.quaternion)
        targetRef.current.position.copy(state.camera.position).add(targetOffset)
        targetRef.current.updateMatrixWorld(true)
      }

      if (armsRef.current) {
        const cameraDirection = new Vector3()
        state.camera.getWorldDirection(cameraDirection)

        const armsPosition = new Vector3()
          .copy(state.camera.position)
          .add(cameraDirection.multiplyScalar(0.12))
          .add(new Vector3(0, 0, 0))

        armsRef.current.position.copy(armsPosition)
        armsRef.current.quaternion.copy(state.camera.quaternion)

        armsRef.current.updateMatrixWorld(true)
      }

      playerPosition.set(x, y, z)
    }
  })
}
