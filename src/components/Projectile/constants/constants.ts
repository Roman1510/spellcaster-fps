import { Vector3 } from 'three'
import { ProjectileConfig, ExplosionConfig } from '../types/projectiles'

export const PROJECTILE_CONFIG: ProjectileConfig = {
  mass: 170,
  velocity: 200,
  friction: 0.05,
  linearDamping: 0.3,
  restitution: 0.5,
  size: 1.3,
  lifetime: 1500,
  impactDisappearTime: 170,
}

export const EXPLOSION_CONFIG: ExplosionConfig = {
  lifetime: 1200,
  maxScale: 4.5,
  coreSize: 0.9,
  blastSize: 4.0,
}

export const CAMERA_OFFSET = new Vector3(0.5, -0.1, -3.6)

export const TRAIL_CONFIG = {
  width: 2,
  length: 2,
  color: '#ff3300',
}

export const PROJECTILE_COLORS = {
  main: '#ff4400',
  emissive: '#ff1100',
  emissiveIntensity: 4,
  opacity: 0.95,
}

export const RANDOMNESS_MAGNITUDE = 0.03
export const PHYSICS_DELAY = 5
