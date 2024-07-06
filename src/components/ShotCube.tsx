import { Cloud, Clouds } from '@react-three/drei'
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
import { MeshLambertMaterial, Vector3 } from 'three'

type CubeMesh = ReactElement

export default function ShotCube() {
  const { camera } = useThree()
  const [cubeMeshes, setCubeMeshes] = useState<CubeMesh[]>([])
  const cubeRefs = useRef<RapierRigidBody[]>([])

  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => new Vector3(1, -0.4, 0), [])
  const clickToCreateBox = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)
      const projectileStartPosition = position
        .clone()
        .add(offset.clone().applyQuaternion(camera.quaternion))

      const newMesh = (
        <RigidBody
          key={cubeMeshes.length}
          mass={50}
          ref={(ref) => {
            if (ref && !cubeRefs.current.includes(ref)) {
              cubeRefs.current.push(ref)
            }
          }}
        >
          <group>
            {/* <mesh
              position={[
                projectileStartPosition.x,
                projectileStartPosition.y,
                projectileStartPosition.z,
              ]}
            >
              <sphereGeometry args={[0.7, 32]} />
              <meshBasicMaterial color={'white'} transparent opacity={0.1} />
            </mesh> */}
            <Clouds limit={5} material={MeshLambertMaterial}>
              <Cloud
                position={[
                  projectileStartPosition.x,
                  projectileStartPosition.y,
                  projectileStartPosition.z,
                ]}
                seed={2}
                concentrate="random"
                growth={10}
                color="#ffccdd"
                bounds={[0.2, 0.2, 0.2]}
              />
            </Clouds>

            <mesh
              position={[
                projectileStartPosition.x,
                projectileStartPosition.y,
                projectileStartPosition.z,
              ]}
            >
              <sphereGeometry args={[0.6, 32]} />
              <meshBasicMaterial transparent opacity={0.03} color={'white'} />
            </mesh>
          </group>
        </RigidBody>
      )

      setCubeMeshes((prevMeshes) => [...prevMeshes, newMesh])
    }
  }, [camera, position, direction, cubeMeshes.length, offset])

  useEffect(() => {
    cubeRefs.current.forEach((ref) => {
      if (ref) {
        ref.setLinvel(
          new Vector3(direction.x * 165, direction.y * 165, direction.z * 165),
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
