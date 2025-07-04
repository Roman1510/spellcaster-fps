import { useCallback, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { CAMERA_OFFSET } from '../constants/constants'
import { addRandomness, generateProjectileId } from '../utils/projectileHelpers'
import { useCanFire, useFireProjectile } from '../../../store/GameStore'

interface UseProjectileInputProps {
  onProjectileCreate: (projectileData: {
    id: string
    position: Vector3
    direction: Vector3
  }) => void
}

export const useProjectileInput = ({
  onProjectileCreate,
}: UseProjectileInputProps) => {
  const { camera } = useThree()
  const canFire = useCanFire()
  const fireProjectile = useFireProjectile()
  const position = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const offset = useMemo(() => CAMERA_OFFSET, [])

  const handleClick = useCallback(() => {
    if (document.pointerLockElement && camera) {
      camera.getWorldPosition(position)
      camera.getWorldDirection(direction)

      addRandomness(direction)
      direction.normalize()

      const projectileStartPosition = position
        .clone()
        .add(offset.clone().applyQuaternion(camera.quaternion))

      const projectileId = generateProjectileId()

      if (canFire) {
        onProjectileCreate({
          id: projectileId,
          position: projectileStartPosition,
          direction: direction.clone(),
        })
        fireProjectile()
      }
    }
  }, [
    camera,
    position,
    direction,
    offset,
    onProjectileCreate,
    canFire,
    fireProjectile,
  ])

  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [handleClick])

  return { handleClick }
}
