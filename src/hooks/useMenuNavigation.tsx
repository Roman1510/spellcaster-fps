import { useEffect } from 'react'

interface UseMenuNavigationProps {
  isActive: boolean
  selectedOption: number
  setSelectedOption: (value: number | ((prev: number) => number)) => void
  menuOptions: Array<{ label: string; action: () => void }>
  onHover?: () => void
}

export function useMenuNavigation({
  isActive,
  selectedOption,
  setSelectedOption,
  menuOptions,
  onHover,
}: UseMenuNavigationProps) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault()
          setSelectedOption((prev) =>
            prev > 0 ? prev - 1 : menuOptions.length - 1
          )
          onHover?.()
          break

        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault()
          setSelectedOption((prev) =>
            prev < menuOptions.length - 1 ? prev + 1 : 0
          )
          onHover?.()
          break

        case 'Enter':
        case ' ':
          event.preventDefault()
          menuOptions[selectedOption].action()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, selectedOption, menuOptions, setSelectedOption, onHover])
}
