import { useRef, useEffect, useCallback } from 'react'
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier'
import { Mesh, Group } from 'three'
import { Arms } from './Arms'
import { usePlayerControl } from '../hooks/usePlayerControl'

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void
}

export function Player() {
  const ref = useRef<RapierRigidBody>(null)
  const targetRef = useRef<Mesh>(null)
  const armsRef = useRef<Group>(null)
  const armsControlRef = useRef<ArmsRef>(null)
  const isMouseDown = useRef(false)

  usePlayerControl(ref, targetRef, armsRef)

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button === 0 && !isMouseDown.current && armsControlRef.current) {
      isMouseDown.current = true
      armsControlRef.current.switchAnimation(true)
    }
  }, [])

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (event.button === 0 && isMouseDown.current && armsControlRef.current) {
      isMouseDown.current = false
      armsControlRef.current.switchAnimation(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseDown, handleMouseUp])

  return (
    <>
      <RigidBody
        gravityScale={2}
        ref={ref}
        colliders={false}
        mass={150}
        type="dynamic"
        position={[-300, 2, -45]}
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[1.4, 0.5]} />
      </RigidBody>

      <group ref={armsRef}>
        <Arms ref={armsControlRef} />
      </group>

      <mesh ref={targetRef} visible={false}>
        <sphereGeometry args={[0.001, 1]} />
      </mesh>
    </>
  )
}
