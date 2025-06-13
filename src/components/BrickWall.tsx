import { useRef, useMemo, useState, } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'


const sharedGeometry = new THREE.BoxGeometry(1, 1, 1)
const materials: Record<string, THREE.MeshStandardMaterial> = {
  yellow: new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.8 }),
  black: new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.9 }),
  cyan: new THREE.MeshStandardMaterial({ color: '#00CED1', roughness: 0.8 }),
  brownLight: new THREE.MeshStandardMaterial({ color: '#CD853F', roughness: 0.9 }),
  brownDark: new THREE.MeshStandardMaterial({ color: '#D2691E', roughness: 0.9 }),
  backBrownLight: new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.9 }),
  backBrownDark: new THREE.MeshStandardMaterial({ color: '#A0522D', roughness: 0.9 }),
  roof: new THREE.MeshStandardMaterial({ color: '#DC143C', roughness: 0.6 }),
  structure: new THREE.MeshStandardMaterial({ color: '#708090', roughness: 0.9 })
}

export const BrickWall = () => {
  const instancedMeshRefs = useRef<Record<string, THREE.InstancedMesh | null>>({})
  const { camera } = useThree()

  type InstanceData = {
    key: number
    position: [number, number, number]
    rotation: [number, number, number]
  }

  type BrickGroups = Record<string, InstanceData[]>

  const boxSize = 1
  const numRows = 12
  const numColumns = 14
  const buildingDepth = 8
  const maxRenderDistance = 100


  const smileyPattern = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0],
    [0, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]

  const brickGroups = useMemo(() => {
    const groups: BrickGroups = {
      yellow: [], black: [], cyan: [], brownLight: [], brownDark: [],
      backBrownLight: [], backBrownDark: [], roof: [], structure: []
    }

    let instanceId = 0


    const getMaterialKey = (wallType: string, row: number, col: number) => {
      if (wallType === 'front') {
        const patternValue = smileyPattern[numRows - 1 - row]?.[col] || 0
        if (patternValue === 1) return 'yellow'
        if (patternValue === 2) return 'black'
        return 'cyan'
      } else if (wallType === 'side') {
        return (row + col) % 2 === 0 ? 'brownLight' : 'brownDark'
      } else if (wallType === 'back') {
        return row % 2 === 0 ? 'backBrownLight' : 'backBrownDark'
      } else if (wallType === 'roof') {
        return 'roof'
      }
      return 'structure'
    }

    // Front wall
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const position: [number, number, number] = [
          col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2,
          row * boxSize + boxSize / 2,
          -20
        ]
        const materialKey = getMaterialKey('front', row, col)
        groups[materialKey].push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    // Back wall
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const position: [number, number, number] = [
          col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2,
          row * boxSize + boxSize / 2,
          -20 - (buildingDepth - 1) * boxSize
        ]
        const materialKey = getMaterialKey('back', row, col)
        groups[materialKey].push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    // Left side wall
    for (let row = 0; row < numRows; row++) {
      for (let depth = 1; depth < buildingDepth - 1; depth++) {
        const position: [number, number, number] = [
          -(numColumns * boxSize) / 2,
          row * boxSize + boxSize / 2,
          -20 - depth * boxSize
        ]
        const materialKey = getMaterialKey('side', row, depth)
        groups[materialKey].push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    // Right side wall
    for (let row = 0; row < numRows; row++) {
      for (let depth = 1; depth < buildingDepth - 1; depth++) {
        const position: [number, number, number] = [
          (numColumns * boxSize) / 2 - boxSize,
          row * boxSize + boxSize / 2,
          -20 - depth * boxSize
        ]
        const materialKey = getMaterialKey('side', row, depth)
        groups[materialKey].push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    // Roof
    for (let col = 0; col < numColumns; col++) {
      for (let depth = 0; depth < buildingDepth; depth++) {
        const position: [number, number, number] = [
          col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2,
          numRows * boxSize + boxSize / 2,
          -20 - depth * boxSize
        ]
        groups.roof.push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    // Interior structure (sparse)
    for (let row = 2; row < numRows - 2; row += 3) {
      for (let depth = 2; depth < buildingDepth - 2; depth += 2) {
        const position: [number, number, number] = [
          0,
          row * boxSize + boxSize / 2,
          -20 - depth * boxSize
        ]
        groups.structure.push({
          key: instanceId++,
          position,
          rotation: [0, 0, 0]
        })
      }
    }

    return groups
  }, [])

  // Distance-based culling
  const [visibleGroups, setVisibleGroups] = useState<BrickGroups>(brickGroups)

  useFrame(() => {
    // Update visibility based on camera distance (throttled)
    if (Math.random() < 0.1) { // Only check 10% of frames
      const cameraPos = camera.position
      const buildingCenter = new THREE.Vector3(0, numRows * boxSize / 2, -20 - buildingDepth * boxSize / 2)
      const distance = cameraPos.distanceTo(buildingCenter)

      if (distance > maxRenderDistance) {
        setVisibleGroups({
          yellow: [], black: [], cyan: [], brownLight: [], brownDark: [],
          backBrownLight: [], backBrownDark: [], roof: [], structure: []
        }) // Hide all if too far
      } else if (Object.keys(visibleGroups).length === 0) {
        setVisibleGroups(brickGroups) // Show all if close enough
      }
    }
  })

  // Optimized physics properties
  const physicsProps = useMemo(() => ({
    mass: 2,
    gravityScale: 0.8,
    colliders: "cuboid" as const,
    friction: 0.7,
    restitution: 0.3,
    linearDamping: 0.3,
    angularDamping: 0.4,
    canSleep: true,
    sleepSpeedLimit: 0.1,
    sleepTimeUntilSleep: 0.5
  }), [])

  // Render instanced groups
  return (
    <>
      {Object.entries(visibleGroups).map(([materialKey, instances]) => {
        if (instances.length === 0) return null

        return (
          <InstancedRigidBodies
            key={materialKey}
            instances={instances}
            {...physicsProps}
          >
            <instancedMesh
              ref={ref => instancedMeshRefs.current[materialKey] = ref}
              args={[sharedGeometry, materials[materialKey], instances.length]}
              castShadow={materialKey === 'yellow' || materialKey === 'black'} // Only important parts cast shadows
              receiveShadow={false}
            />
          </InstancedRigidBodies>
        )
      })}
    </>
  )
}

// Optional: Add a simple LOD wrapper component
export const OptimizedBrickWall = () => {
  const { camera } = useThree()
  const [showDetailed, setShowDetailed] = useState(true)

  useFrame(() => {
    // Simple LOD: switch to low detail if camera is far
    if (Math.random() < 0.05) { // Check every ~20 frames
      const distance = camera.position.length()
      setShowDetailed(distance < 50)
    }
  })

  return showDetailed ? <BrickWall /> : <SimpleBrickWall />
}

// Simplified version for distant viewing
const SimpleBrickWall = () => {
  const geometry = useMemo(() => new THREE.BoxGeometry(14, 12, 8), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFD700' }), [])

  return (
    <mesh geometry={geometry} material={material} position={[0, 6, -24]} />
  )
}