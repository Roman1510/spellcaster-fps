import { Vector3 } from 'three'
import { ProjectileConfig, ExplosionConfig } from '../types/projectiles'

export const PROJECTILE_CONFIG: ProjectileConfig = {
  mass: 170,
  velocity: 200,
  friction: 0.1,
  linearDamping: 0.3,
  restitution: 0.5,
  size: 1.3,
  lifetime: 1000,
  impactDisappearTime: 50,
}

export const EXPLOSION_CONFIG: ExplosionConfig = {
  lifetime: 800,
  maxScale: 4.5,
  coreSize: 0.9,
  blastSize: 4.3,
}

export const CAMERA_OFFSET = new Vector3(0.5, -0.1, -3.6)

export const PROJECTILE_COLORS = {
  main: '#ff4400',
  emissive: '#ff1100',
  emissiveIntensity: 4,
  opacity: 0.95,
}

export const RANDOMNESS_MAGNITUDE = 0.035
export const PHYSICS_DELAY = 5
