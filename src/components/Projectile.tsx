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

interface ProjectileData {
  mesh: CubeMesh
  direction: Vector3
}

export const Projectile = () => {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const cubeRefs = useRef<RapierRigidBody[]>([])

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(0.5, -0.1, -1.5), [])

  const addRandomness = (vec: Vector3, magnitude: number) => {
    vec.x += (Math.random() - 0.5) * magnitude
    vec.y += (Math.random() - 0.5) * magnitude
    vec.z += (Math.random() - 0.5) * magnitude
  }

  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      addRandomness(direction, 0.05)
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

      setProjectiles((prevMeshes) => [
        ...prevMeshes,
        { mesh: newMesh, direction: direction.clone() },
      ])
    }
  }, [camera, position, direction, projectiles.length, offset])

  useEffect(() => {
    projectiles.forEach((projectile, index) => {
      const ref = cubeRefs.current[index]
      if (ref) {
        const dir = projectile.direction
        ref.setLinvel(new Vector3(dir.x * 165, dir.y * 165, dir.z * 165), true)
      }
    })
  }, [projectiles])

  useEffect(() => {
    const handleClick = () => clickToCreateBox()
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [clickToCreateBox])

  return <>{projectiles.map((proj) => proj.mesh)}</>
}
