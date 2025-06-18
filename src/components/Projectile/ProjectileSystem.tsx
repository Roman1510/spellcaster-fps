import { useCallback } from 'react'
import { Vector3 } from 'three'
import { useProjectiles } from './hooks/use-projectiles'
import { useExplosions } from './hooks/use-explosion'
import { useProjectileInput } from './hooks/use-projectile-input'
import { ProjectileRenderer } from './ProjectileRenderer'
import { ExplosionRenderer } from './ExplosionRenderer'
import { ProjectileData } from './types/projectiles'

export const ProjectileSystem = () => {
  const {
    projectiles,
    addProjectile,
    markProjectileImpacted,
    getProjectileRigidBody,
    setProjectileRef,
  } = useProjectiles()

  const { explosions, createExplosion, registerGeometry } = useExplosions({
    defaultForce: 20,
    defaultRadius: 10,
    maxExplosions: 5,
  })

  const handleProjectileImpact = useCallback(
    (projectileId: string) => {
      markProjectileImpacted(projectileId)

      const rigidBody = getProjectileRigidBody(projectileId)
      const worldPos = rigidBody?.translation()
      const velocity = rigidBody?.linvel()

      if (worldPos) {
        createExplosion({
          position: new Vector3(worldPos.x, worldPos.y, worldPos.z),
          velocity: velocity
            ? new Vector3(velocity.x, velocity.y, velocity.z)
            : undefined,
          force: 5,
        })
      }
    },
    [markProjectileImpacted, getProjectileRigidBody, createExplosion]
  )

  const handleProjectileCreate = useCallback(
    ({
      id,
      position,
      direction,
    }: {
      id: string
      position: Vector3
      direction: Vector3
    }) => {
      const projectileData: ProjectileData = {
        id,
        mesh: (
          <ProjectileRenderer
            key={id}
            id={id}
            position={position}
            direction={direction}
            onCollision={handleProjectileImpact}
            setRef={setProjectileRef}
          />
        ),
        direction: direction.clone(),
        createdAt: Date.now(),
        position: position.clone(),
      }

      addProjectile(projectileData)
    },
    [addProjectile, handleProjectileImpact, setProjectileRef]
  )

  useProjectileInput({ onProjectileCreate: handleProjectileCreate })

  return (
    <>
      {/* Render projectiles */}
      {projectiles.map((proj) => proj.mesh)}

      {/* Render explosions - updated to pass registerGeometry */}
      {explosions.map((explosion) => (
        <ExplosionRenderer
          key={explosion.id}
          explosion={explosion}
          registerGeometry={registerGeometry} // Pass the geometry registration function
        />
      ))}
    </>
  )
}
