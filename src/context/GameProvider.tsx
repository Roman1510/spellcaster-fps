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
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [pause, setPause] = useState(true) // Start paused
  const [hasStarted, setHasStarted] = useState(false)

  const contextValue = useMemo(
    () => ({
      pause,
      setPause,
      hasStarted,
      setHasStarted,
    }),
    [pause, hasStarted]
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
