import { useEffect, useState } from 'react'

interface KeyboardState {
  [key: string]: boolean
}

export function usePhysicalKeyboard() {
  const [keys, setKeys] = useState<KeyboardState>({})

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [event.code]: true }))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [event.code]: false }))
    }

    const handleBlur = () => {
      setKeys({})
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return keys
}
