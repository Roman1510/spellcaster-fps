import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const ENERGY_COST = 30

interface GameStore {
  pause: boolean
  setPause: (pause: boolean) => void
  hasStarted: boolean
  setHasStarted: (hasStarted: boolean) => void

  energy: number
  maxEnergy: number
  canFire: boolean
  fireProjectile: () => boolean

  _updateCanFire: () => void
  _rechargeEnergy: () => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    pause: true,
    setPause: (pause) => {
      set({ pause })
      get()._updateCanFire()
    },
    hasStarted: false,
    setHasStarted: (hasStarted) => {
      set({ hasStarted })
      get()._updateCanFire()
    },

    energy: 100,
    maxEnergy: 100,
    canFire: false,

    fireProjectile: () => {
      const { canFire, energy } = get()
      if (!canFire) return false

      const newEnergy = Math.max(0, energy - ENERGY_COST)
      set({ energy: newEnergy })
      get()._updateCanFire()
      return true
    },

    _updateCanFire: () => {
      const { energy, hasStarted, pause } = get()
      const canFire = energy >= ENERGY_COST && hasStarted && !pause
      set({ canFire })
    },

    _rechargeEnergy: () => {
      const { energy, maxEnergy, pause, hasStarted } = get()
      if (pause || !hasStarted || energy >= maxEnergy) return

      const newEnergy = Math.min(maxEnergy, energy + 1.6)
      set({ energy: newEnergy })
      get()._updateCanFire()
    },
  }))
)

let rechargeInterval: number | null = null

useGameStore.subscribe(
  (state) => state.pause,
  (pause) => {
    const { hasStarted } = useGameStore.getState()

    if (rechargeInterval) {
      clearInterval(rechargeInterval)
      rechargeInterval = null
    }

    if (!pause && hasStarted) {
      rechargeInterval = setInterval(() => {
        useGameStore.getState()._rechargeEnergy()
      }, 100)
    }
  }
)

useGameStore.subscribe(
  (state) => state.hasStarted,
  (hasStarted) => {
    const { pause } = useGameStore.getState()

    if (rechargeInterval) {
      clearInterval(rechargeInterval)
      rechargeInterval = null
    }

    if (!pause && hasStarted) {
      rechargeInterval = setInterval(() => {
        useGameStore.getState()._rechargeEnergy()
      }, 100)
    }
  }
)

export const usePause = () => useGameStore((state) => state.pause)
export const useSetPause = () => useGameStore((state) => state.setPause)
export const useHasStarted = () => useGameStore((state) => state.hasStarted)
export const useSetHasStarted = () =>
  useGameStore((state) => state.setHasStarted)
export const useEnergy = () => useGameStore((state) => state.energy)
export const useMaxEnergy = () => useGameStore((state) => state.maxEnergy)
export const useCanFire = () => useGameStore((state) => state.canFire)
export const useFireProjectile = () =>
  useGameStore((state) => state.fireProjectile)
