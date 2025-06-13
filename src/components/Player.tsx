import { useRef } from 'react'
import { BallCollider, RapierRigidBody, RigidBody } from '@react-three/rapier'
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
        mass={100}
        type="dynamic"
        position={[0, 1, 35]}
      >
        <BallCollider args={[1]} />
      </RigidBody>
      <group ref={armsRef}>
        <Arms />
      </group>
      <mesh ref={targetRef} visible={true}>
        <sphereGeometry args={[0.002, 8]} />
      </mesh>
    </>
  )
}
