import { useMemo } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import * as THREE from 'three'

const colors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FECA57',
  '#FF9FF3',
  '#54A0FF',
]

type BrickInstance = {
  key: number
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
}

export const BrickWall = () => {
  const numRows = 12
  const numColumns = 14
  const boxSize = 1

  const { instances, materials } = useMemo(() => {
    const brickInstances: BrickInstance[] = []
    const materialMap: Record<string, THREE.MeshStandardMaterial> = {}

    colors.forEach((color) => {
      materialMap[color] = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
      })
    })

    let instanceId = 0

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        brickInstances.push({
          key: instanceId++,
          position: [
            col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2,
            row * boxSize + boxSize / 2,
            -20,
          ],
          rotation: [0, 0, 0],
          color: randomColor,
        })
      }
    }

    return { instances: brickInstances, materials: materialMap }
  }, [numRows, numColumns, boxSize])

  const groupedByColor = useMemo(() => {
    const groups: Record<string, BrickInstance[]> = {}

    instances.forEach((instance) => {
      if (!groups[instance.color]) {
        groups[instance.color] = []
      }
      groups[instance.color].push(instance)
    })

    return groups
  }, [instances])

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  return (
    <>
      {Object.entries(groupedByColor).map(([color, colorInstances]) => (
        <InstancedRigidBodies
          key={color}
          instances={colorInstances}
          mass={0.03}
          gravityScale={0.8}
          colliders="cuboid"
          friction={0.8}
          restitution={0.1}
        >
          <instancedMesh
            frustumCulled={false}
            args={[geometry, materials[color], colorInstances.length]}
          />
        </InstancedRigidBodies>
      ))}
    </>
  )
}

export default BrickWall
