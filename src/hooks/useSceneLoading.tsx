import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { useLoading } from './useLoading'

export function useSceneLoading() {
  const { setLoading, setProgress, setMessage } = useLoading()
  const { progress, loaded, total, active } = useProgress()
  const checkStarted = useRef(false)
  const fallbackTriggered = useRef(false)

  useEffect(() => {
    if (!checkStarted.current) {
      checkStarted.current = true

      setTimeout(() => {
        if (total === 0 && !fallbackTriggered.current) {
          fallbackTriggered.current = true
          startFallbackLoading()
        }
      }, 500)
    }

    if (total > 0) {
      const progressPercent = (loaded / total) * 100
      setProgress(progressPercent)

      if (progressPercent < 30) {
        setMessage('Loading models...')
      } else if (progressPercent < 60) {
        setMessage('Loading textures...')
      } else if (progressPercent < 90) {
        setMessage('Preparing physics...')
      } else if (progressPercent < 100) {
        setMessage('Finalizing...')
      } else {
        setMessage('Ready to start!')
        setTimeout(() => {
          setLoading(false)
        }, 300)
      }
    }
  }, [progress, loaded, total, active, setProgress, setMessage, setLoading])

  const startFallbackLoading = () => {
    setProgress(20)
    setMessage('Loading models...')

    setTimeout(() => {
      setProgress(50)
      setMessage('Loading textures...')
    }, 200)

    setTimeout(() => {
      setProgress(80)
      setMessage('Preparing physics...')
    }, 600)

    setTimeout(() => {
      setProgress(100)
      setMessage('Ready to start!')
      setTimeout(() => {
        setLoading(false)
      }, 250)
    }, 1000)
  }
}
