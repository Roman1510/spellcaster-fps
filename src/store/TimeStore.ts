import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useTowerStore } from './TowerStore'

interface TimerStore {
  timeRemaining: number
  isRunning: boolean
  hasWon: boolean
  isGameOver: boolean
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
  setHasWon: (hasWon: boolean) => void
  setIsGameOver: (isGameOver: boolean) => void
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => {
    let timerInterval: number | null = null

    return {
      timeRemaining: 45,
      isRunning: false,
      hasWon: false,

      start: () => set({ isRunning: true }),
      stop: () => set({ isRunning: false }),
      reset: () =>
        set({
          timeRemaining: 45,
          isRunning: false,
          hasWon: false,
          isGameOver: false,
        }),

      isGameOver: false,

      setIsGameOver: (isGameOver) => set({ isGameOver }),
      tick: () => {
        const { timeRemaining, isRunning } = get()
        if (isRunning && timeRemaining > 0) {
          set({ timeRemaining: Math.max(0, timeRemaining - 0.1) })
        }
        if (timeRemaining <= 0) {
          set({ isRunning: false })
        }
      },

      setHasWon: (hasWon) => set({ hasWon }),

      destroy: () => {
        if (timerInterval) {
          clearInterval(timerInterval)
          timerInterval = null
        }
      },
    }
  })
)

useTimerStore.subscribe(
  (state) => state.isRunning,
  (isRunning, previousIsRunning) => {
    const store = useTimerStore.getState()
    let timerInterval = (store as any).timerInterval

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    if (isRunning && !previousIsRunning) {
      timerInterval = setInterval(() => {
        useTimerStore.getState().tick()
      }, 100)
      ;(store as any).timerInterval = timerInterval
    }
  }
)

useTimerStore.subscribe(
  (state) => state.timeRemaining,
  (timeRemaining) => {
    if (timeRemaining <= 0) {
      const activeTowers = useTowerStore.getState().getActiveTowersCount()
      useTimerStore.getState().setIsGameOver(true)

      if (activeTowers === 0) {
        useTimerStore.getState().setHasWon(true)
      }
    }
  }
)

useTowerStore.subscribe(
  (state) => state.getActiveTowersCount(),
  (activeTowers) => {
    const { timeRemaining, isGameOver } = useTimerStore.getState()
    if (activeTowers === 0 && timeRemaining > 0 && !isGameOver) {
      useTimerStore.getState().setHasWon(true)
      useTimerStore.getState().setIsGameOver(true)
      useTimerStore.getState().stop()
      console.log('All towers destroyed before time ran out — You win!')
    }
  }
)

export const useTimeRemaining = () =>
  useTimerStore((state) => state.timeRemaining)
export const useIsTimerRunning = () => useTimerStore((state) => state.isRunning)
export const useHasWon = () => useTimerStore((state) => state.hasWon)
export const useStartTimer = () => useTimerStore((state) => state.start)
export const useStopTimer = () => useTimerStore((state) => state.stop)
export const useResetTimer = () => useTimerStore((state) => state.reset)
export const useIsGameOver = () => useTimerStore((state) => state.isGameOver)
