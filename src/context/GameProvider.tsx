import {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
  useMemo,
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
  setEnergy: Dispatch<SetStateAction<number>>
  setCanFire: Dispatch<SetStateAction<boolean>>
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [pause, setPause] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [energy, setEnergy] = useState(100)
  const maxEnergy = 100
  const [canFire, setCanFire] = useState(true)

  const contextValue = useMemo(
    () => ({
      pause,
      setPause,
      hasStarted,
      setHasStarted,
      energy,
      setEnergy,
      maxEnergy,
      canFire,
      setCanFire,
    }),
    [pause, hasStarted, canFire, energy]
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
