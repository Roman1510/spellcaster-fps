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

export default function ShotCube() {
  const { camera } = useThree()
  const [cubeMeshes, setCubeMeshes] = useState<CubeMesh[]>([])
  const cubeRefs = useRef<RapierRigidBody[]>([])

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])

  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      const newMesh = (
        <RigidBody
          key={cubeMeshes.length}
          mass={15}
          ref={(ref) => {
            if (ref && !cubeRefs.current.includes(ref)) {
              cubeRefs.current.push(ref)
            }
          }}
        >
          <mesh
            position={[
              position.x + direction.x,
              position.y + direction.y - 0.5,
              position.z + direction.z,
            ]}
          >
            <sphereGeometry args={[0.1, 8]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>
      )

      setCubeMeshes((prevMeshes) => [...prevMeshes, newMesh])
    }
  }, [camera, position, direction, cubeMeshes.length])

  useEffect(() => {
    cubeRefs.current.forEach((ref) => {
      if (ref) {
        ref.setLinvel(
          new Vector3(direction.x * 50, direction.y * 50 + 1, direction.z * 50),
          true
        )
      }
    })
  }, [cubeMeshes, direction])

  useEffect(() => {
    const handleClick = () => clickToCreateBox()
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [clickToCreateBox])

  return <>{cubeMeshes}</>
}
