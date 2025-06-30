import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface TowerState {
  id: number
  position: { x: number; y: number; z: number }
  totalBricks: number
  fallenBricks: Set<string>
  demolitionPercentage: number
  isDestroyed: boolean
}

interface TowerStore {
  towers: TowerState[]
  initializeTowers: (
    positions: { x: number; y: number; z: number }[],
    bricksPerTower: number
  ) => void
  addFallenBrick: (towerId: number, brickId: string) => void
  getTowerDemolition: (towerId: number) => number
  getActiveTowersCount: () => number
  resetTowers: () => void
}

export const useTowerStore = create<TowerStore>()(
  subscribeWithSelector((set, get) => ({
    towers: [],
    initializeTowers: (positions, bricksPerTower) => {
      const towers = positions.map((pos, index) => ({
        id: index,
        position: pos,
        totalBricks: bricksPerTower,
        fallenBricks: new Set<string>(),
        demolitionPercentage: 0,
        isDestroyed: false,
      }))
      set({ towers })
      console.log(
        `Initialized ${towers.length} towers with ${bricksPerTower} bricks each at positions:`,
        positions
      )
      console.log('Initial tower state:', towers)
    },

    addFallenBrick: (towerId, brickId) => {
      set((state) => {
        const towers = [...state.towers]
        const towerIndex = towers.findIndex((t) => t.id === towerId)

        if (towerIndex === -1) {
          console.log(`Tower ${towerId} not found`)
          return state
        }

        const tower = towers[towerIndex]
        if (tower.isDestroyed) {
          return state
        }
        if (tower.fallenBricks.has(brickId)) {
          return state
        }

        const newFallenBricks = new Set(tower.fallenBricks)
        newFallenBricks.add(brickId)
        const demolitionPercent = Math.min(
          100,
          Math.floor((newFallenBricks.size / tower.totalBricks) * 100)
        )

        const isNowDestroyed = demolitionPercent >= 22 //just because it's ok number :D

        towers[towerIndex] = {
          ...tower,
          fallenBricks: newFallenBricks,
          demolitionPercentage: demolitionPercent,
          isDestroyed: isNowDestroyed,
        }

        return { towers }
      })
    },

    getTowerDemolition: (towerId) => {
      const tower = get().towers.find((t) => t.id === towerId)
      return tower?.demolitionPercentage || 0
    },

    getActiveTowersCount: () => {
      const activeCount = get().towers.filter((t) => !t.isDestroyed).length

      return activeCount
    },

    resetTowers: () => {
      set((state) => {
        return {
          towers: state.towers.map((tower) => ({
            ...tower,
            fallenBricks: new Set<string>(),
            demolitionPercentage: 0,
            isDestroyed: false,
          })),
        }
      })
    },
  }))
)

export const useTowers = () => useTowerStore((state) => state.towers)
export const useInitializeTowers = () =>
  useTowerStore((state) => state.initializeTowers)
export const useAddFallenBrick = () =>
  useTowerStore((state) => state.addFallenBrick)
export const useResetTowers = () => useTowerStore((state) => state.resetTowers)
export const useGetTowerDemolition = () =>
  useTowerStore((state) => state.getTowerDemolition)
export const useGetActiveTowersCount = () =>
  useTowerStore((state) => state.getActiveTowersCount)
