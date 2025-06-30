import { useMemo, useRef, useEffect, useState } from 'react'
import { InstancedRigidBodies } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Vector3,
} from 'three'
import {
  useAddFallenBrick,
  useInitializeTowers,
  useTowers,
  useResetTowers,
} from '../store/TowerStore'
import { useResetTimer, useStartTimer } from '../store/TimeStore'
import { useSound } from '../hooks/useSound'

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
  position: Vector3
  velocity: Vector3
  target: Vector3
  color: string
  originalIndex: number
  wallIndex: number
}

type WallPosition = {
  x: number
  y: number
  z: number
}

interface SingleTowerProps {
  position: WallPosition
  towerId: number
  numRows: number
  numColumns: number
  numDepth: number
  boxSize: number
}

const SingleTower = ({
  position,
  towerId,
  numRows,
  numColumns,
  numDepth,
  boxSize,
}: SingleTowerProps) => {
  const [isParticleMode, setIsParticleMode] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const addFallenBrick = useAddFallenBrick()
  const resetTowers = useResetTowers()
  const resetTimer = useResetTimer()
  const startTimer = useStartTimer()
  const { restartBackgroundMusic } = useSound()
  const towers = useTowers()
  const isDestroyed = towers.find((t) => t.id === towerId)?.isDestroyed || false
  const particlesRef = useRef<Particle[]>([])
  const particleMeshRefs = useRef<Record<string, InstancedMesh>>({})
  const instancedMeshRefs = useRef<Record<string, InstancedMesh>>({})
  const originalPositions = useRef<Map<number, Vector3>>(new Map())
  const lastCheckTime = useRef(0)
  const trackedBricks = useRef<Set<string>>(new Set())
  const initialCheckDelay = useRef(true)
  const lastKeyPress = useRef(0)
  const rebuildStabilization = useRef(true)

  const { instances, materials } = useMemo(() => {
    const brickInstances: BrickInstance[] = []
    const materialMap: Record<string, MeshBasicMaterial> = {}

    colors.forEach((color) => {
      materialMap[color] = new MeshBasicMaterial({ color })
    })

    const bricksPerTower = numRows * numColumns * numDepth
    let instanceId = 0

    for (let i = 0; i < bricksPerTower; i++) {
      const depth = Math.floor(i / (numRows * numColumns))
      const row = Math.floor((i % (numRows * numColumns)) / numColumns)
      const col = i % numColumns

      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const brickPos: [number, number, number] = [
        position.x + (col * boxSize - (numColumns * boxSize) / 2 + boxSize / 2),
        position.y + (row * boxSize + boxSize / 2),
        position.z + (depth * boxSize - (numDepth * boxSize) / 2 + boxSize / 2),
      ]

      originalPositions.current.set(instanceId, new Vector3(...brickPos))

      brickInstances.push({
        key: instanceId++,
        position: brickPos,
        rotation: [0, 0, 0],
        color: randomColor,
        wallIndex: towerId,
      })
    }

    return { instances: brickInstances, materials: materialMap }
  }, [position, towerId, numRows, numColumns, numDepth, boxSize])

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
        const startPos = new Vector3(
          instance.position[0] + (Math.random() - 0.5) * 30,
          instance.position[1] + Math.random() * 15 + 10,
          instance.position[2] + (Math.random() - 0.5) * 30
        )

        particles.push({
          position: startPos,
          velocity: new Vector3(),
          target: new Vector3(...instance.position),
          color: instance.color,
          originalIndex: index,
          wallIndex: instance.wallIndex,
        })
      })

      particlesRef.current = particles
      trackedBricks.current.clear()
      console.log(
        `Tower ${towerId}: Created ${particles.length} particles for rebuild`
      )
    }
  }, [instances, towerId])

  const particlesByColor = useMemo(() => {
    if (!isParticleMode) return {}

    const groups: Record<string, Particle[]> = {}
    particlesRef.current.forEach((particle) =>
      (groups[particle.color] ??= []).push(particle)
    )

    return groups
  }, [isParticleMode])

  const geometry = useMemo(
    () => new BoxGeometry(boxSize, boxSize, boxSize),
    [boxSize]
  )

  const checkFallenBricks = () => {
    if (isParticleMode || isDestroyed || rebuildStabilization.current) return
    const matrix = new Matrix4()
    const pos = new Vector3()

    Object.entries(groupedByColor).forEach(([color, colorInstances]) => {
      const mesh = instancedMeshRefs.current[color]
      if (!mesh || !mesh.instanceMatrix) {
        return
      }

      colorInstances.forEach((instance, i) => {
        if (i >= mesh.count) return

        mesh.getMatrixAt(i, matrix)
        pos.setFromMatrixPosition(matrix)

        const originalPos = originalPositions.current.get(instance.key)
        if (originalPos) {
          const distance = pos.distanceTo(originalPos)
          const brickId = `${towerId}-${instance.key}`

          if (
            (distance > 20 || pos.y < position.y - boxSize * 4) &&
            !trackedBricks.current.has(brickId)
          ) {
            trackedBricks.current.add(brickId)
            addFallenBrick(towerId, brickId)
          }
        }
      })
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      resetTowers()
      resetTimer()
    }, 0)

    return () => clearTimeout(timer)
  }, [resetTowers, resetTimer])

  useFrame((state) => {
    if (initialCheckDelay.current) {
      if (state.clock.elapsedTime > 5) {
        initialCheckDelay.current = false
        rebuildStabilization.current = false
      }
      return
    }

    if (!isParticleMode && !isDestroyed) {
      const now = state.clock.elapsedTime
      if (now - lastCheckTime.current > 0.5) {
        lastCheckTime.current = now
        checkFallenBricks()
      }
    }
  })

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

    const matrix = new Matrix4()
    Object.entries(particlesByColor).forEach(([color, colorParticles]) => {
      const meshRef = particleMeshRefs.current[color]
      if (!meshRef) {
        return
      }

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
        particlesRef.current = []
        trackedBricks.current.clear()
        rebuildStabilization.current = true
        setTimeout(() => {
          startTimer()

          rebuildStabilization.current = false
        }, 1000)

        Object.entries(groupedByColor).forEach(([color, colorInstances]) => {
          const mesh = instancedMeshRefs.current[color]
          if (mesh && mesh.instanceMatrix) {
            colorInstances.forEach((instance, i) => {
              const originalPos = originalPositions.current.get(instance.key)
              if (originalPos) {
                const matrix = new Matrix4().setPosition(originalPos)
                mesh.setMatrixAt(i, matrix)
              }
            })
            mesh.instanceMatrix.needsUpdate = true
          }
        })
      }, 500)
    }
  })

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const now = Date.now()
      if (
        event.key.toLowerCase() === 'f' &&
        !isRebuilding &&
        now - lastKeyPress.current > 500
      ) {
        lastKeyPress.current = now

        resetTowers()
        resetTimer()
        restartBackgroundMusic()
        setIsRebuilding(true)
        createParticles()
        setIsParticleMode(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    isRebuilding,
    createParticles,
    towerId,
    resetTowers,
    resetTimer,
    startTimer,
    restartBackgroundMusic,
  ])

  return (
    <>
      {isParticleMode &&
        Object.entries(particlesByColor).map(([color, colorParticles]) => (
          <instancedMesh
            key={`particle-${towerId}-${color}`}
            ref={(ref) => {
              if (ref) {
                particleMeshRefs.current[color] = ref
              }
            }}
            args={[geometry, materials[color], colorParticles.length]}
          />
        ))}

      {!isParticleMode && (
        <group>
          {Object.entries(groupedByColor).map(([color, colorInstances]) => (
            <InstancedRigidBodies
              key={`${towerId}-${color}`}
              instances={colorInstances}
              mass={0.6}
              gravityScale={0.9}
              colliders="cuboid"
              friction={0.3}
              restitution={0.01}
              canSleep={true}
              linearDamping={2}
              angularDamping={2}
            >
              <instancedMesh
                frustumCulled={false}
                ref={(ref) => {
                  if (ref) instancedMeshRefs.current[color] = ref
                }}
                args={[geometry, materials[color], colorInstances.length]}
              />
            </InstancedRigidBodies>
          ))}
        </group>
      )}
    </>
  )
}

interface TowerProps {
  wallPositions?: WallPosition[]
}

export const Tower = ({
  wallPositions = [{ x: 0, y: 0, z: 0 }],
}: TowerProps) => {
  const numRows = 7
  const numColumns = 3
  const numDepth = 3
  const boxSize = 2
  const bricksPerTower = numRows * numColumns * numDepth
  const initializeTowers = useInitializeTowers()

  useEffect(() => {
    initializeTowers(wallPositions, bricksPerTower)
  }, [wallPositions, bricksPerTower, initializeTowers])

  return (
    <>
      {wallPositions.map((position, index) => (
        <SingleTower
          key={index}
          position={position}
          towerId={index}
          numRows={numRows}
          numColumns={numColumns}
          numDepth={numDepth}
          boxSize={boxSize}
        />
      ))}
    </>
  )
}

export default Tower
