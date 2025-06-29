import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface TimerStore {
  timeRemaining: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => ({
    timeRemaining: 10,
    isRunning: false,

    start: () => set({ isRunning: true }),
    stop: () => set({ isRunning: false }),
    reset: () => set({ timeRemaining: 10, isRunning: false }),

    tick: () => {
      const { timeRemaining, isRunning } = get()
      if (isRunning && timeRemaining > 0) {
        set({ timeRemaining: Math.max(0, timeRemaining - 0.1) })
      }
      if (timeRemaining <= 0) {
        set({ isRunning: false })
      }
    },
  }))
)

let timerInterval: number | null = null

useTimerStore.subscribe(
  (state) => state.isRunning,
  (isRunning) => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    if (isRunning) {
      timerInterval = setInterval(() => {
        useTimerStore.getState().tick()
      }, 100)
    }
  }
)

export const useTimeRemaining = () =>
  useTimerStore((state) => state.timeRemaining)
export const useIsTimerRunning = () => useTimerStore((state) => state.isRunning)
export const useStartTimer = () => useTimerStore((state) => state.start)
export const useStopTimer = () => useTimerStore((state) => state.stop)
export const useResetTimer = () => useTimerStore((state) => state.reset)
