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
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: PropsWithChildren) => {
  const [pause, setPause] = useState(true)

  const contextValue = useMemo(
    () => ({
      pause,
      setPause,
    }),
    [pause]
  )

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
