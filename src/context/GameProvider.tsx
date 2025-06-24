import {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  PropsWithChildren,
} from 'react'

export type GameContextType = {
  pause: boolean
  setPause: Dispatch<SetStateAction<boolean>>
  hasStarted: boolean
  setHasStarted: Dispatch<SetStateAction<boolean>>

  energy: number
  maxEnergy: number
  canFire: boolean
  fireProjectile: () => boolean
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [pause, setPause] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [energy, setEnergy] = useState(100)

  const maxEnergy = 100
  const energyCost = 50
  const rechargeRate = 16

  const canFire = useMemo(
    () => energy >= energyCost && hasStarted && !pause,
    [energy, hasStarted, pause]
  )

  useEffect(() => {
    if (pause || !hasStarted) return

    const interval = setInterval(() => {
      setEnergy((prevEnergy) => {
        if (prevEnergy < maxEnergy) {
          return Math.min(maxEnergy, prevEnergy + rechargeRate / 10)
        }
        return prevEnergy
      })
    }, 100)

    return () => clearInterval(interval)
  }, [pause, hasStarted, maxEnergy, rechargeRate])

  const fireProjectile = useCallback(() => {
    if (!canFire) return false
    console.log('fired')
    setEnergy((prevEnergy) => Math.max(0, prevEnergy - energyCost))
    return true
  }, [canFire])

  const contextValue = useMemo(
    () => ({
      pause,
      setPause,
      hasStarted,
      setHasStarted,
      energy,
      maxEnergy,
      canFire,
      fireProjectile,
    }),
    [pause, hasStarted, energy, maxEnergy, canFire, fireProjectile]
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
