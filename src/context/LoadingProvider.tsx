import { createContext, useState, ReactNode, useMemo } from 'react'

export interface LoadingContextType {
  isLoading: boolean
  loadingProgress: number
  loadingMessage: string
  setLoading: (loading: boolean) => void
  setProgress: (progress: number) => void
  setMessage: (message: string) => void
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
)

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState(
    'Initializing systems...'
  )

  const setLoading = (loading: boolean) => setIsLoading(loading)
  const setProgress = (progress: number) => setLoadingProgress(progress)
  const setMessage = (message: string) => setLoadingMessage(message)

  const memoizedValue = useMemo(
    () => ({
      isLoading,
      loadingProgress,
      loadingMessage,
      setLoading,
      setProgress,
      setMessage,
    }),
    [isLoading, loadingProgress, loadingMessage]
  )

  return (
    <LoadingContext.Provider value={memoizedValue}>
      {children}
    </LoadingContext.Provider>
  )
}
