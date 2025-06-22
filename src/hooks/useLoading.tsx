import { useContext } from 'react'
import { LoadingContext } from '../context/LoadingProvider'

function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export { useLoading }
