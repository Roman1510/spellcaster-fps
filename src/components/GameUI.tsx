import { useEffect, useState } from 'react'
import { useGame } from '../hooks/useGame'
import { useMenuNavigation } from '../hooks/useMenuNavigation'
import { useMenuAudio } from '../hooks/useMenuAudio'
import { MenuOverlay } from './Menu/MenuOverlay'
import { MenuContainer } from './Menu/MenuContainer'
import { MenuTitle } from './Menu/MenuTitle'
import { MenuOptions } from './Menu/MenuOptions'
import { MenuInstructions } from './Menu/MenuInstructions'
import { MenuStatusIndicator } from './Menu/MenuStatusIndicator'
import { MenuStyles } from './Menu/MenuStyles'

interface GameUIProps {
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
  gameTitle?: string
}

export function GameUI({
  onStart,
  onContinue,
  onRestart,
  gameTitle,
}: GameUIProps) {
  const { pause, setPause } = useGame()
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(0)

  const { playSelectSound, playHoverSound, AudioElement } = useMenuAudio()

  const handleStart = () => {
    setHasStarted(true)
    setPause(false)
    onStart()
    playSelectSound()
  }

  const handleContinue = () => {
    setPause(false)
    onContinue()
    playSelectSound()
  }

  const handleRestart = () => {
    setHasStarted(true)
    setPause(false)
    onRestart()
    playSelectSound()
  }

  const getMenuOptions = () => {
    if (!hasStarted) {
      return [{ label: 'START', action: handleStart }]
    }
    return [
      { label: 'CONTINUE', action: handleContinue },
      { label: 'RESTART', action: handleRestart },
    ]
  }

  const menuOptions = getMenuOptions()

  useMenuNavigation({
    isActive: pause,
    selectedOption,
    setSelectedOption,
    menuOptions,
    onHover: playHoverSound,
  })

  useEffect(() => {
    setSelectedOption(0)
  }, [hasStarted])

  if (!pause) return null

  return (
    <>
      <AudioElement />

      <MenuOverlay>
        <MenuContainer>
          <MenuTitle hasStarted={hasStarted} title={gameTitle} />
          <MenuOptions
            options={menuOptions}
            selectedOption={selectedOption}
            onSelect={setSelectedOption}
            onHover={playHoverSound}
          />
          <MenuInstructions hasStarted={hasStarted} />
          <MenuStatusIndicator show={!hasStarted} />
        </MenuContainer>
      </MenuOverlay>

      <MenuStyles />
    </>
  )
}
