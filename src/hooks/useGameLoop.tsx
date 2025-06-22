import { useFrame } from '@react-three/fiber'
import { useGame } from './useGame'

export function useGameLoop(
  callback: (delta: number) => void,
  renderPriority?: number
) {
  const { pause } = useGame()

  useFrame((_state, delta) => {
    if (!pause) {
      callback(delta)
    }
  }, renderPriority)
}
