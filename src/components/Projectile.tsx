import { useThree } from '@react-three/fiber'
import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactElement,
} from 'react'
import { Vector3 } from 'three'

type CubeMesh = ReactElement

export const Projectile = () => {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<CubeMesh[]>([])
  const cubeRefs = useRef<RapierRigidBody[]>([])

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(0.3, 0, -1.5), [])

  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      direction.normalize()

      const projectileStartPosition = position
        .clone()
        .add(offset.clone().applyQuaternion(camera.quaternion))

      const newMesh = (
        <RigidBody
          key={projectiles.length}
          mass={100}
          ref={(ref) => {
            if (ref && !cubeRefs.current.includes(ref)) {
              cubeRefs.current.push(ref)
            }
          }}
          friction={1}
        >
          <mesh
            position={[
              projectileStartPosition.x,
              projectileStartPosition.y,
              projectileStartPosition.z,
            ]}
          >
            <sphereGeometry args={[0.4, 32]} />
            <meshBasicMaterial opacity={0} color={'white'} />
          </mesh>
        </RigidBody>
      )

      setProjectiles((prevMeshes) => [...prevMeshes, newMesh])
    }
  }, [camera, position, direction, projectiles.length, offset])

  useEffect(() => {
    cubeRefs.current.forEach((ref) => {
      if (ref) {
        ref.setLinvel(
          new Vector3(direction.x * 165, direction.y * 165, direction.z * 165),
          true
        )
      }
    })
  }, [projectiles, direction])

  useEffect(() => {
    const handleClick = () => clickToCreateBox()
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [clickToCreateBox])

  return <>{projectiles}</>
}
