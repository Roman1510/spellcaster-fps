import { useRef, useMemo, useState, useEffect } from 'react'
import { InstancedRigidBodies, InstancedRigidBodyProps, RapierRigidBody } from '@react-three/rapier'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

type InstanceData = {
  key: number
  position: [number, number, number]
  rotation: [number, number, number]
}

type MaterialKey = 'yellow' | 'black' | 'cyan' | 'brownLight' | 'brownDark' | 'backBrownLight' | 'backBrownDark' | 'roof' | 'structure'

type BrickGroups = Record<MaterialKey, InstanceData[]>

export const BrickWall = () => {
  const instancedMeshRefs = useRef<Record<MaterialKey, THREE.InstancedMesh | null>>({
    yellow: null,
    black: null,
    cyan: null,
    brownLight: null,
    brownDark: null,
    backBrownLight: null,
    backBrownDark: null,
    roof: null,
    structure: null
  })

  const rigidBodyRefs = useRef<Record<MaterialKey, RapierRigidBody[] | null>>({
    yellow: null,
    black: null,
    cyan: null,
    brownLight: null,
    brownDark: null,
    backBrownLight: null,
    backBrownDark: null,
    roof: null,
    structure: null
  })

  const { camera } = useThree()
  const frameCount = useRef(0)
  const materialRefs = useRef<Record<MaterialKey, THREE.MeshStandardMaterial>>()
  const geometryRef = useRef<THREE.BoxGeometry>()

  // Constants
  const boxSize = 1
  const numRows = 12
  const numColumns = 14
  const buildingDepth = 8
  const maxRenderDistance = 90

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

  // Create fresh geometry and materials for each component instance
  const { geometry, materials } = useMemo(() => {
    // Create fresh geometry
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geometryRef.current = geo

    // Create fresh materials with proper typing
    const mats: Record<MaterialKey, THREE.MeshStandardMaterial> = {
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

    materialRefs.current = mats
    return { geometry: geo, materials: mats }
  }, [])

  // Cleanup function to properly dispose of resources
  useEffect(() => {
    return () => {
      // Dispose geometry
      if (geometryRef.current) {
        geometryRef.current.dispose()
      }

      // Dispose materials
      if (materialRefs.current) {
        Object.values(materialRefs.current).forEach(material => {
          material.dispose()
        })
      }

      // Clear refs
      instancedMeshRefs.current = {
        yellow: null,
        black: null,
        cyan: null,
        brownLight: null,
        brownDark: null,
        backBrownLight: null,
        backBrownDark: null,
        roof: null,
        structure: null
      }
    }
  }, [])

  // Generate brick data
  const brickGroups = useMemo(() => {
    const groups: BrickGroups = {
      yellow: [], black: [], cyan: [], brownLight: [], brownDark: [],
      backBrownLight: [], backBrownDark: [], roof: [], structure: []
    }

    let instanceId = 0

    const getMaterialKey = (wallType: string, row: number, col: number): MaterialKey => {
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
  }, [numRows, numColumns, buildingDepth, boxSize])

  const [isVisible, setIsVisible] = useState(true)

  // Frame-based distance checking
  useFrame(() => {
    frameCount.current++
    if (frameCount.current % 60 === 0) {
      const cameraPos = camera.position
      const buildingCenter = new THREE.Vector3(0, numRows * boxSize / 2, -20 - buildingDepth * boxSize / 2)
      const distance = cameraPos.distanceTo(buildingCenter)
      setIsVisible(distance <= maxRenderDistance)
    }
  })

  // Optimized physics properties with proper typing
  const physicsProps = useMemo((): Partial<InstancedRigidBodyProps> => ({
    mass: 1.5,
    gravityScale: 0.75,
    colliders: "cuboid",
    friction: 0.8,
    restitution: 0.2,
    linearDamping: 0.1,
    angularDamping: 0.2,
    canSleep: true,
    ccd: false, // Continuous collision detection
    enabledRotations: [true, true, true],
    enabledTranslations: [true, true, true]
  }), [])

  if (!isVisible) {
    return null
  }

  return (
    <>
      {(Object.entries(brickGroups) as [MaterialKey, InstanceData[]][]).map(([materialKey, instances]) => {
        if (instances.length === 0) return null

        return (
          <InstancedRigidBodies
            key={`${materialKey}-${instances.length}`}
            instances={instances}
            {...physicsProps}
            ref={(bodies) => {
              if (bodies) {
                rigidBodyRefs.current[materialKey] = bodies as RapierRigidBody[]
              }
            }}
          >
            <instancedMesh
              ref={(mesh) => {
                if (mesh) {
                  instancedMeshRefs.current[materialKey] = mesh
                }
              }}
              args={[geometry, materials[materialKey], instances.length]}
              castShadow={materialKey === 'yellow' || materialKey === 'black'}
              receiveShadow={false}
              frustumCulled={true}
            />
          </InstancedRigidBodies>
        )
      })}
    </>
  )
}

// Simplified LOD component
export const OptimizedBrickWall = () => {
  const { camera } = useThree()
  const [lodLevel, setLodLevel] = useState<'detailed' | 'simple'>('detailed')
  const frameCount = useRef(0)

  useFrame(() => {
    frameCount.current++
    if (frameCount.current % 120 === 0) {
      const distance = camera.position.length()
      setLodLevel(distance < 80 ? 'detailed' : 'simple')
    }
  })

  return lodLevel === 'detailed' ? <BrickWall /> : <SimpleBrickWall />
}

// Simplified version for distant viewing
const SimpleBrickWall = () => {
  const geometry = useMemo(() => new THREE.BoxGeometry(14, 12, 8), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFD700' }), [])

  // Cleanup for simple wall too
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return (
    <mesh geometry={geometry} material={material} position={[0, 6, -24]} />
  )
}