import { useFrame } from '@react-three/fiber'
import { usePause } from '../store/GameStore'

export function useGameLoop(
  callback: (delta: number) => void,
  renderPriority?: number
) {
  const pause = usePause()

  useFrame((_state, delta) => {
    if (!pause) {
      callback(delta)
    }
  }, renderPriority)
}
