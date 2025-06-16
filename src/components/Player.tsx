import { useRef } from 'react'
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier'
import { Mesh, Group } from 'three'
import { Arms } from './Arms'
import { usePlayerControl } from '../hooks/usePlayerControl'

export function Player() {
  const ref = useRef<RapierRigidBody>(null)
  const targetRef = useRef<Mesh>(null)
  const armsRef = useRef<Group>(null)

  usePlayerControl(ref, targetRef, armsRef)

  return (
    <>
      <RigidBody
        ref={ref}
        colliders={false}
        mass={200}
        type="dynamic"
        position={[0, 2, 35]}
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[0.8, 0.4]} />
      </RigidBody>

      <group ref={armsRef}>
        <Arms />
      </group>

      <mesh ref={targetRef} visible={false}>
        <sphereGeometry args={[0.002, 8]} />
      </mesh>
    </>
  )
}
