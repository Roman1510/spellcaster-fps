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
        mass={50}
        type="dynamic"
        position={[-300, 2, -45]}
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[1.4, 0.5]} />
      </RigidBody>

      <group ref={armsRef}>
        <Arms />
      </group>

      <mesh ref={targetRef} visible={false}>
        <sphereGeometry args={[0.001, 1]} />
      </mesh>
    </>
  )
}
