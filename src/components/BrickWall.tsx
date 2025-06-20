import { useMemo, useRef, useEffect, useState } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const colors = [
  '#12f702',
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

type Particle = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  target: THREE.Vector3
  color: string
  originalIndex: number
}

export const BrickWall = () => {
  const [isParticleMode, setIsParticleMode] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const particleMeshRefs = useRef<Record<string, THREE.InstancedMesh>>({})

  const numRows = 15
  const numColumns = 10
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

  const createParticles = () => {
    const particles: Particle[] = []

    instances.forEach((instance, index) => {
      const startPos = new THREE.Vector3(
        instance.position[0] + (Math.random() - 0.5) * 20,
        instance.position[1] + Math.random() * 10 + 5,
        instance.position[2] + (Math.random() - 0.5) * 20
      )

      particles.push({
        position: startPos.clone(),
        velocity: new THREE.Vector3(),
        target: new THREE.Vector3(...instance.position),
        color: instance.color,
        originalIndex: index,
      })
    })

    particlesRef.current = particles
  }

  const particlesByColor = useMemo(() => {
    if (!isParticleMode) return {}

    const groups: Record<string, Particle[]> = {}
    particlesRef.current.forEach((particle) => {
      if (!groups[particle.color]) {
        groups[particle.color] = []
      }
      groups[particle.color].push(particle)
    })
    return groups
  }, [isParticleMode, particlesRef.current])

  useFrame((_state, delta) => {
    if (!isParticleMode) return

    let allReached = true

    particlesRef.current.forEach((particle) => {
      const distance = particle.position.distanceTo(particle.target)

      if (distance > 0.1) {
        allReached = false

        const direction = particle.target
          .clone()
          .sub(particle.position)
          .normalize()
        const force = direction.multiplyScalar(15 * delta)
        particle.velocity.add(force)

        particle.velocity.multiplyScalar(0.95)

        particle.position.add(particle.velocity.clone().multiplyScalar(delta))
      } else {
        particle.position.copy(particle.target)
        particle.velocity.set(0, 0, 0)
      }
    })

    Object.entries(particlesByColor).forEach(([color, colorParticles]) => {
      const meshRef = particleMeshRefs.current[color]
      if (!meshRef) return

      const matrix = new THREE.Matrix4()
      colorParticles.forEach((particle, index) => {
        matrix.makeTranslation(
          particle.position.x,
          particle.position.y,
          particle.position.z
        )
        meshRef.setMatrixAt(index, matrix)
      })
      meshRef.instanceMatrix.needsUpdate = true
    })

    if (allReached && isRebuilding) {
      setTimeout(() => {
        setIsParticleMode(false)
        setIsRebuilding(false)
        console.log('✨ Wall rebuilt!')
      }, 500)
    }
  })

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f' && !isRebuilding) {
        console.log('🌟 Starting particle rebuild...')
        setIsRebuilding(true)
        createParticles()
        setIsParticleMode(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isRebuilding])

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const particleGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  return (
    <>
      <directionalLight
        position={[-10, 15, 5]}
        target-position={[0, 6, -20]}
        intensity={0.9}
        color="#9966CC"
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={25}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-2}
      />

      {/* Particle Mode - Colored cubes flying back */}
      {isParticleMode &&
        Object.entries(particlesByColor).map(([color, colorParticles]) => (
          <instancedMesh
            key={`particle-${color}`}
            ref={(ref) => {
              if (ref) particleMeshRefs.current[color] = ref
            }}
            args={[particleGeometry, materials[color], colorParticles.length]}
          />
        ))}

      {/* Normal Wall Mode */}
      {!isParticleMode &&
        Object.entries(groupedByColor).map(([color, colorInstances]) => (
          <InstancedRigidBodies
            key={color}
            instances={colorInstances}
            mass={6}
            gravityScale={0.9}
            colliders="cuboid"
            friction={0.8}
            restitution={0.01}
            canSleep={true}
            linearDamping={2.0}
            angularDamping={2.0}
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
