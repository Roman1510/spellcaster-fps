import { useMemo, useRef, useEffect, useState } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const colors = [
  '#00ff00',
  '#ffff00',
  '#ff8800',
  '#ff0000',
  '#8800ff',
  '#0088ff',
  '#00ffff',
]

type BrickInstance = {
  key: number
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  wallIndex: number
}

type Particle = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  target: THREE.Vector3
  color: string
  originalIndex: number
  wallIndex: number
}

type WallPosition = {
  x: number
  y: number
  z: number
}

interface TowerProps {
  wallPositions?: WallPosition[]
}

export const Tower = ({
  wallPositions = [{ x: 0, y: 0, z: 0 }],
}: TowerProps) => {
  const [isParticleMode, setIsParticleMode] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const particleMeshRefs = useRef<Record<string, THREE.InstancedMesh>>({})

  const numRows = 6
  const numColumns = 4
  const numDepth = 2
  const boxSize = 2
  const bricksPerTower = numRows * numColumns * numDepth

  const { instances, materials } = useMemo(() => {
    const brickInstances: BrickInstance[] = []
    const materialMap: Record<string, THREE.MeshBasicMaterial> = {}

    colors.forEach((color) => {
      materialMap[color] = new THREE.MeshBasicMaterial({ color })
    })

    let instanceId = 0

    wallPositions.forEach((wallPos, wallIndex) => {
      for (let i = 0; i < bricksPerTower; i++) {
        const depth = Math.floor(i / (numRows * numColumns))
        const row = Math.floor((i % (numRows * numColumns)) / numColumns)
        const col = i % numColumns

        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        brickInstances.push({
          key: instanceId++,
          position: [
            wallPos.x +
              (col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2),
            wallPos.y + (row * boxSize + boxSize / 2),
            wallPos.z +
              (depth * boxSize - (numDepth * boxSize) / 2 + boxSize / 2),
          ],
          rotation: [0, 0, 0],
          color: randomColor,
          wallIndex,
        })
      }
    })

    return { instances: brickInstances, materials: materialMap }
  }, [wallPositions, bricksPerTower])

  const groupedByColor = useMemo(() => {
    const groups: Record<string, BrickInstance[]> = {}

    instances.forEach((instance) =>
      (groups[instance.color] ??= []).push(instance)
    )

    return groups
  }, [instances])

  const createParticles = useMemo(() => {
    return () => {
      const particles: Particle[] = []

      instances.forEach((instance, index) => {
        const startPos = new THREE.Vector3(
          instance.position[0] + (Math.random() - 0.5) * 30,
          instance.position[1] + Math.random() * 15 + 10,
          instance.position[2] + (Math.random() - 0.5) * 30
        )

        particles.push({
          position: startPos,
          velocity: new THREE.Vector3(),
          target: new THREE.Vector3(...instance.position),
          color: instance.color,
          originalIndex: index,
          wallIndex: instance.wallIndex,
        })
      })

      particlesRef.current = particles
    }
  }, [instances])

  const particlesByColor = useMemo(() => {
    if (!isParticleMode) return {}

    const groups: Record<string, Particle[]> = {}
    particlesRef.current.forEach((particle) =>
      (groups[particle.color] ??= []).push(particle)
    )
    return groups
  }, [isParticleMode])

  useFrame((_, delta) => {
    if (!isParticleMode) return

    let allReached = true
    const particles = particlesRef.current

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]
      const distance = particle.position.distanceTo(particle.target)

      if (distance > 0.2) {
        allReached = false

        const direction = particle.target
          .clone()
          .sub(particle.position)
          .normalize()
        particle.velocity.add(direction.multiplyScalar(20 * delta))
        particle.velocity.multiplyScalar(0.95)
        particle.position.add(particle.velocity.clone().multiplyScalar(delta))
      } else {
        particle.position.copy(particle.target)
        particle.velocity.set(0, 0, 0)
      }
    }

    const matrix = new THREE.Matrix4()
    Object.entries(particlesByColor).forEach(([color, colorParticles]) => {
      const meshRef = particleMeshRefs.current[color]
      if (!meshRef) return

      colorParticles.forEach((particle, index) => {
        matrix.setPosition(particle.position)
        meshRef.setMatrixAt(index, matrix)
      })
      meshRef.instanceMatrix.needsUpdate = true
    })

    if (allReached && isRebuilding) {
      setTimeout(() => {
        setIsParticleMode(false)
        setIsRebuilding(false)
      }, 500)
    }
  })

  useEffect(() => {}, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f' && !isRebuilding) {
        setIsRebuilding(true)
        createParticles()
        setIsParticleMode(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRebuilding, createParticles])

  const geometry = useMemo(
    () => new THREE.BoxGeometry(boxSize, boxSize, boxSize),
    [boxSize]
  )

  return (
    <>
      {isParticleMode &&
        Object.entries(particlesByColor).map(([color, colorParticles]) => (
          <instancedMesh
            key={`particle-${color}`}
            ref={(ref) => {
              if (ref) particleMeshRefs.current[color] = ref
            }}
            args={[geometry, materials[color], colorParticles.length]}
          />
        ))}

      {!isParticleMode &&
        Object.entries(groupedByColor).map(([color, colorInstances]) => (
          <InstancedRigidBodies
            key={color}
            instances={colorInstances}
            mass={0.7}
            gravityScale={0.8}
            colliders="cuboid"
            friction={0.7}
            restitution={0.01}
            canSleep={true}
            linearDamping={2.0}
            angularDamping={1.0}
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

export default Tower
