import { Vector3 } from 'three'
import { RANDOMNESS_MAGNITUDE } from '../constants/constants'

export const addRandomness = (
  vec: Vector3,
  magnitude: number = RANDOMNESS_MAGNITUDE
): void => {
  vec.x += (Math.random() - 0.5) * magnitude
  vec.y += (Math.random() - 0.5) * magnitude
  vec.z += (Math.random() - 0.5) * magnitude
}

export const generateProjectileId = (): string => {
  return `projectile-${Date.now()}-${Math.random()}`
}

export const generateExplosionId = (): string => {
  return `explosion-${Date.now()}-${Math.random()}`
}

export const calculateExplosionProperties = (age: number) => {
  const scale = 1 + age * 2
  const opacity = Math.max(0, 1 - age * 1.4)

  return {
    scale,
    opacity,
    coreColor: `hsl(${30 + Math.sin(age * 15) * 10}, 100%, ${75 - age * 30}%)`,
    emissiveColor: `hsl(${25 + Math.sin(age * 18) * 8}, 100%, ${
      50 - age * 25
    }%)`,
    emissiveIntensity: 2.5 - age * 1.5,
    blastColor: `hsl(${15 + Math.sin(age * 12) * 8}, 100%, ${60 - age * 30}%)`,
    smokeColor: `hsl(${25 + Math.sin(age * 8) * 5}, ${40 - age * 30}%, ${
      20 + age * 15
    }%)`,
  }
}
